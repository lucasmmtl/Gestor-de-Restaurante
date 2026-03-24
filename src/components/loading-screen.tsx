import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppAssets } from '@/constants/assets';
import { theme } from '@/constants/theme';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Carregando painel...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Image contentFit="contain" source={AppAssets.logo} style={styles.logo} />
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  logo: {
    height: 110,
    width: 110,
  },
  message: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
});
