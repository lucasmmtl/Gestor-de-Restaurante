import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { modifierTypeLabels } from '@/lib/labels';
import type {
  LinkedStockInput,
  ModifierListItem,
  ModifierPayload,
  ModifierType,
  StockItem,
} from '@/types/models';

type ModifierFormModalProps = {
  initialValue?: ModifierListItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: ModifierPayload) => Promise<void>;
  stockItems: StockItem[];
  visible: boolean;
};

const modifierTypes: ModifierType[] = ['complement', 'sauce'];

export function ModifierFormModal({
  initialValue,
  loading = false,
  onClose,
  onSubmit,
  stockItems,
  visible,
}: ModifierFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ModifierType>('complement');
  const [active, setActive] = useState(true);
  const [stockLinks, setStockLinks] = useState<LinkedStockInput[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialValue?.name ?? '');
    setPrice(initialValue ? String(initialValue.price) : '0');
    setType(initialValue?.type ?? 'complement');
    setActive(initialValue?.active ?? true);
    setStockLinks(
      initialValue?.stockLinks.map((link) => ({
        quantityUsed: link.quantityUsed,
        stockItemId: link.stockItemId,
      })) ?? []
    );
  }, [initialValue, visible]);

  function toggleStockItem(stockItemId: string) {
    setStockLinks((current) =>
      current.some((link) => link.stockItemId === stockItemId)
        ? current.filter((link) => link.stockItemId !== stockItemId)
        : [...current, { quantityUsed: 1, stockItemId }]
    );
  }

  function updateStockQuantity(stockItemId: string, value: string) {
    setStockLinks((current) =>
      current.map((link) =>
        link.stockItemId === stockItemId
          ? { ...link, quantityUsed: Number(value.replace(',', '.')) || 0 }
          : link
      )
    );
  }

  async function handleSubmit() {
    await onSubmit({
      active,
      name,
      price: Number(price.replace(',', '.')),
      stockLinks: stockLinks.filter((link) => link.quantityUsed > 0),
      type,
    });
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>{initialValue ? 'Editar modificador' : 'Novo modificador'}</Text>

              <Input label="Nome" onChangeText={setName} placeholder="Molho especial" value={name} />
              <Input
                keyboardType="decimal-pad"
                label="Preco adicional"
                onChangeText={setPrice}
                placeholder="2.50"
                value={price}
              />

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Tipo</Text>
                <View style={styles.choiceWrap}>
                  {modifierTypes.map((modifierType) => (
                    <Pressable key={modifierType} onPress={() => setType(modifierType)}>
                      <StatusBadge
                        label={modifierTypeLabels[modifierType]}
                        tone={type === modifierType ? 'success' : 'neutral'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Ativo no PDV</Text>
                <Switch
                  onValueChange={setActive}
                  thumbColor={theme.colors.text}
                  trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.primary }}
                  value={active}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Consumo de estoque</Text>
                <View style={styles.choiceWrap}>
                  {stockItems.map((stockItem) => (
                    <Pressable key={stockItem.id} onPress={() => toggleStockItem(stockItem.id)}>
                      <StatusBadge
                        label={`${stockItem.name} (${stockItem.unit})`}
                        tone={
                          stockLinks.some((link) => link.stockItemId === stockItem.id)
                            ? 'success'
                            : 'neutral'
                        }
                      />
                    </Pressable>
                  ))}
                </View>

                {stockLinks.map((link) => {
                  const stockItem = stockItems.find((item) => item.id === link.stockItemId);

                  if (!stockItem) {
                    return null;
                  }

                  return (
                    <Input
                      key={link.stockItemId}
                      keyboardType="decimal-pad"
                      label={`Quantidade usada de ${stockItem.name}`}
                      onChangeText={(value) => updateStockQuantity(link.stockItemId, value)}
                      placeholder="1"
                      value={String(link.quantityUsed)}
                    />
                  );
                })}
              </View>

              <View style={styles.actions}>
                <Button onPress={onClose} style={styles.action} variant="ghost">
                  Cancelar
                </Button>
                <Button
                  disabled={!name}
                  loading={loading}
                  onPress={() => void handleSubmit()}
                  style={styles.action}>
                  Salvar
                </Button>
              </View>
            </View>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  content: {
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  modal: {
    maxHeight: '88%',
    maxWidth: 560,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  switchLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
