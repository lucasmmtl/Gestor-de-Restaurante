import { ensureSupabaseConfigured, supabase } from '@/services/supabase';
import { toNumber } from '@/lib/utils';
import type { OrderCreateItemInput, OrderListItem } from '@/types/models';

type ProductStockUsageRow = {
  product_id: string;
  quantity_used: number;
  stock_item_id: string;
};

type ModifierStockUsageRow = {
  modifier_id: string;
  quantity_used: number;
  stock_item_id: string;
};

export const ordersService = {
  async getRecentOrders(options?: { onlyPending?: boolean }) {
    ensureSupabaseConfigured();

    let query = supabase
      .from('orders')
      .select(
        `
          id,
          total,
          status,
          created_at,
          stock_deducted_at,
          order_items (
            id,
            product_id,
            name,
            quantity,
            price,
            products (name),
            order_item_modifiers (
              id,
              price,
              modifier_id,
              name,
              modifiers (name)
            )
          )
        `
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (options?.onlyPending) {
      query = query.eq('status', 'pending');
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return ((data ?? []) as any[]).map(
      (order): OrderListItem => ({
        created_at: order.created_at,
        id: order.id,
        items: (order.order_items ?? []).map((item: any) => ({
          id: item.id,
          modifiers: (item.order_item_modifiers ?? []).map((modifier: any) => ({
            id: modifier.id,
            modifierId: modifier.modifier_id,
            name: modifier.name ?? modifier.modifiers?.name ?? 'Modificador',
            price: toNumber(modifier.price),
          })),
          name: item.name ?? item.products?.name ?? 'Item manual',
          price: toNumber(item.price),
          productId: item.product_id,
          quantity: toNumber(item.quantity),
        })),
        status: order.status,
        stock_deducted_at: order.stock_deducted_at,
        total: toNumber(order.total),
      })
    );
  },

  async createOrder(input: { items: OrderCreateItemInput[]; markAsPaid?: boolean }) {
    ensureSupabaseConfigured();
    if (!input.items.length) {
      throw new Error('O pedido precisa de pelo menos um item.');
    }

    const productIds = Array.from(
      new Set(input.items.map((item) => item.productId).filter((productId): productId is string => Boolean(productId)))
    );
    const modifierIds = Array.from(new Set(input.items.flatMap((item) => item.modifierIds)));

    const [
      { data: products, error: productsError },
      { data: modifiers, error: modifiersError },
      { data: productStock, error: productStockError },
      { data: modifierStock, error: modifierStockError },
    ] = await Promise.all([
      productIds.length
        ? supabase.from('products').select('id, name, price, active').in('id', productIds)
        : Promise.resolve({ data: [], error: null }),
      modifierIds.length
        ? supabase.from('modifiers').select('id, name, price, active, type').in('id', modifierIds)
        : Promise.resolve({ data: [], error: null }),
      productIds.length
        ? supabase.from('product_stock').select('product_id, stock_item_id, quantity_used').in('product_id', productIds)
        : Promise.resolve({ data: [], error: null }),
      modifierIds.length
        ? supabase.from('modifier_stock').select('modifier_id, stock_item_id, quantity_used').in('modifier_id', modifierIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (productsError) {
      throw productsError;
    }

    if (modifiersError) {
      throw modifiersError;
    }

    if (productStockError) {
      throw productStockError;
    }

    if (modifierStockError) {
      throw modifierStockError;
    }

    const productsById = new Map(
      ((products ?? []) as { active: boolean; id: string; name: string; price: number }[]).map((product) => [
        product.id,
        { ...product, price: toNumber(product.price) },
      ])
    );
    const modifiersById = new Map(
      ((modifiers ?? []) as { active: boolean; id: string; name: string; price: number }[]).map((modifier) => [
        modifier.id,
        { ...modifier, price: toNumber(modifier.price) },
      ])
    );
    const productStockByProductId = new Map<string, ProductStockUsageRow[]>();
    const modifierStockByModifierId = new Map<string, ModifierStockUsageRow[]>();
    const stockUsageByItemId = new Map<string, number>();

    for (const row of (productStock ?? []) as ProductStockUsageRow[]) {
      const bucket = productStockByProductId.get(row.product_id) ?? [];
      bucket.push({
        ...row,
        quantity_used: toNumber(row.quantity_used),
      });
      productStockByProductId.set(row.product_id, bucket);
    }

    for (const row of (modifierStock ?? []) as ModifierStockUsageRow[]) {
      const bucket = modifierStockByModifierId.get(row.modifier_id) ?? [];
      bucket.push({
        ...row,
        quantity_used: toNumber(row.quantity_used),
      });
      modifierStockByModifierId.set(row.modifier_id, bucket);
    }

    let orderTotal = 0;

    for (const item of input.items) {
      if (item.productId) {
        const product = productsById.get(item.productId);

        if (!product?.active) {
          throw new Error('Produto indisponivel para venda.');
        }

        orderTotal += product.price * item.quantity;

        for (const stockLink of productStockByProductId.get(item.productId) ?? []) {
          stockUsageByItemId.set(
            stockLink.stock_item_id,
            (stockUsageByItemId.get(stockLink.stock_item_id) ?? 0) + stockLink.quantity_used * item.quantity
          );
        }
      } else {
        const manualPrice = toNumber(item.price ?? 0);
        orderTotal += manualPrice * item.quantity;
      }

      for (const modifierId of item.modifierIds) {
        const modifier = modifiersById.get(modifierId);

        if (!modifier?.active) {
          throw new Error('Modificador indisponivel para venda.');
        }

        orderTotal += modifier.price * item.quantity;

        for (const stockLink of modifierStockByModifierId.get(modifierId) ?? []) {
          stockUsageByItemId.set(
            stockLink.stock_item_id,
            (stockUsageByItemId.get(stockLink.stock_item_id) ?? 0) + stockLink.quantity_used * item.quantity
          );
        }
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        status: input.markAsPaid ? 'paid' : 'pending',
        stock_deducted_at: new Date().toISOString(),
        total: orderTotal,
      })
      .select('*')
      .single();

    if (orderError) {
      throw orderError;
    }

    for (const item of input.items) {
      const product = item.productId ? productsById.get(item.productId) : null;
      const orderItemPrice = item.productId ? product?.price ?? 0 : toNumber(item.price ?? 0);

      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .insert({
          name: item.productId ? product?.name ?? item.name ?? 'Produto' : item.name,
          order_id: order.id,
          price: orderItemPrice,
          product_id: item.productId,
          quantity: item.quantity,
        })
        .select('*')
        .single();

      if (orderItemError) {
        throw orderItemError;
      }

      if (item.modifierIds.length) {
        const modifierRows = item.modifierIds.map((modifierId) => {
          const modifier = modifiersById.get(modifierId);

          if (!modifier) {
            throw new Error('Modificador indisponivel para venda.');
          }

          return {
            modifier_id: modifierId,
            name: modifier.name,
            order_item_id: orderItem.id,
            price: modifier.price,
          };
        });

        const { error: modifierInsertError } = await supabase
          .from('order_item_modifiers')
          .insert(modifierRows);

        if (modifierInsertError) {
          throw modifierInsertError;
        }
      }
    }

    for (const [stockItemId, quantity] of stockUsageByItemId.entries()) {
      if (quantity <= 0) {
        continue;
      }

      const { error: stockError } = await supabase.rpc('register_stock_movement', {
        p_quantity: quantity,
        p_stock_item_id: stockItemId,
        p_type: 'saida',
      });

      if (stockError) {
        throw stockError;
      }
    }

    return order;
  },

  async markOrderPaid(orderId: string) {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.rpc('mark_order_paid', {
      p_order_id: orderId,
    });

    if (error) {
      throw error;
    }

    return data;
  },
};
