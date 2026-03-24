import { toNumber } from '@/lib/utils';
import { ensureSupabaseConfigured, storageBucket, supabase } from '@/services/supabase';
import type {
  Category,
  LinkedStockInput,
  Modifier,
  ModifierGroupListItem,
  ModifierListItem,
  ModifierPayload,
  ProductImageAsset,
  ProductListItem,
  ProductModifierGroup,
  ProductPayload,
  ProductStockLink,
  ModifierGroupPayload,
} from '@/types/models';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type ProductCategoryLinkRow = {
  categories: Category | Category[] | null;
  product_id: string;
};

type ProductModifierLinkRow = {
  modifiers: Modifier | Modifier[] | null;
  product_id: string;
};

type ProductStockLinkRow = {
  product_id: string;
  quantity_used: number;
  stock_items:
    | {
        id: string;
        name: string;
        type: 'product' | 'ingredient' | 'complement';
        unit: string;
      }
    | {
        id: string;
        name: string;
        type: 'product' | 'ingredient' | 'complement';
        unit: string;
      }[]
    | null;
};

type ModifierStockLinkRow = {
  modifier_id: string;
  quantity_used: number;
  stock_items:
    | {
        id: string;
        name: string;
        type: 'product' | 'ingredient' | 'complement';
        unit: string;
      }
    | {
        id: string;
        name: string;
        type: 'product' | 'ingredient' | 'complement';
        unit: string;
      }[]
    | null;
};

type ModifierGroupRow = {
  active: boolean;
  created_at: string;
  id: string;
  max_select: number;
  min_select: number;
  modifier_group_items:
    | {
        modifiers: Modifier | Modifier[] | null;
      }[]
    | null;
  name: string;
  required: boolean;
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeModifierGroup(row: ModifierGroupRow): ProductModifierGroup {
  const normalizedModifiers = (row.modifier_group_items ?? [])
    .map((item) => getSingleRelation(item.modifiers))
    .filter((modifier): modifier is Modifier => Boolean(modifier))
    .map((modifier) => ({
      ...modifier,
      price: toNumber(modifier.price),
    }));

  return {
    active: row.active,
    created_at: row.created_at,
    id: row.id,
    max_select: toNumber(row.max_select),
    min_select: toNumber(row.min_select),
    modifiers: normalizedModifiers,
    name: row.name,
    required: row.required,
  };
}

function mapStockLinks(rows: ProductStockLinkRow[] | ModifierStockLinkRow[]) {
  return rows
    .map((row) => {
      const stockItem = getSingleRelation(row.stock_items);

      if (!stockItem) {
        return null;
      }

      return {
        quantityUsed: toNumber(row.quantity_used),
        stockItemId: stockItem.id,
        stockItemName: stockItem.name,
        stockItemType: stockItem.type,
        unit: stockItem.unit,
      } satisfies ProductStockLink;
    })
    .filter(Boolean) as ProductStockLink[];
}

async function syncProductCategories(productId: string, categoryIds: string[]) {
  const { error: deleteError } = await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    throw deleteError;
  }

  if (!categoryIds.length) {
    return;
  }

  const { error: insertError } = await supabase
    .from('product_categories')
    .insert(categoryIds.map((categoryId) => ({ category_id: categoryId, product_id: productId })));

  if (insertError) {
    throw insertError;
  }
}

async function syncProductModifiers(productId: string, modifierIds: string[]) {
  const { error: deleteError } = await supabase
    .from('product_modifiers')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    throw deleteError;
  }

  if (!modifierIds.length) {
    return;
  }

  const { error: insertError } = await supabase
    .from('product_modifiers')
    .insert(modifierIds.map((modifierId) => ({ modifier_id: modifierId, product_id: productId })));

  if (insertError) {
    throw insertError;
  }
}

async function syncProductStock(productId: string, stockLinks: LinkedStockInput[]) {
  const { error: deleteError } = await supabase
    .from('product_stock')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    throw deleteError;
  }

  if (!stockLinks.length) {
    return;
  }

  const { error: insertError } = await supabase.from('product_stock').insert(
    stockLinks.map((link) => ({
      product_id: productId,
      quantity_used: link.quantityUsed,
      stock_item_id: link.stockItemId,
    }))
  );

  if (insertError) {
    throw insertError;
  }
}

async function syncModifierGroupItems(groupId: string, modifierIds: string[]) {
  const { error: deleteError } = await supabase
    .from('modifier_group_items')
    .delete()
    .eq('group_id', groupId);

  if (deleteError) {
    throw deleteError;
  }

  if (!modifierIds.length) {
    return;
  }

  const { error: insertError } = await supabase
    .from('modifier_group_items')
    .insert(modifierIds.map((modifierId) => ({ group_id: groupId, modifier_id: modifierId })));

  if (insertError) {
    throw insertError;
  }
}

