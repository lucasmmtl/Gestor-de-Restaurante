import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { theme } from '@/constants/theme';

type HeaderProps = {
  action?: ReactNode;
  subtitle?: string;
  title: string;
};

export function Header({ action, subtitle, title }: HeaderProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 720;

  return (
    <View style={[styles.container, isCompact ? styles.containerCompact : null]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={[styles.action, isCompact ? styles.actionCompact : null]}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    minWidth: 140,
  },
  actionCompact: {
    minWidth: 0,
    width: '100%',
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  containerCompact: {
    flexDirection: 'column',
  },
  copy: {
    flex: 1,
    gap: 6,
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
    fontSize: 28,
  },
});
