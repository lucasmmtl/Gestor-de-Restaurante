import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/card';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';

type StatCardProps = {
  description: string;
  label: string;
  tone?: 'danger' | 'neutral' | 'success' | 'warning';
  value: string;
};

export function StatCard({ description, label, tone = 'neutral', value }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <StatusBadge label={label} tone={tone} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: theme.spacing.md,
    minWidth: 220,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  value: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 30,
  },
});