async function syncModifierStock(modifierId: string, stockLinks: LinkedStockInput[]) {
  const { error: deleteError } = await supabase
    .from('modifier_stock')
    .delete()
    .eq('modifier_id', modifierId);

  if (deleteError) {
    throw deleteError;
  }

  if (!stockLinks.length) {
    return;
  }

  const { error: insertError } = await supabase.from('modifier_stock').insert(
    stockLinks.map((link) => ({
      modifier_id: modifierId,
      quantity_used: link.quantityUsed,
      stock_item_id: link.stockItemId,
    }))
  );

  if (insertError) {
    throw insertError;
  }
}

export const menuService = {
  async getCategories() {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.from('categories').select('*').order('name');

    if (error) {
      throw error;
    }

    return (data ?? []) as Category[];
  },

  async getProducts() {
    ensureSupabaseConfigured();

    const [
      { data: products, error: productsError },
      { data: categoryLinks, error: categoryLinksError },
      { data: modifierLinks, error: modifierLinksError },
      { data: stockLinks, error: stockLinksError },
    ] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_categories').select('product_id, categories(id, name)'),
      supabase.from('product_modifiers').select(
        `
          product_id,
          modifiers (
            id,
            name,
            price,
            type,
            active,
            created_at
          )
        `
      ),
      supabase.from('product_stock').select(
        'product_id, quantity_used, stock_items(id, name, unit, type)'
      ),
    ]);

    if (productsError) {
      throw productsError;
    }

    if (categoryLinksError) {
      throw categoryLinksError;
    }

    if (modifierLinksError) {
      throw modifierLinksError;
    }

    if (stockLinksError) {
      throw stockLinksError;
    }

    const categoriesByProduct = new Map<string, Category[]>();
    const directModifiersByProduct = new Map<string, Modifier[]>();
    const stockByProduct = new Map<string, ProductStockLink[]>();

    for (const link of (categoryLinks ?? []) as ProductCategoryLinkRow[]) {
      const category = getSingleRelation(link.categories);

      if (!category) {
        continue;
      }

      const bucket = categoriesByProduct.get(link.product_id) ?? [];
      bucket.push(category);
      categoriesByProduct.set(link.product_id, bucket);
    }

    for (const link of (modifierLinks ?? []) as ProductModifierLinkRow[]) {
      const modifier = getSingleRelation(link.modifiers);

      if (!modifier) {
        continue;
      }

      const bucket = directModifiersByProduct.get(link.product_id) ?? [];
      bucket.push({
        ...modifier,
        price: toNumber(modifier.price),
      });
      directModifiersByProduct.set(link.product_id, bucket);
    }

    for (const link of (stockLinks ?? []) as ProductStockLinkRow[]) {
      const bucket = stockByProduct.get(link.product_id) ?? [];
      const normalizedLinks = mapStockLinks([link]);
      stockByProduct.set(link.product_id, [...bucket, ...normalizedLinks]);
    }

    return ((products ?? []) as ProductListItem[]).map((product) => ({
      ...product,
      categories: categoriesByProduct.get(product.id) ?? [],
      directModifiers: directModifiersByProduct.get(product.id) ?? [],
      price: toNumber(product.price),
      stockLinks: stockByProduct.get(product.id) ?? [],
    }));
  },

  async getModifiers() {
    ensureSupabaseConfigured();

    const [{ data: modifiers, error: modifiersError }, { data: stockLinks, error: stockLinksError }] =
      await Promise.all([
        supabase.from('modifiers').select('*').order('name'),
        supabase.from('modifier_stock').select(
          'modifier_id, quantity_used, stock_items(id, name, unit, type)'
        ),
      ]);

    if (modifiersError) {
      throw modifiersError;
    }

    if (stockLinksError) {
      throw stockLinksError;
    }

    const stockByModifier = new Map<string, ProductStockLink[]>();

    for (const link of (stockLinks ?? []) as ModifierStockLinkRow[]) {
      const bucket = stockByModifier.get(link.modifier_id) ?? [];
      stockByModifier.set(link.modifier_id, [...bucket, ...mapStockLinks([link])]);
    }

    return ((modifiers ?? []) as Modifier[]).map((modifier) => ({
      ...modifier,
      price: toNumber(modifier.price),
      stockLinks: stockByModifier.get(modifier.id) ?? [],
    })) as ModifierListItem[];
  },

  async getModifierGroups() {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.from('modifier_groups').select(
      `
        id,
        name,
        min_select,
        max_select,
        required,
        active,
        created_at,
        modifier_group_items (
          modifiers (
            id,
            name,
            price,
            type,
            active,
            created_at
          )
        )
      `
    );

    if (error) {
      throw error;
    }

    return ((data ?? []) as ModifierGroupRow[]).map(
      (group) =>
        ({
          ...normalizeModifierGroup(group),
        }) as ModifierGroupListItem
    );
  },

  async uploadProductImage(asset: ProductImageAsset, productName: string) {
    ensureSupabaseConfigured();
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    const extension = asset.fileName?.split('.').pop() || asset.mimeType?.split('/').pop() || 'jpg';
    const filePath = `products/${slugify(productName)}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from(storageBucket).upload(filePath, arrayBuffer, {
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: true,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  async createProduct(payload: ProductPayload) {
    ensureSupabaseConfigured();
    const imageUrl = payload.image
      ? await this.uploadProductImage(payload.image, payload.name)
      : payload.imageUrl ?? null;

    const { data, error } = await supabase
      .from('products')
      .insert({
        active: payload.active,
        description: payload.description || null,
        image_url: imageUrl,
        name: payload.name,
        price: payload.price,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await Promise.all([
      syncProductCategories(data.id, payload.categoryIds),
      syncProductModifiers(data.id, payload.modifierIds),
      syncProductStock(data.id, payload.stockLinks),
    ]);

    return data;
  },

  async updateProduct(productId: string, payload: ProductPayload) {
    ensureSupabaseConfigured();
    const imageUrl = payload.image
      ? await this.uploadProductImage(payload.image, payload.name)
      : payload.imageUrl ?? null;

    const { data, error } = await supabase
      .from('products')
      .update({
        active: payload.active,
        description: payload.description || null,
        image_url: imageUrl,
        name: payload.name,
        price: payload.price,
      })
      .eq('id', productId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await Promise.all([
      syncProductCategories(productId, payload.categoryIds),
      syncProductModifiers(productId, payload.modifierIds),
      syncProductStock(productId, payload.stockLinks),
    ]);

    return data;
  },

  async deleteProduct(productId: string) {
    ensureSupabaseConfigured();
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError) {
      throw productError;
    }

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .update({
        name: product.name,
        product_id: null,
      })
      .eq('product_id', productId);

    if (orderItemsError) {
      throw orderItemsError;
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      throw error;
    }
  },

  async createModifier(payload: ModifierPayload) {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
      .from('modifiers')
      .insert({
        active: payload.active,
        name: payload.name,
        price: payload.price,
        type: payload.type,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await syncModifierStock(data.id, payload.stockLinks);
    return data;
  },

  async updateModifier(modifierId: string, payload: ModifierPayload) {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
      .from('modifiers')
      .update({
        active: payload.active,
        name: payload.name,
        price: payload.price,
        type: payload.type,
      })
      .eq('id', modifierId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await syncModifierStock(modifierId, payload.stockLinks);
    return data;
  },

  async deleteModifier(modifierId: string) {
    ensureSupabaseConfigured();
    const { data: modifier, error: modifierError } = await supabase
      .from('modifiers')
      .select('id, name')
      .eq('id', modifierId)
      .single();

    if (modifierError) {
      throw modifierError;
    }

    const { error: groupItemsError } = await supabase
      .from('modifier_group_items')
      .delete()
      .eq('modifier_id', modifierId);

    if (groupItemsError) {
      throw groupItemsError;
    }

    const { error: productModifiersError } = await supabase
      .from('product_modifiers')
      .delete()
      .eq('modifier_id', modifierId);

    if (productModifiersError) {
      throw productModifiersError;
    }

    const { error: orderModifiersError } = await supabase
      .from('order_item_modifiers')
      .update({
        modifier_id: null,
        name: modifier.name,
      })
      .eq('modifier_id', modifierId);

    if (orderModifiersError) {
      throw orderModifiersError;
    }

    const { error } = await supabase.from('modifiers').delete().eq('id', modifierId);

    if (error) {
      throw error;
    }
  },

  async createModifierGroup(payload: ModifierGroupPayload) {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
      .from('modifier_groups')
      .insert({
        active: payload.active,
        max_select: payload.maxSelect,
        min_select: payload.minSelect,
        name: payload.name,
        required: payload.required,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await syncModifierGroupItems(data.id, payload.modifierIds);
    return data;
  },

  async updateModifierGroup(groupId: string, payload: ModifierGroupPayload) {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
      .from('modifier_groups')
      .update({
        active: payload.active,
        max_select: payload.maxSelect,
        min_select: payload.minSelect,
        name: payload.name,
        required: payload.required,
      })
      .eq('id', groupId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await syncModifierGroupItems(groupId, payload.modifierIds);
    return data;
  },

  async deleteModifierGroup(groupId: string) {
    ensureSupabaseConfigured();
    const { error } = await supabase.from('modifier_groups').delete().eq('id', groupId);

    if (error) {
      throw error;
    }
  },
};
