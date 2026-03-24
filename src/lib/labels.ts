import type { ModifierType, OrderStatus, StockItemType } from '@/types/models';

export const modifierTypeLabels: Record<ModifierType, string> = {
  complement: 'Complemento',
  sauce: 'Molho',
};

export const stockItemTypeLabels: Record<StockItemType, string> = {
  complement: 'Complemento',
  ingredient: 'Ingrediente',
  product: 'Produto',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  cancelled: 'Cancelado',
  paid: 'Pago',
  pending: 'Pendente',
};
