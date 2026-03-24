import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/components/DashboardCard';
import { QuickActionButton } from '@/features/dashboard/components/QuickActionButton';
import { RecentOrderItem } from '@/features/dashboard/components/RecentOrderItem';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useRecentOrders } from '@/hooks/use-orders';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import type { DashboardStats } from '@/types/models';

type DashboardIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getGreeting(date: Date) {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Bom dia';
  }

  if (hour < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}

function getFormattedDate(date: Date) {
  return capitalize(
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      weekday: 'long',
    }).format(date)
  );
}

function getFirstName(name?: string | null) {
  if (!name) {
    return 'Operador';
  }

  const normalized = name.includes('@') ? name.split('@')[0] : name;
  return normalized.trim().split(/\s+/)[0] ?? 'Operador';
}

function getPerformanceSnapshot(stats?: DashboardStats) {
  if (!stats) {
    return {
      detail: 'Sincronizando indicadores da operacao.',
      icon: 'chart-timeline-variant' as DashboardIconName,
      label: 'Painel atualizando',
      tone: 'neutral' as const,
    };
  }

  if (stats.lowStockCount === 0 && stats.pendingOrders <= 2) {
    return {
      detail: 'Fila controlada e estoque operando sem alertas.',
      icon: 'trending-up' as DashboardIconName,
      label: 'Operacao em alta',
      tone: 'success' as const,
    };
  }

  if (stats.lowStockCount >= 4 || stats.pendingOrders >= 6) {
    return {
      detail: 'Vale revisar reposicao e acelerar o fechamento dos pedidos.',
      icon: 'alert-circle-outline' as DashboardIconName,
      label: 'Atencao no turno',
      tone: 'warning' as const,
    };
  }

  return {
    detail: 'Os indicadores estao estaveis, com margem para ganhar ritmo.',
    icon: 'chart-line' as DashboardIconName,
    label: 'Ritmo constante',
    tone: 'neutral' as const,
  };
}

