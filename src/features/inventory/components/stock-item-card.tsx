import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { stockItemTypeLabels } from '@/lib/labels';
import type { StockItem } from '@/types/models';

type StockItemCardProps = {
  item: StockItem;
  onAdd: () => void;
  onRemove: () => void;
};

export function StockItemCard({ item, onAdd, onRemove }: StockItemCardProps) {
  const isLow = Number(item.quantity) <= Number(item.min_quantity);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.quantity} {item.unit} disponivel
          </Text>
        </View>
        <View style={styles.badges}>
          <StatusBadge label={stockItemTypeLabels[item.type]} tone="neutral" />
          <StatusBadge label={isLow ? 'Baixo' : 'Ok'} tone={isLow ? 'warning' : 'success'} />
        </View>
      </View>

      <Text style={styles.meta}>Minimo recomendado: {item.min_quantity}</Text>

      <View style={styles.actions}>
        <Button onPress={onAdd} style={styles.button} variant="secondary">
          Entrada
        </Button>
        <Button onPress={onRemove} style={styles.button} variant="ghost">
          Saida
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  badges: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  button: {
    flex: 1,
    minHeight: 44,
  },
  card: {
    gap: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  meta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
