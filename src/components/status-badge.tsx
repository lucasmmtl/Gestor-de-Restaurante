import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Tone = 'danger' | 'neutral' | 'success' | 'warning';

type StatusBadgeProps = {
  label: string;
  tone?: Tone;
};

const toneStyles = {
  danger: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    color: theme.colors.danger,
  },
  neutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: theme.colors.text,
  },
  success: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    color: theme.colors.success,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: theme.colors.warning,
  },
} satisfies Record<Tone, { backgroundColor: string; color: string }>;

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: toneStyles[tone].backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyles[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
