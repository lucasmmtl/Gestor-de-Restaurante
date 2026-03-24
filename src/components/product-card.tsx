import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { theme } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";
import type { ProductListItem } from "@/types/models";

type ProductCardProps = {
  onDelete?: () => void;
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
  };
  product: ProductListItem;
  secondaryAction?: {
    label: string;
    onPress: () => void;
    variant?: "danger" | "ghost" | "secondary";
  };
};

export function ProductCard({
  onDelete,
  primaryAction,
  product,
  secondaryAction,
}: ProductCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image
            contentFit="cover"
            source={{ uri: product.image_url }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Gestor Restaurante</Text>
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.name}>
            {product.name}
          </Text>
          {!product.active ? (
            <StatusBadge label="Inativo" tone="warning" />
          ) : null}
        </View>

        <Text numberOfLines={2} style={styles.description}>
          {product.description || "Sem descricao cadastrada."}
        </Text>

        <Text style={styles.price}>
          {formatCurrency(Number(product.price))}
        </Text>

        <View style={styles.categories}>
          {product.categories.length ? (
            product.categories.map((category) => (
              <StatusBadge
                key={category.id}
                label={category.name}
                tone="neutral"
              />
            ))
          ) : (
            <StatusBadge label="Sem categoria" tone="neutral" />
          )}
          {product.directModifiers.length ? (
            <StatusBadge
              label={`${product.directModifiers.length} modificadores`}
              tone="success"
            />
          ) : null}
          {product.stockLinks.length ? (
            <StatusBadge
              label={`${product.stockLinks.length} insumos`}
              tone="warning"
            />
          ) : null}
        </View>
      </View>

      {primaryAction || secondaryAction || onDelete ? (
        <View style={styles.actions}>
          {primaryAction ? (
            <Button
              onPress={primaryAction.onPress}
              style={styles.actionButton}
              variant={primaryAction.variant ?? "primary"}
            >
              {primaryAction.label}
            </Button>
          ) : null}

          {secondaryAction ? (
            <Button
              onPress={secondaryAction.onPress}
              style={styles.actionButton}
              variant={secondaryAction.variant ?? "secondary"}
            >
              {secondaryAction.label}
            </Button>
          ) : null}

          {onDelete ? (
            <Button
              onPress={onDelete}
              style={styles.actionButton}
              variant="danger"
            >
              Excluir
            </Button>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minHeight: 44,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  card: {
    flex: 1,
    gap: theme.spacing.md,
    minWidth: 260,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  copy: {
    gap: 10,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 40,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  imageWrap: {
    borderRadius: theme.radius.md,
    height: 160,
    overflow: "hidden",
  },
  name: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    flex: 1,
    justifyContent: "center",
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  price: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
