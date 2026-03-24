import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ordersService } from '@/services/orders-service';

export function useRecentOrders() {
  return useQuery({
    queryFn: () => ordersService.getRecentOrders(),
    queryKey: ['recent-orders'],
  });
}

export function usePendingOrders() {
  return useQuery({
    queryFn: () => ordersService.getRecentOrders({ onlyPending: true }),
    queryKey: ['pending-orders'],
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof ordersService.createOrder>[0]) =>
      ordersService.createOrder(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkOrderPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.markOrderPaid(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
