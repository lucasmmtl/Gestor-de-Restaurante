import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { theme } from '@/constants/theme';

type ManualItemModalProps = {
  onClose: () => void;
  onSubmit: (payload: { name: string; price: number; quantity: number }) => void;
  visible: boolean;
};

const MANUAL_ITEM_OPTIONS = ['Macarrao', 'Prato Feito', 'Panqueca'] as const;

export function ManualItemModal({ onClose, onSubmit, visible }: ManualItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName('');
    setPrice('');
    setQuantity('1');
  }, [visible]);

  function handleSubmit() {
    onSubmit({
      name,
      price: Number(price.replace(',', '.')),
      quantity: Number(quantity),
    });
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <Text style={styles.title}>Item manual</Text>
          <View style={styles.quickOptions}>
            <Text style={styles.sectionLabel}>Opcoes rapidas</Text>
            <View style={styles.optionGrid}>
              {MANUAL_ITEM_OPTIONS.map((option) => {
                const isSelected = name === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setName(option)}
                    style={[styles.optionChip, isSelected ? styles.optionChipActive : null]}>
                    <Text style={[styles.optionChipLabel, isSelected ? styles.optionChipLabelActive : null]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              Toque em uma opcao para preencher o nome automaticamente ou edite manualmente abaixo.
            </Text>
          </View>
          <Input label="Nome" onChangeText={setName} placeholder="Taxa de entrega" value={name} />
          <Input
            keyboardType="decimal-pad"
            label="Preco unitario"
            onChangeText={setPrice}
            placeholder="5.00"
            value={price}
          />
          <Input
            keyboardType="number-pad"
            label="Quantidade"
            onChangeText={setQuantity}
            placeholder="1"
            value={quantity}
          />

          <View style={styles.actions}>
            <Button onPress={onClose} style={styles.action} variant="ghost">
              Cancelar
            </Button>
            <Button
              disabled={!name || !price}
              onPress={handleSubmit}
              style={styles.action}>
              Adicionar
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
  modal: {
    gap: theme.spacing.md,
    maxWidth: 460,
    width: '100%',
  },
  helperText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  optionChip: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  optionChipLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
  },
  optionChipLabelActive: {
    color: theme.colors.text,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  quickOptions: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
