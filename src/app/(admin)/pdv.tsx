import {
  Alert,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CartItem } from "@/components/cart-item";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { Screen } from "@/components/screen";
import { StatusBadge } from "@/components/status-badge";
import { theme } from "@/constants/theme";
import { ManualItemModal } from "@/features/pdv/components/manual-item-modal";
import { ModifierSelectionModal } from "@/features/pdv/components/modifier-selection-modal";
import { useProducts } from "@/hooks/use-menu";
import {
  useCreateOrder,
  useMarkOrderPaid,
  usePendingOrders,
} from "@/hooks/use-orders";
import { formatCurrency, formatDateTime, getErrorMessage } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import type { CartItemModifier, ProductListItem } from "@/types/models";

export default function PdvScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const isCompact = width < 760;
  const { data: products } = useProducts();
  const { data: pendingOrders } = usePendingOrders();
  const createOrder = useCreateOrder();
  const markOrderPaid = useMarkOrderPaid();
  const cart = useCartStore();
  const ui = useUiStore();

  async function handleCreateOrder(markAsPaid = false) {
    try {
      await createOrder.mutateAsync({
        items: cart.items.map((item) => ({
          modifierIds: item.modifiers.map((modifier) => modifier.modifierId),
          name: item.kind === "manual" ? item.name : undefined,
          price: item.kind === "manual" ? item.price : undefined,
          productId: item.productId,
          quantity: item.quantity,
        })),
        markAsPaid,
      });
      cart.clear();
      Alert.alert("Pedido realizado");
    } catch (error) {
      Alert.alert(
        "Nao foi possivel finalizar o pedido",
        getErrorMessage(error),
      );
    }
  }

  async function handleMarkPaid(orderId: string) {
    try {
      await markOrderPaid.mutateAsync(orderId);
    } catch (error) {
      Alert.alert("Nao foi possivel marcar como pago", getErrorMessage(error));
    }
  }

  function handleSelectProduct(product: ProductListItem) {
    if (product.directModifiers.length) {
      ui.openModifierSelection(product);
      return;
    }

    cart.addConfiguredProduct({
      imageUrl: product.image_url,
      modifiers: [],
      name: product.name,
      price: Number(product.price),
      productId: product.id,
    });
  }

  function handleConfiguredProduct(modifiers: CartItemModifier[]) {
    if (!ui.selectedCartProduct) {
      return;
    }

    cart.addConfiguredProduct({
      imageUrl: ui.selectedCartProduct.image_url,
      modifiers,
      name: ui.selectedCartProduct.name,
      price: Number(ui.selectedCartProduct.price),
      productId: ui.selectedCartProduct.id,
    });
    ui.closeModifierSelection();
  }

  const activeProducts = (products ?? []).filter((product) => product.active);

  return (
    <Screen>
      <Header
        action={
          <Button onPress={ui.openManualItemModal} variant="secondary">
            Item manual
          </Button>
        }
        subtitle="Monte pedidos com complementos e molhos por produto e acompanhe o fechamento em um fluxo mais direto."
        title="PDV"
      />

      <View style={[styles.overviewGrid, isCompact ? styles.overviewGridCompact : null]}>
        <Card style={[styles.overviewCard, isCompact ? styles.overviewCardCompact : null]}>
          <Text style={styles.overviewLabel}>Produtos ativos</Text>
          <Text style={styles.overviewValue}>{activeProducts.length}</Text>
          <Text style={styles.overviewMeta}>Itens prontos para venda.</Text>
        </Card>
        <Card style={[styles.overviewCard, isCompact ? styles.overviewCardCompact : null]}>
          <Text style={styles.overviewLabel}>Carrinho</Text>
          <Text style={styles.overviewValue}>{cart.itemCount}</Text>
          <Text style={styles.overviewMeta}>{formatCurrency(cart.subtotal)} no subtotal.</Text>
        </Card>
        <Card style={[styles.overviewCard, isCompact ? styles.overviewCardCompact : null]}>
          <Text style={styles.overviewLabel}>Pendentes</Text>
          <Text style={styles.overviewValue}>{pendingOrders?.length ?? 0}</Text>
          <Text style={styles.overviewMeta}>Pedidos aguardando baixa final.</Text>
        </Card>
      </View>

      <View style={[styles.columns, !isWide ? styles.columnsStacked : null]}>
        <View style={[styles.productsColumn, !isWide ? styles.productsColumnCompact : null]}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produtos</Text>
              <StatusBadge
                label={`${activeProducts.length} ativos`}
                tone="neutral"
              />
            </View>
            <Text style={styles.sectionDescription}>
              Toque em um produto para adicionar direto ao carrinho ou configurar os modificadores.
            </Text>

            <View style={[styles.grid, isCompact ? styles.gridCompact : null]}>
              {activeProducts.map((product) => (
                <View
                  key={product.id}
                  style={[styles.productSlot, isCompact ? styles.productSlotCompact : null]}
                >
                  <ProductCard
                    primaryAction={{
                      label: product.directModifiers.length
                        ? "Configurar"
                        : "Adicionar",
                      onPress: () => handleSelectProduct(product),
                    }}
                    product={product}
                  />
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={[styles.sidebar, !isWide ? styles.sidebarCompact : null]}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Carrinho</Text>
              <StatusBadge label={`${cart.itemCount} itens`} tone="warning" />
            </View>

            {cart.items.length ? (
              cart.items.map((item) => (
                <CartItem
                  item={item}
                  key={item.id}
                  onDecrease={() => cart.decrementItem(item.id)}
                  onIncrease={() => cart.incrementItem(item.id)}
                  onRemove={() => cart.removeItem(item.id)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Selecione um produto ou adicione um item manual.
              </Text>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(cart.subtotal)}
              </Text>
            </View>

            <View style={styles.ctaGroup}>
              <Button
                disabled={!cart.items.length}
                loading={createOrder.isPending}
                onPress={() => void handleCreateOrder(false)}
              >
                Finalizar pedido
              </Button>
              <Button
                disabled={!cart.items.length}
                loading={createOrder.isPending}
                onPress={() => void handleCreateOrder(true)}
                variant="secondary"
              >
                Finalizar e marcar pago
              </Button>
              <Button
                disabled={!cart.items.length}
                onPress={cart.clear}
                variant="ghost"
              >
                Limpar carrinho
              </Button>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pedidos pendentes</Text>
              <StatusBadge
                label={`${pendingOrders?.length ?? 0} abertos`}
                tone="warning"
              />
            </View>

            {(pendingOrders ?? []).length ? (
              (pendingOrders ?? []).map((order) => (
                <View
                  key={order.id}
                  style={[styles.pendingOrder, isCompact ? styles.pendingOrderCompact : null]}
                >
                  <View style={styles.pendingCopy}>
                    <Text style={styles.pendingTitle}>
                      {formatCurrency(order.total)}
                    </Text>
                    <Text style={styles.pendingMeta}>
                      {formatDateTime(order.created_at)} |{" "}
                      {order.items
                        .map((item) =>
                          item.modifiers.length
                            ? `${item.name} (${item.modifiers.map((modifier) => modifier.name).join(", ")})`
                            : item.name,
                        )
                        .join(", ")}
                    </Text>
                  </View>
                  <Button
                    loading={markOrderPaid.isPending}
                    onPress={() => void handleMarkPaid(order.id)}
                    style={[styles.pendingButton, isCompact ? styles.pendingButtonCompact : null]}
                    variant="secondary"
                  >
                    Marcar pago
                  </Button>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum pedido pendente agora.
              </Text>
            )}
          </Card>
        </View>
      </View>

      <ModifierSelectionModal
        onClose={ui.closeModifierSelection}
        onConfirm={handleConfiguredProduct}
        product={ui.selectedCartProduct}
        visible={ui.isModifierSelectionOpen}
      />

      <ManualItemModal
        onClose={ui.closeManualItemModal}
        onSubmit={(payload) => {
          cart.addManualItem(payload);
          ui.closeManualItemModal();
        }}
        visible={ui.isManualItemModalOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
  },
  columnsStacked: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  ctaGroup: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  gridCompact: {
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  pendingButton: {
    minHeight: 42,
    minWidth: 140,
  },
  pendingButtonCompact: {
    minWidth: 0,
    width: "100%",
  },
  pendingCopy: {
    flex: 1,
    gap: 4,
  },
  pendingMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  pendingOrder: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  pendingOrderCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  pendingTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
  },
  overviewCard: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 180,
  },
  overviewCardCompact: {
    minWidth: 0,
    width: "100%",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  overviewGridCompact: {
    flexDirection: "column",
  },
  overviewLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  overviewMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  overviewValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 30,
  },
  productSlot: {
    flexGrow: 1,
    minWidth: 260,
  },
  productSlotCompact: {
    minWidth: 0,
    width: "100%",
  },
  productsColumn: {
    flex: 2,
    minWidth: 0,
  },
  productsColumnCompact: {
    width: "100%",
  },
  sectionCard: {
    gap: theme.spacing.md,
    width: "100%",
  },
  sectionDescription: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  sidebar: {
    flex: 1,
    gap: theme.spacing.md,
    minWidth: 320,
  },
  sidebarCompact: {
    minWidth: 0,
    width: "100%",
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  summaryValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 22,
  },
});
