import { ensureSupabaseConfigured, supabase } from '@/services/supabase';
import { toNumber } from '@/lib/utils';
import type { DashboardStats } from '@/types/models';

export const dashboardService = {
  async getStats() {
    ensureSupabaseConfigured();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      { count: activeProducts, error: productsError },
      { count: pendingOrders, error: pendingError },
      { data: paidOrders, error: revenueError },
      { data: stockItems, error: stockError },
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('orders')
        .select('total')
        .eq('status', 'paid')
        .gte('created_at', startOfDay.toISOString()),
      supabase.from('stock_items').select('quantity, min_quantity'),
    ]);

    if (productsError) {
      throw productsError;
    }

    if (pendingError) {
      throw pendingError;
    }

    if (revenueError) {
      throw revenueError;
    }

    if (stockError) {
      throw stockError;
    }

    return {
      activeProducts: activeProducts ?? 0,
      lowStockCount: (stockItems ?? []).filter(
        (item) => toNumber(item.quantity) <= toNumber(item.min_quantity)
      ).length,
      pendingOrders: pendingOrders ?? 0,
      todayRevenue: (paidOrders ?? []).reduce((total, item) => total + toNumber(item.total), 0),
    } satisfies DashboardStats;
  },
};