const performanceToneStyles = {
  neutral: {
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    color: '#93C5FD',
  },
  success: {
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    color: theme.colors.success,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    color: theme.colors.warning,
  },
} as const;

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isNarrow = width < 420;
  const dashboardQuery = useDashboardStats();
  const ordersQuery = useRecentOrders();
  const stats = dashboardQuery.data;
  const recentOrders = ordersQuery.data ?? [];
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useAuthStore((state) => state.profile);

  const today = new Date();
  const greeting = getGreeting(today);
  const formattedDate = getFormattedDate(today);
  const firstName = getFirstName(profile?.full_name ?? profile?.email ?? null);
  const performance = getPerformanceSnapshot(stats);
  const compactMetricWidth = isNarrow
    ? '100%'
    : Math.max((width - theme.spacing.lg * 2 - theme.spacing.md) / 2, 156);

  const metricCards: {
    caption: string;
    description: string;
    icon: DashboardIconName;
    title: string;
    tone: 'danger' | 'neutral' | 'success' | 'warning';
    trendDirection: 'down' | 'neutral' | 'up';
    trendLabel: string;
  }[] = [
    {
      caption: 'Cardapio',
      description: 'Itens ativos disponiveis para venda agora.',
      icon: 'silverware-fork-knife',
      title: String(stats?.activeProducts ?? 0),
      tone: 'neutral' as const,
      trendDirection: (stats?.activeProducts ?? 0) > 0 ? ('up' as const) : ('neutral' as const),
      trendLabel: (stats?.activeProducts ?? 0) > 0 ? 'Base ativa' : 'Sem itens',
    },
    {
      caption: 'Pendentes',
      description: 'Pedidos aguardando confirmacao ou fechamento.',
      icon: 'clipboard-text-clock-outline',
      title: String(stats?.pendingOrders ?? 0),
      tone: 'warning' as const,
      trendDirection: (stats?.pendingOrders ?? 0) > 4 ? ('down' as const) : ('neutral' as const),
      trendLabel: (stats?.pendingOrders ?? 0) > 4 ? 'Fila alta' : 'Sob controle',
    },
    {
      caption: 'Estoque',
      description: 'Itens abaixo do minimo configurado para reposicao.',
      icon: 'package-variant-closed',
      title: String(stats?.lowStockCount ?? 0),
      tone: 'danger' as const,
      trendDirection: (stats?.lowStockCount ?? 0) > 0 ? ('down' as const) : ('up' as const),
      trendLabel: (stats?.lowStockCount ?? 0) > 0 ? 'Reposicao' : 'Tudo em dia',
    },
    {
      caption: 'Hoje',
      description: 'Receita acumulada em pedidos pagos no dia.',
      icon: 'cash-fast',
      title: formatCurrency(stats?.todayRevenue ?? 0),
      tone: 'success' as const,
      trendDirection: (stats?.todayRevenue ?? 0) > 0 ? ('up' as const) : ('neutral' as const),
      trendLabel: (stats?.todayRevenue ?? 0) > 0 ? 'Faturando' : 'Primeira venda',
    },
  ];

  const actionShells = isCompact
    ? [styles.primaryActionShellCompact, styles.secondaryActionShellCompact, styles.secondaryActionShellCompact]
    : [styles.primaryActionShellWide, styles.secondaryActionShellWide, styles.secondaryActionShellWide];

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Nao foi possivel sair', getErrorMessage(error));
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['rgba(40, 40, 40, 0.64)', 'rgba(15, 15, 15, 0.96)', 'rgba(12, 12, 12, 0.98)']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.hero}>
        <View style={[styles.heroTopRow, isCompact ? styles.heroTopRowCompact : null]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroDate}>{formattedDate}</Text>
            <Text style={styles.heroTitle}>
              {greeting}, {firstName} {'\u{1F44B}'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Acompanhe a operacao da loja, priorize o caixa e ajuste o cardapio com mais clareza.
            </Text>
          </View>

          <Pressable
            onPress={() => void handleSignOut()}
            style={({ pressed }) => [styles.signOutButton, pressed ? styles.pressed : null]}>
            <MaterialCommunityIcons color={theme.colors.text} name="logout-variant" size={18} />
            <Text style={styles.signOutLabel}>Sair</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.performanceChip,
            { backgroundColor: performanceToneStyles[performance.tone].backgroundColor },
          ]}>
          <MaterialCommunityIcons
            color={performanceToneStyles[performance.tone].color}
            name={performance.icon}
            size={18}
          />
          <Text style={styles.performanceLabel}>{performance.label}</Text>
        </View>

        <Text style={styles.performanceDetail}>{performance.detail}</Text>

        <View style={[styles.heroStatsRow, isCompact ? styles.heroStatsRowCompact : null]}>
          <View style={styles.heroStatBubble}>
            <Text style={styles.heroStatValue}>{formatCurrency(stats?.todayRevenue ?? 0)}</Text>
            <Text style={styles.heroStatLabel}>Receita do dia</Text>
          </View>
          <View style={styles.heroStatBubble}>
            <Text style={styles.heroStatValue}>{stats?.pendingOrders ?? 0}</Text>
            <Text style={styles.heroStatLabel}>Pedidos pendentes</Text>
          </View>
          <View style={styles.heroStatBubble}>
            <Text style={styles.heroStatValue}>{stats?.lowStockCount ?? 0}</Text>
            <Text style={styles.heroStatLabel}>Alertas de estoque</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionEyebrow}>Visao geral</Text>
          <Text style={styles.sectionTitle}>Indicadores do turno</Text>
        </View>
        <StatusBadge label="Atualizado agora" tone="neutral" />
      </View>

      <View style={styles.metricGrid}>
        {metricCards.map((card) => (
          <DashboardCard
            key={card.caption}
            caption={card.caption}
            description={card.description}
            icon={card.icon}
            loading={dashboardQuery.isLoading}
            style={[
              styles.metricCard,
              isCompact
                ? [styles.metricCardCompact, { width: compactMetricWidth }]
                : styles.metricCardWide,
            ]}
            title={card.title}
            tone={card.tone}
            trendDirection={card.trendDirection}
            trendLabel={card.trendLabel}
          />
        ))}
      </View>

      <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionEyebrow}>Atalhos</Text>
          <Text style={styles.sectionTitle}>Acoes rapidas</Text>
        </View>
        <Text style={[styles.sectionHint, isCompact ? styles.sectionHintCompact : null]}>
          Ganhe velocidade nas tarefas que mais acontecem.
        </Text>
      </View>

      <View style={[styles.quickActionsGrid, isCompact ? styles.quickActionsGridCompact : null]}>
        <QuickActionButton
          description="Abra o fluxo principal de venda com prioridade visual."
          icon="cash-register"
          onPress={() => router.push('/pdv')}
          primary
          style={isCompact ? styles.quickActionCompact : actionShells[0]}
          title="Abrir PDV"
        />
        <QuickActionButton
          description="Confira reposicao e movimente entradas ou saidas."
          icon="package-variant"
          onPress={() => router.push('/inventory')}
          style={isCompact ? styles.quickActionCompact : actionShells[1]}
          title="Estoque"
        />
        <QuickActionButton
          description="Revise produtos, precos e opcoes do cardapio."
          icon="silverware-fork-knife"
          onPress={() => router.push('/menu')}
          style={isCompact ? styles.quickActionCompact : actionShells[2]}
          title="Cardapio"
        />
      </View>

      <Card style={styles.ordersCard}>
        <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionEyebrow}>Fluxo recente</Text>
            <Text style={styles.sectionTitle}>Pedidos recentes</Text>
          </View>
          <StatusBadge label={`${recentOrders.length} pedidos`} tone="neutral" />
        </View>

        <Text style={styles.ordersDescription}>
          Veja o que acabou de passar pelo caixa e identifique gargalos antes que virem fila.
        </Text>

        {ordersQuery.isLoading ? (
          <>
            <RecentOrderItem loading />
            <RecentOrderItem loading />
            <RecentOrderItem loading />
          </>
        ) : recentOrders.length ? (
          recentOrders.map((order) => <RecentOrderItem key={order.id} order={order} />)
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons color={theme.colors.textMuted} name="receipt-text-outline" size={24} />
            <Text style={styles.emptyTitle}>Nenhum pedido recente</Text>
            <Text style={styles.emptyText}>Os pedidos criados no PDV vao aparecer aqui com o status atualizado.</Text>
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  hero: {
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32,
    borderWidth: 1,
    gap: theme.spacing.md,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    position: 'relative',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  heroDate: {
    color: 'rgba(255,255,255,0.68)',
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroStatBubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 0,
    padding: theme.spacing.md,
  },
  heroStatLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
  heroStatValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  heroStatsRowCompact: {
    flexDirection: 'column',
  },
  heroSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 520,
  },
  heroTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    lineHeight: 38,
  },
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  heroTopRowCompact: {
    flexDirection: 'column',
  },
  metricCard: {
    alignSelf: 'stretch',
  },
  metricCardCompact: {
    flexGrow: 0,
  },
  metricCardWide: {
    width: '23.8%',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  ordersCard: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  ordersDescription: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  performanceChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  performanceDetail: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
  },
  performanceLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  primaryActionShellCompact: {
    width: '100%',
  },
  primaryActionShellWide: {
    width: '49%',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionsGridCompact: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  quickActionCompact: {
    width: '100%',
  },
  secondaryActionShellCompact: {
    width: '48%',
  },
  secondaryActionShellWide: {
    width: '23.5%',
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  sectionEyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  sectionHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  sectionHint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    maxWidth: 220,
    textAlign: 'right',
  },
  sectionHintCompact: {
    maxWidth: '100%',
    textAlign: 'left',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signOutLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
  },
});
