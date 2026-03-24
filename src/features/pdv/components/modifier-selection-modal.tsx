import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import type { CartItemModifier, ModifierType, ProductListItem } from '@/types/models';

type ModifierSelectionModalProps = {
  onClose: () => void;
  onConfirm: (modifiers: CartItemModifier[]) => void;
  product: ProductListItem | null;
  visible: boolean;
};

export function ModifierSelectionModal({
  onClose,
  onConfirm,
  product,
  visible,
}: ModifierSelectionModalProps) {
  const [selectedDirectModifierIds, setSelectedDirectModifierIds] = useState<string[]>([]);

  const modifierTypeLabels: Record<ModifierType, string> = {
    complement: 'Complementos',
    sauce: 'Molhos',
  };

  useEffect(() => {
    if (!visible || !product) {
      return;
    }

    setSelectedDirectModifierIds([]);
  }, [product, visible]);

  if (!product) {
    return null;
  }

  const currentProduct = product;
  const directModifiersByType = currentProduct.directModifiers.reduce<Record<ModifierType, typeof currentProduct.directModifiers>>(
    (accumulator, modifier) => {
      accumulator[modifier.type] = [...(accumulator[modifier.type] ?? []), modifier];
      return accumulator;
    },
    { complement: [], sauce: [] }
  );

  function toggleDirectModifier(modifierId: string) {
    setSelectedDirectModifierIds((current) =>
      current.includes(modifierId)
        ? current.filter((id) => id !== modifierId)
        : [...current, modifierId]
    );
  }

  function handleConfirm() {
    const directModifiers = currentProduct.directModifiers
      .filter((modifier) => selectedDirectModifierIds.includes(modifier.id))
      .map((modifier) => ({
        groupId: `direct-${modifier.type}`,
        groupName: modifierTypeLabels[modifier.type],
        modifierId: modifier.id,
        name: modifier.name,
        price: Number(modifier.price),
      }));

    onConfirm(directModifiers);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>Configurar {currentProduct.name}</Text>
              <Text style={styles.subtitle}>
                Escolha os complementos e molhos disponiveis para este produto.
              </Text>

              {(Object.entries(directModifiersByType) as [ModifierType, typeof currentProduct.directModifiers][]).map(
                ([modifierType, modifiers]) => {
                  if (!modifiers.length) {
                    return null;
                  }

                  return (
                    <View key={modifierType} style={styles.group}>
                      <View style={styles.groupHeader}>
                        <Text style={styles.groupTitle}>{modifierTypeLabels[modifierType]}</Text>
                        <StatusBadge
                          label={`${modifiers.filter((modifier) => selectedDirectModifierIds.includes(modifier.id)).length}/${modifiers.length}`}
                          tone="neutral"
                        />
                      </View>
                      <Text style={styles.groupMeta}>Selecao livre para este produto.</Text>
                      <View style={styles.choiceWrap}>
                        {modifiers.map((modifier) => (
                          <Pressable key={modifier.id} onPress={() => toggleDirectModifier(modifier.id)}>
                            <StatusBadge
                              label={`${modifier.name} (+${modifier.price})`}
                              tone={selectedDirectModifierIds.includes(modifier.id) ? 'success' : 'neutral'}
                            />
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  );
                }
              )}

              <View style={styles.actions}>
                <Button onPress={onClose} style={styles.action} variant="ghost">
                  Cancelar
                </Button>
                <Button onPress={handleConfirm} style={styles.action}>
                  Adicionar ao carrinho
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
  groupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
  groupTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  modal: {
    maxHeight: '88%',
    maxWidth: 640,
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
    lineHeight: 22,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
