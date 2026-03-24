import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Header } from '@/components/header';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { StockItemCard } from '@/features/inventory/components/stock-item-card';
import { StockItemFormModal } from '@/features/inventory/components/stock-item-form-modal';
import { StockMovementModal } from '@/features/inventory/components/stock-movement-modal';
import { useCreateStockItem, useRegisterStockMovement, useStockItems } from '@/hooks/use-inventory';
import { getErrorMessage } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';

export default function InventoryScreen() {
  const { data: stockItems } = useStockItems();
  const createStockItem = useCreateStockItem();
  const registerMovement = useRegisterStockMovement();
  const {
    closeStockItemModal,
    closeStockMovementModal,
    isStockItemModalOpen,
    isStockMovementModalOpen,
    movementTarget,
    movementType,
    openStockItemModal,
    openStockMovementModal,
  } = useUiStore();

  const lowStockItems = (stockItems ?? []).filter(
    (item) => Number(item.quantity) <= Number(item.min_quantity)
  );

  async function handleCreateItem(payload: Parameters<typeof createStockItem.mutateAsync>[0]) {
    try {
      await createStockItem.mutateAsync(payload);
      closeStockItemModal();
    } catch (error) {
      Alert.alert('Nao foi possivel cadastrar o item', getErrorMessage(error));
    }
  }

  async function handleMovement(payload: Parameters<typeof registerMovement.mutateAsync>[0]) {
    try {
      await registerMovement.mutateAsync(payload);
      closeStockMovementModal();
    } catch (error) {
      Alert.alert('Nao foi possivel registrar a movimentacao', getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <Header
        action={<Button onPress={openStockItemModal}>Novo item</Button>}
        subtitle="Acompanhe insumos, registre entradas e saídas e receba alerta rapido de estoque baixo."
        title="Estoque"
      />

      {lowStockItems.length ? (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.sectionTitle}>Alertas de reposicao</Text>
            <StatusBadge label={`${lowStockItems.length} itens`} tone="warning" />
          </View>
          <Text style={styles.alertText}>
            {lowStockItems.map((item) => item.name).join(', ')} precisam de reposicao.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.listCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Itens cadastrados</Text>
          <StatusBadge label={`${stockItems?.length ?? 0} itens`} tone="neutral" />
        </View>

        <View style={styles.list}>
          {(stockItems ?? []).map((item) => (
            <StockItemCard
              item={item}
              key={item.id}
              onAdd={() => openStockMovementModal(item, 'entrada')}
              onRemove={() => openStockMovementModal(item, 'saida')}
            />
          ))}
        </View>
      </Card>

      <StockItemFormModal
        loading={createStockItem.isPending}
        onClose={closeStockItemModal}
        onSubmit={handleCreateItem}
        visible={isStockItemModalOpen}
      />

      <StockMovementModal
        item={movementTarget}
        loading={registerMovement.isPending}
        onClose={closeStockMovementModal}
        onSubmit={handleMovement}
        type={movementType}
        visible={isStockMovementModalOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    gap: theme.spacing.sm,
  },
  alertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    gap: theme.spacing.md,
  },
  listCard: {
    gap: theme.spacing.md,
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
