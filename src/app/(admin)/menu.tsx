import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { ModifierFormModal } from '@/features/menu/components/modifier-form-modal';
import { ProductFormModal } from '@/features/menu/components/product-form-modal';
import { useStockItems } from '@/hooks/use-inventory';
import {
  useCategories,
  useCreateModifier,
  useCreateProduct,
  useDeleteModifier,
  useDeleteProduct,
  useModifiers,
  useProducts,
  useUpdateModifier,
  useUpdateProduct,
} from '@/hooks/use-menu';
import { modifierTypeLabels } from '@/lib/labels';
import { getErrorMessage } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import type { ModifierListItem, ModifierPayload, ProductListItem, ProductPayload } from '@/types/models';

export default function MenuScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: modifiers } = useModifiers();
  const { data: stockItems } = useStockItems();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createModifier = useCreateModifier();
  const updateModifier = useUpdateModifier();
  const deleteModifier = useDeleteModifier();
  const ui = useUiStore();

  const filteredProducts = (products ?? []).filter((product) => {
    if (categoryFilter === 'all') {
      return true;
    }

    return product.categories.some((category) => category.id === categoryFilter);
  });

  const activeProductsCount = (products ?? []).filter((product) => product.active).length;
  const activeModifiersCount = (modifiers ?? []).filter((modifier) => modifier.active).length;

  async function handleProductSubmit(payload: ProductPayload) {
    try {
      if (ui.editingProduct) {
        await updateProduct.mutateAsync({
          payload,
          productId: ui.editingProduct.id,
        });
      } else {
        await createProduct.mutateAsync(payload);
      }

      ui.closeProductModal();
    } catch (error) {
      Alert.alert('Nao foi possivel salvar o produto', getErrorMessage(error));
    }
  }

  async function handleModifierSubmit(payload: ModifierPayload) {
    try {
      if (ui.editingModifier) {
        await updateModifier.mutateAsync({
          modifierId: ui.editingModifier.id,
          payload,
        });
      } else {
        await createModifier.mutateAsync(payload);
      }

      ui.closeModifierModal();
    } catch (error) {
      Alert.alert('Nao foi possivel salvar o modificador', getErrorMessage(error));
    }
  }

  async function handleToggleProductActive(product: ProductListItem) {
    try {
      await updateProduct.mutateAsync({
        payload: {
          active: !product.active,
          categoryIds: product.categories.map((category) => category.id),
          description: product.description ?? '',
          imageUrl: product.image_url,
          modifierIds: product.directModifiers.map((modifier) => modifier.id),
          name: product.name,
          price: Number(product.price),
          stockLinks: product.stockLinks.map((link) => ({
            quantityUsed: link.quantityUsed,
            stockItemId: link.stockItemId,
          })),
        },
        productId: product.id,
      });
    } catch (error) {
      Alert.alert('Nao foi possivel atualizar o status', getErrorMessage(error));
    }
  }

  function confirmDeletion(label: string, description: string, action: () => Promise<void>) {
    Alert.alert(label, description, [
      { style: 'cancel', text: 'Cancelar' },
      {
        style: 'destructive',
        text: 'Excluir',
        onPress: () => {
          void action().catch((error) => {
            Alert.alert('Nao foi possivel excluir', getErrorMessage(error));
          });
        },
      },
    ]);
  }

  return (
    <Screen>
      <Header
        action={
          <View style={[styles.headerActions, isCompact ? styles.headerActionsCompact : null]}>
            <Button
              onPress={() => ui.openModifierEditor(null)}
              style={isCompact ? styles.headerButtonCompact : styles.headerButton}
              variant="secondary">
              Novo modificador
            </Button>
            <Button
              onPress={() => ui.openProductModal(null)}
              style={isCompact ? styles.headerButtonCompact : styles.headerButton}>
              Novo produto
            </Button>
          </View>
        }
        subtitle="Gerencie produtos, complementos, molhos e consumo de estoque em um fluxo mais claro para mobile e desktop."
        title="Cardapio"
      />

      <View style={[styles.overviewGrid, isCompact ? styles.overviewGridCompact : null]}>
        <Card style={[styles.overviewCard, isCompact ? styles.overviewCardCompact : null]}>
          <Text style={styles.overviewLabel}>Produtos ativos</Text>
          <Text style={styles.overviewValue}>{activeProductsCount}</Text>
          <Text style={styles.overviewMeta}>Itens disponiveis para o PDV.</Text>
        </Card>
        <Card style={[styles.overviewCard, isCompact ? styles.overviewCardCompact : null]}>
          <Text style={styles.overviewLabel}>Modificadores ativos</Text>
          <Text style={styles.overviewValue}>{activeModifiersCount}</Text>
          <Text style={styles.overviewMeta}>Complementos e molhos prontos para uso.</Text>
        </Card>
      </View>

      <Card style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filtros de produto</Text>
        <View style={styles.filters}>
          <Pressable onPress={() => setCategoryFilter('all')}>
            <StatusBadge label="Todos" tone={categoryFilter === 'all' ? 'success' : 'neutral'} />
          </Pressable>
          {(categories ?? []).map((category) => (
            <Pressable key={category.id} onPress={() => setCategoryFilter(category.id)}>
              <StatusBadge
                label={category.name}
                tone={categoryFilter === category.id ? 'success' : 'neutral'}
              />
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.productsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          <StatusBadge label={`${filteredProducts.length} itens`} tone="neutral" />
        </View>

        {filteredProducts.length ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onDelete={() =>
                  confirmDeletion(
                    'Excluir produto',
                    `Deseja excluir "${product.name}"?`,
                    () => deleteProduct.mutateAsync(product.id)
                  )
                }
                primaryAction={{
                  label: 'Editar',
                  onPress: () => ui.openProductModal(product),
                  variant: 'secondary',
                }}
                product={product}
                secondaryAction={{
                  label: product.active ? 'Desativar' : 'Ativar',
                  onPress: () => void handleToggleProductActive(product),
                  variant: 'ghost',
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptyText}>
              Crie um produto novo ou ajuste o filtro de categoria para carregar mais itens.
            </Text>
            <Button onPress={() => ui.openProductModal(null)} style={styles.emptyAction}>
              Criar produto
            </Button>
          </View>
        )}
      </Card>

      <View style={[styles.secondaryGrid, isCompact ? styles.secondaryGridCompact : null]}>
        <Card style={[styles.secondaryCard, isCompact ? styles.secondaryCardCompact : null]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Modificadores</Text>
            <StatusBadge label={`${modifiers?.length ?? 0} itens`} tone="neutral" />
          </View>

          {(modifiers ?? []).length ? (
            (modifiers ?? []).map((modifier: ModifierListItem) => (
                <View key={modifier.id} style={[styles.inlineCard, isCompact ? styles.inlineCardCompact : null]}>
                <View style={styles.inlineCopy}>
                  <Text style={styles.inlineTitle}>{modifier.name}</Text>
                  <Text style={styles.inlineMeta}>
                    {modifierTypeLabels[modifier.type]} | +R$ {Number(modifier.price).toFixed(2)} |{' '}
                    {modifier.active ? 'Ativo' : 'Inativo'}
                  </Text>
                  <Text style={styles.inlineMeta}>
                    Estoque: {modifier.stockLinks.map((link) => link.stockItemName).join(', ') || 'Sem vinculo'}
                  </Text>
                </View>
                <View style={[styles.inlineActions, isCompact ? styles.inlineActionsCompact : null]}>
                  <Button onPress={() => ui.openModifierEditor(modifier)} variant="secondary">
                    Editar
                  </Button>
                  <Button
                    onPress={() =>
                      confirmDeletion(
                        'Excluir modificador',
                        `Deseja excluir "${modifier.name}"?`,
                        () => deleteModifier.mutateAsync(modifier.id)
                      )
                    }
                    variant="danger">
                    Excluir
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateInline}>
              <Text style={styles.emptyTitle}>Nenhum modificador cadastrado</Text>
              <Text style={styles.emptyText}>
                Cadastre complementos e molhos para montar grupos e opcoes no PDV.
              </Text>
            </View>
          )}
        </Card>
      </View>

      <ProductFormModal
        categories={categories ?? []}
        initialValue={ui.editingProduct}
        loading={createProduct.isPending || updateProduct.isPending}
        modifiers={modifiers ?? []}
        onClose={ui.closeProductModal}
        onSubmit={handleProductSubmit}
        stockItems={stockItems ?? []}
        visible={ui.isProductModalOpen}
      />

      <ModifierFormModal
        initialValue={ui.editingModifier}
        loading={createModifier.isPending || updateModifier.isPending}
        onClose={ui.closeModifierModal}
        onSubmit={handleModifierSubmit}
        stockItems={stockItems ?? []}
        visible={ui.isModifierModalOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyAction: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  emptyStateInline: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  filterCard: {
    gap: theme.spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  headerActionsCompact: {
    width: '100%',
  },
  headerButton: {
    minWidth: 168,
  },
  headerButtonCompact: {
    width: '100%',
  },
  inlineActions: {
    gap: theme.spacing.sm,
    minWidth: 120,
  },
  inlineActionsCompact: {
    minWidth: 0,
    width: '100%',
  },
  inlineCard: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inlineCardCompact: {
    flexDirection: 'column',
  },
  inlineCopy: {
    flex: 1,
    gap: 4,
  },
  inlineMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  inlineTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  overviewCard: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 180,
  },
  overviewCardCompact: {
    minWidth: 0,
    width: '100%',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  overviewGridCompact: {
    flexDirection: 'column',
  },
  overviewLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  overviewMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  overviewValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 30,
  },
  productsCard: {
    gap: theme.spacing.md,
  },
  secondaryCard: {
    flex: 1,
    gap: theme.spacing.md,
    minWidth: 320,
  },
  secondaryCardCompact: {
    minWidth: 0,
    width: '100%',
  },
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  secondaryGridCompact: {
    flexDirection: 'column',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
});
