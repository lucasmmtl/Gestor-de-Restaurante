import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { theme } from '@/constants/theme';
import type { StockItem, StockMovementType } from '@/types/models';

type StockMovementModalProps = {
  item: StockItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { quantity: number; stockItemId: string; type: StockMovementType }) => Promise<void>;
  type: StockMovementType;
  visible: boolean;
};

export function StockMovementModal({
  item,
  loading = false,
  onClose,
  onSubmit,
  type,
  visible,
}: StockMovementModalProps) {
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (visible) {
      setQuantity('');
    }
  }, [visible]);

  if (!item) {
    return null;
  }

  const currentItem = item;

  async function handleSubmit() {
    await onSubmit({
      quantity: Number(quantity),
      stockItemId: currentItem.id,
      type,
    });
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <Text style={styles.title}>
            {type === 'entrada' ? 'Registrar entrada' : 'Registrar saida'}
          </Text>
          <Text style={styles.subtitle}>
            Item: {currentItem.name} ({currentItem.quantity} {currentItem.unit} atuais)
          </Text>
          {type === 'saida' ? (
            <Text style={styles.helper}>Digite `0` para excluir este item do estoque.</Text>
          ) : null}
          <Input
            keyboardType="decimal-pad"
            label={type === 'entrada' ? 'Quantidade' : 'Quantidade de saida'}
            onChangeText={setQuantity}
            placeholder={type === 'entrada' ? '2' : '0'}
            value={quantity}
          />

          <View style={styles.actions}>
            <Button onPress={onClose} style={styles.action} variant="ghost">
              Cancelar
            </Button>
            <Button
              disabled={!quantity}
              loading={loading}
              onPress={() => void handleSubmit()}
              style={styles.action}
              variant={type === 'entrada' ? 'secondary' : 'primary'}>
              Confirmar
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
  helper: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
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
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
