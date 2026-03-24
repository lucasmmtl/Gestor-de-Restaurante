import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

type TrendDirection = 'down' | 'neutral' | 'up';

type DashboardCardProps = {
  caption: string;
  description: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
  tone?: 'danger' | 'neutral' | 'success' | 'warning';
  trendDirection?: TrendDirection;
  trendLabel: string;
};

const cardGradients = {
  danger: ['rgba(248, 113, 113, 0.18)', 'rgba(17, 17, 17, 0.94)'],
  neutral: ['rgba(96, 165, 250, 0.16)', 'rgba(17, 17, 17, 0.94)'],
  success: ['rgba(52, 211, 153, 0.18)', 'rgba(17, 17, 17, 0.94)'],
  warning: ['rgba(245, 158, 11, 0.18)', 'rgba(17, 17, 17, 0.94)'],
} as const;

const trendMeta = {
  down: {
    color: theme.colors.danger,
    icon: 'arrow-bottom-right',
  },
  neutral: {
    color: theme.colors.accent,
    icon: 'minus',
  },
  up: {
    color: theme.colors.success,
    icon: 'arrow-top-right',
  },
} as const;

export function DashboardCard({
  caption,
  description,
  icon,
  loading = false,
  style,
  title,
  tone = 'neutral',
  trendDirection = 'neutral',
  trendLabel,
}: DashboardCardProps) {
  if (loading) {
    return (
      <View style={[styles.card, style]}>
        <LinearGradient colors={cardGradients[tone]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.skeletonTopRow}>
          <View style={[styles.skeletonBlock, styles.skeletonChip]} />
          <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
        </View>
        <View style={[styles.skeletonBlock, styles.skeletonValue]} />
        <View style={[styles.skeletonBlock, styles.skeletonLine]} />
        <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={cardGradients[tone]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.glow} />

      <View style={styles.header}>
        <View style={styles.trendChip}>
          <MaterialCommunityIcons
            color={trendMeta[trendDirection].color}
            name={trendMeta[trendDirection].icon}
            size={14}
          />
          <Text style={styles.trendLabel}>{trendLabel}</Text>
        </View>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={theme.colors.text} name={icon} size={18} />
        </View>
      </View>

      <Text style={styles.caption}>{caption}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(14, 14, 14, 0.94)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    borderWidth: 1,
    gap: theme.spacing.xs,
    minHeight: 172,
    overflow: 'hidden',
    padding: theme.spacing.lg,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  glow: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 120,
    height: 120,
    position: 'absolute',
    right: -32,
    top: -42,
    width: 120,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  skeletonBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  skeletonChip: {
    height: 28,
    width: 112,
  },
  skeletonIcon: {
    borderRadius: 16,
    height: 38,
    width: 38,
  },
  skeletonLine: {
    height: 16,
    marginTop: 8,
    width: '84%',
  },
  skeletonLineShort: {
    height: 16,
    width: '62%',
  },
  skeletonTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  skeletonValue: {
    height: 42,
    marginTop: theme.spacing.sm,
    width: '52%',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    marginTop: 4,
  },
  trendChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trendLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
