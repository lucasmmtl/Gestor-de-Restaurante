import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { stockItemTypeLabels } from '@/lib/labels';
import type { StockItemPayload, StockItemType } from '@/types/models';

type StockItemFormModalProps = {
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: StockItemPayload) => Promise<void>;
  visible: boolean;
};

const stockItemTypes: StockItemType[] = ['ingredient', 'complement', 'product'];

export function StockItemFormModal({
  loading = false,
  onClose,
  onSubmit,
  visible,
}: StockItemFormModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unit, setUnit] = useState('un');
  const [type, setType] = useState<StockItemType>('ingredient');

  useEffect(() => {
    if (visible) {
      setName('');
      setQuantity('');
      setMinQuantity('');
      setUnit('un');
      setType('ingredient');
    }
  }, [visible]);

  async function handleSubmit() {
    await onSubmit({
      min_quantity: Number(minQuantity),
      name,
      quantity: Number(quantity),
      type,
      unit,
    });
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <Text style={styles.title}>Novo item de estoque</Text>
          <Input label="Nome" onChangeText={setName} placeholder="Mussarela" value={name} />
          <Input
            keyboardType="decimal-pad"
            label="Quantidade inicial"
            onChangeText={setQuantity}
            placeholder="10"
            value={quantity}
          />
          <Input
            keyboardType="decimal-pad"
            label="Quantidade minima"
            onChangeText={setMinQuantity}
            placeholder="3"
            value={minQuantity}
          />
          <Input label="Unidade" onChangeText={setUnit} placeholder="kg, un, pacote" value={unit} />

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Tipo</Text>
            <View style={styles.choiceRow}>
              {stockItemTypes.map((stockType) => (
                <Pressable key={stockType} onPress={() => setType(stockType)}>
                  <StatusBadge
                    label={stockItemTypeLabels[stockType]}
                    tone={type === stockType ? 'success' : 'neutral'}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Button onPress={onClose} style={styles.action} variant="ghost">
              Cancelar
            </Button>
            <Button
              disabled={!name || !quantity || !minQuantity || !unit}
              loading={loading}
              onPress={() => void handleSubmit()}
              style={styles.action}>
              Salvar
            </Button>
          </View>
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
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
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
    gap: theme.spacing.md,
    maxWidth: 460,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
