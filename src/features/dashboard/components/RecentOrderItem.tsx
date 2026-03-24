import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { orderStatusLabels } from '@/lib/labels';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { OrderListItem } from '@/types/models';

type RecentOrderItemProps = {
  loading?: boolean;
  order?: OrderListItem;
};

const statusTone = {
  cancelled: 'danger',
  paid: 'success',
  pending: 'warning',
} as const;

export function RecentOrderItem({ loading = false, order }: RecentOrderItemProps) {
  if (loading || !order) {
    return (
      <View style={styles.container}>
        <View style={[styles.skeletonBlock, styles.skeletonAvatar]} />
        <View style={styles.skeletonCopy}>
          <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
          <View style={[styles.skeletonBlock, styles.skeletonMeta]} />
        </View>
        <View style={[styles.skeletonBlock, styles.skeletonBadge]} />
      </View>
    );
  }

  const itemsPreview = order.items.slice(0, 2).map((item) => item.name).join(', ');
  const remainingItems = order.items.length > 2 ? ` +${order.items.length - 2}` : '';
  const avatarStyle =
    order.status === 'cancelled'
      ? styles.avatarcancelled
      : order.status === 'paid'
        ? styles.avatarpaid
        : styles.avatarpending;
  const avatarIcon = order.status === 'cancelled' ? 'close-thick' : order.status === 'paid' ? 'check-bold' : 'timer-sand';

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, avatarStyle]}>
        <MaterialCommunityIcons color={theme.colors.text} name={avatarIcon} size={18} />
      </View>

      <View style={styles.copy}>
        <View style={styles.topRow}>
          <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          <Text style={styles.orderId}>#{order.id.slice(0, 6).toUpperCase()}</Text>
        </View>
        <Text numberOfLines={1} style={styles.items}>
          {itemsPreview}
          {remainingItems}
        </Text>
        <Text style={styles.meta}>
          {formatDateTime(order.created_at)} • {order.items.length} item(ns)
        </Text>
      </View>

      <StatusBadge label={orderStatusLabels[order.status]} tone={statusTone[order.status]} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  avatarcancelled: {
    backgroundColor: 'rgba(248, 113, 113, 0.16)',
  },
  avatarpaid: {
    backgroundColor: 'rgba(52, 211, 153, 0.16)',
  },
  avatarpending: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  container: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  items: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  meta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  orderId: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  skeletonAvatar: {
    borderRadius: 18,
    height: 42,
    width: 42,
  },
  skeletonBadge: {
    borderRadius: 999,
    height: 28,
    width: 84,
  },
  skeletonBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonCopy: {
    flex: 1,
    gap: 8,
  },
  skeletonMeta: {
    borderRadius: 10,
    height: 14,
    width: '60%',
  },
  skeletonTitle: {
    borderRadius: 10,
    height: 18,
    width: '78%',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
});
