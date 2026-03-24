import type { Session } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

export type AppRole = Database['public']['Enums']['app_role'];
export type ModifierType = Database['public']['Enums']['modifier_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type StockItemType = Database['public']['Enums']['stock_item_type'];
export type StockMovementType = Database['public']['Enums']['stock_movement_type'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type Modifier = Database['public']['Tables']['modifiers']['Row'];
export type ModifierGroup = Database['public']['Tables']['modifier_groups']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type StockItem = Database['public']['Tables']['stock_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type AdminProfile = Database['public']['Tables']['profiles']['Row'];

export type ProductImageAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export type LinkedStockInput = {
  quantityUsed: number;
  stockItemId: string;
};

export type ProductModifierGroup = ModifierGroup & {
  modifiers: Modifier[];
};

export type ProductStockLink = {
  quantityUsed: number;
  stockItemId: string;
  stockItemName: string;
  stockItemType: StockItemType;
  unit: string;
};

export type ModifierStockLink = ProductStockLink;

export type ProductListItem = Product & {
  categories: Category[];
  directModifiers: Modifier[];
  stockLinks: ProductStockLink[];
};

export type ModifierListItem = Modifier & {
  stockLinks: ModifierStockLink[];
};

export type ModifierGroupListItem = ModifierGroup & {
  modifiers: Modifier[];
};

export type ProductPayload = {
  active: boolean;
  categoryIds: string[];
  description: string;
  image?: ProductImageAsset | null;
  imageUrl?: string | null;
  modifierIds: string[];
  name: string;
  price: number;
  stockLinks: LinkedStockInput[];
};

export type ModifierPayload = {
  active: boolean;
  name: string;
  price: number;
  stockLinks: LinkedStockInput[];
  type: ModifierType;
};

export type ModifierGroupPayload = {
  active: boolean;
  maxSelect: number;
  minSelect: number;
  modifierIds: string[];
  name: string;
  required: boolean;
};

export type StockItemPayload = {
  min_quantity: number;
  name: string;
  quantity: number;
  type: StockItemType;
  unit: string;
};

export type CartItemModifier = {
  groupId: string;
  groupName: string;
  modifierId: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  imageUrl?: string | null;
  kind: 'manual' | 'product';
  modifiers: CartItemModifier[];
  name: string;
  price: number;
  productId: string | null;
  quantity: number;
  signature: string;
};

export type CartProductInput = {
  imageUrl?: string | null;
  modifiers: CartItemModifier[];
  name: string;
  price: number;
  productId: string;
};

export type ManualCartItemInput = {
  name: string;
  price: number;
  quantity?: number;
};

export type OrderItemModifierListItem = {
  id: string;
  modifierId: string | null;
  name: string;
  price: number;
};

export type OrderItemListItem = {
  id: string;
  modifiers: OrderItemModifierListItem[];
  name: string;
  price: number;
  productId: string | null;
  quantity: number;
};

export type OrderListItem = Order & {
  items: OrderItemListItem[];
};

export type OrderCreateItemInput = {
  modifierIds: string[];
  name?: string;
  price?: number;
  productId: string | null;
  quantity: number;
};

export type DashboardStats = {
  activeProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  todayRevenue: number;
};

export type AuthSnapshot = {
  profile: AdminProfile | null;
  session: Session | null;
};
