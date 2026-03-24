import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { formatCurrency } from '@/lib/utils';
import type { CartItem as CartItemModel } from '@/types/models';

type CartItemProps = {
  item: CartItemModel;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartItem({ item, onDecrease, onIncrease, onRemove }: CartItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        {item.modifiers.length ? (
          <Text style={styles.modifiers}>
            {item.modifiers.map((modifier) => modifier.name).join(', ')}
          </Text>
        ) : null}
        <Text style={styles.total}>{formatCurrency(item.price * item.quantity)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onDecrease} style={styles.controlButton}>
          <Text style={styles.controlLabel}>-</Text>
        </Pressable>
        <StatusBadge label={`${item.quantity}x`} tone="neutral" />
        <Pressable onPress={onIncrease} style={styles.controlButton}>
          <Text style={styles.controlLabel}>+</Text>
        </Pressable>
        <Pressable onPress={onRemove} style={[styles.controlButton, styles.removeButton]}>
          <Text style={styles.controlLabel}>x</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  controlLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  copy: {
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
  },
  modifiers: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  removeButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.14)',
  },
  total: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
});
