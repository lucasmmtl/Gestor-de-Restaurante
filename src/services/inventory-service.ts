import { ensureSupabaseConfigured, supabase } from '@/services/supabase';
import { toNumber } from '@/lib/utils';
import type { StockItem, StockItemPayload, StockMovementType } from '@/types/models';

export const inventoryService = {
  async deleteStockItem(stockItemId: string) {
    ensureSupabaseConfigured();

    const [{ error: productStockError }, { error: modifierStockError }] = await Promise.all([
      supabase.from('product_stock').delete().eq('stock_item_id', stockItemId),
      supabase.from('modifier_stock').delete().eq('stock_item_id', stockItemId),
    ]);

    if (productStockError) {
      throw productStockError;
    }

    if (modifierStockError) {
      throw modifierStockError;
    }

    const { error: deleteError } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', stockItemId);

    if (deleteError) {
      throw deleteError;
    }
  },

  async getStockItems() {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.from('stock_items').select('*').order('name');

    if (error) {
      throw error;
    }

    return ((data ?? []) as StockItem[]).map((item) => ({
      ...item,
      min_quantity: toNumber(item.min_quantity),
      quantity: toNumber(item.quantity),
    }));
  },

  async createStockItem(payload: StockItemPayload) {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from('stock_items')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async registerMovement(input: {
    quantity: number;
    stockItemId: string;
    type: StockMovementType;
  }) {
    ensureSupabaseConfigured();

    if (input.type === 'saida' && input.quantity === 0) {
      await this.deleteStockItem(input.stockItemId);
      return null;
    }

    const { data, error } = await supabase.rpc('register_stock_movement', {
      p_quantity: input.quantity,
      p_stock_item_id: input.stockItemId,
      p_type: input.type,
    });

    if (error) {
      throw error;
    }

    const updatedItem = data as StockItem | null;

    if (input.type === 'saida' && updatedItem && toNumber(updatedItem.quantity) <= 0) {
      await this.deleteStockItem(input.stockItemId);
    }

    return data;
  },
};
