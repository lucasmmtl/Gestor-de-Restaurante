import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { inventoryService } from '@/services/inventory-service';

export function useStockItems() {
  return useQuery({
    queryFn: () => inventoryService.getStockItems(),
    queryKey: ['stock-items'],
  });
}

export function useCreateStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof inventoryService.createStockItem>[0]) =>
      inventoryService.createStockItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRegisterStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof inventoryService.registerMovement>[0]) =>
      inventoryService.registerMovement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
