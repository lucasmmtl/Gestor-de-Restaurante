import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { menuService } from '@/services/menu-service';

export function useProducts() {
  return useQuery({
    queryFn: () => menuService.getProducts(),
    queryKey: ['products'],
  });
}

export function useCategories() {
  return useQuery({
    queryFn: () => menuService.getCategories(),
    queryKey: ['categories'],
  });
}

export function useModifiers() {
  return useQuery({
    queryFn: () => menuService.getModifiers(),
    queryKey: ['modifiers'],
  });
}

export function useModifierGroups() {
  return useQuery({
    queryFn: () => menuService.getModifierGroups(),
    queryKey: ['modifier-groups'],
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createProduct.bind(menuService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { payload: Parameters<typeof menuService.updateProduct>[1]; productId: string }) =>
      menuService.updateProduct(input.productId, input.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => menuService.deleteProduct(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateModifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createModifier.bind(menuService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
    },
  });
}

export function useUpdateModifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { modifierId: string; payload: Parameters<typeof menuService.updateModifier>[1] }) =>
      menuService.updateModifier(input.modifierId, input.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteModifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modifierId: string) => menuService.deleteModifier(modifierId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createModifierGroup.bind(menuService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { groupId: string; payload: Parameters<typeof menuService.updateModifierGroup>[1] }) =>
      menuService.updateModifierGroup(input.groupId, input.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteModifierGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => menuService.deleteModifierGroup(groupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
