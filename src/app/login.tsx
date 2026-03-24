import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { AppAssets } from '@/constants/assets';
import { theme } from '@/constants/theme';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 900;
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  if (session && profile?.role === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  const isBlocked = Boolean(session && profile?.role !== 'admin');

  return (
    <Screen
      contentContainerStyle={[
        styles.content,
        isCompact ? styles.contentCompact : null,
      ]}
      scroll={isCompact}>
      <View style={[styles.brandColumn, isCompact ? styles.brandColumnCompact : null]}>
        <Image
          contentFit="contain"
          source={AppAssets.logo}
          style={[styles.logo, isCompact ? styles.logoCompact : null]}
        />
        <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>Painel Admin</Text>
        <Text style={[styles.subtitle, isCompact ? styles.subtitleCompact : null]}>
          PDV, estoque e cardapio digital em uma experiencia enxuta para operacao diaria.
        </Text>
      </View>

      <View style={[styles.formColumn, isCompact ? styles.formColumnCompact : null]}>
        {isBlocked ? (
          <View style={styles.blockedCard}>
            <Text style={styles.blockedTitle}>Acesso restrito</Text>
            <Text style={styles.blockedText}>
              Este usuario existe, mas ainda nao possui permissao de administrador no Supabase.
            </Text>
            <Button onPress={() => void signOut()} variant="secondary">
              Sair desta conta
            </Button>
          </View>
        ) : (
          <LoginForm />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  blockedCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    width: '100%',
  },
  blockedText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  blockedTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 22,
  },
  brandColumn: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 440,
  },
  brandColumnCompact: {
    flex: 0,
    marginBottom: theme.spacing.md,
    maxWidth: '100%',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  contentCompact: {
    alignItems: 'stretch',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  formColumn: {
    flex: 1,
    maxWidth: 460,
    width: '100%',
  },
  formColumnCompact: {
    flex: 0,
    maxWidth: '100%',
  },
  logo: {
    height: 140,
    marginBottom: theme.spacing.lg,
    width: 140,
  },
  logoCompact: {
    height: 96,
    marginBottom: theme.spacing.md,
    width: 96,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 420,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 22,
    maxWidth: '100%',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 42,
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 32,
  },
});
