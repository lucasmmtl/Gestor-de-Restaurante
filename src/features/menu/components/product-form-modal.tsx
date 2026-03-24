import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import type {
  Category,
  LinkedStockInput,
  ModifierListItem,
  ModifierType,
  ProductImageAsset,
  ProductListItem,
  ProductPayload,
  StockItem,
} from '@/types/models';

type ProductFormModalProps = {
  categories: Category[];
  initialValue?: ProductListItem | null;
  loading?: boolean;
  modifiers: ModifierListItem[];
  onClose: () => void;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  stockItems: StockItem[];
  visible: boolean;
};

const directModifierTypes: ModifierType[] = ['complement', 'sauce'];

const modifierTypeLabels: Record<ModifierType, string> = {
  complement: 'Complemento',
  sauce: 'Molho',
};

export function ProductFormModal({
  categories,
  initialValue,
  loading = false,
  modifiers,
  onClose,
  onSubmit,
  stockItems,
  visible,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [selectedModifierTypes, setSelectedModifierTypes] = useState<ModifierType[]>([]);
  const [stockLinks, setStockLinks] = useState<LinkedStockInput[]>([]);
  const [image, setImage] = useState<ProductImageAsset | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialValue?.name ?? '');
    setDescription(initialValue?.description ?? '');
    setPrice(initialValue ? String(initialValue.price) : '');
    setActive(initialValue?.active ?? true);
    setCategoryIds(initialValue?.categories.map((category) => category.id) ?? []);
    setModifierIds(initialValue?.directModifiers.map((modifier) => modifier.id) ?? []);
    setSelectedModifierTypes(
      Array.from(new Set(initialValue?.directModifiers.map((modifier) => modifier.type) ?? []))
    );
    setStockLinks(
      initialValue?.stockLinks.map((link) => ({
        quantityUsed: link.quantityUsed,
        stockItemId: link.stockItemId,
      })) ?? []
    );
    setImage(null);
    setImageUrl(initialValue?.image_url ?? null);
  }, [initialValue, visible]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setImage({
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      uri: asset.uri,
    });
    setImageUrl(asset.uri);
  }

  function toggleCategory(categoryId: string) {
    setCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId]
    );
  }

  function toggleModifierType(type: ModifierType) {
    if (selectedModifierTypes.includes(type)) {
      setSelectedModifierTypes((current) => current.filter((item) => item !== type));
      setModifierIds((current) =>
        current.filter((modifierId) => {
          const modifier = modifiers.find((item) => item.id === modifierId);
          return modifier?.type !== type;
        })
      );
      return;
    }

    setSelectedModifierTypes((current) => [...current, type]);
  }

  function toggleModifier(modifierId: string) {
    setModifierIds((current) =>
      current.includes(modifierId)
        ? current.filter((item) => item !== modifierId)
        : [...current, modifierId]
    );
  }

  function toggleStockItem(stockItemId: string) {
    setStockLinks((current) =>
      current.some((link) => link.stockItemId === stockItemId)
        ? current.filter((link) => link.stockItemId !== stockItemId)
        : [...current, { quantityUsed: 1, stockItemId }]
    );
  }

  function updateStockQuantity(stockItemId: string, value: string) {
    setStockLinks((current) =>
      current.map((link) =>
        link.stockItemId === stockItemId
          ? { ...link, quantityUsed: Number(value.replace(',', '.')) || 0 }
          : link
      )
    );
  }

  async function handleSubmit() {
    await onSubmit({
      active,
      categoryIds,
      description,
      image,
      imageUrl,
      modifierIds,
      name,
      price: Number(price.replace(',', '.')),
      stockLinks: stockLinks.filter((link) => link.quantityUsed > 0),
    });
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>{initialValue ? 'Editar produto' : 'Novo produto'}</Text>

              <Input label="Nome" onChangeText={setName} placeholder="Pizza Calabresa" value={name} />
              <Input
                label="Descricao"
                multiline
                onChangeText={setDescription}
                placeholder="Molho especial, queijo e calabresa."
                value={description}
              />
              <Input
                keyboardType="decimal-pad"
                label="Preco base"
                onChangeText={setPrice}
                placeholder="39.90"
                value={price}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Produto ativo</Text>
                <Switch
                  onValueChange={setActive}
                  thumbColor={theme.colors.text}
                  trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.primary }}
                  value={active}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Categorias</Text>
                <View style={styles.choiceWrap}>
                  {categories.map((category) => (
                    <Pressable key={category.id} onPress={() => toggleCategory(category.id)}>
                      <StatusBadge
                        label={category.name}
                        tone={categoryIds.includes(category.id) ? 'success' : 'neutral'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Modificadores diretos</Text>
                <Text style={styles.groupHint}>
                  Escolha se o produto aceita complemento, molho ou ambos. Depois selecione os itens
                  cadastrados que ficarao disponiveis no PDV.
                </Text>
                <View style={styles.choiceWrap}>
                  {directModifierTypes.map((modifierType) => (
                    <Pressable key={modifierType} onPress={() => toggleModifierType(modifierType)}>
                      <StatusBadge
                        label={modifierTypeLabels[modifierType]}
                        tone={selectedModifierTypes.includes(modifierType) ? 'success' : 'neutral'}
                      />
                    </Pressable>
                  ))}
                </View>

                {selectedModifierTypes.map((modifierType) => {
                  const availableModifiers = modifiers.filter(
                    (modifier) =>
                      modifier.type === modifierType &&
                      (modifier.active || modifierIds.includes(modifier.id))
                  );

                  return (
                    <View key={modifierType} style={styles.modifierTypeSection}>
                      <Text style={styles.groupTitle}>{modifierTypeLabels[modifierType]}s disponiveis</Text>
                      {availableModifiers.length ? (
                        <View style={styles.choiceWrap}>
                          {availableModifiers.map((modifier) => (
                            <Pressable key={modifier.id} onPress={() => toggleModifier(modifier.id)}>
                              <StatusBadge
                                label={`${modifier.name} (+${Number(modifier.price).toFixed(2)})`}
                                tone={modifierIds.includes(modifier.id) ? 'success' : 'neutral'}
                              />
                            </Pressable>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.groupHint}>
                          Nenhum {modifierTypeLabels[modifierType].toLowerCase()} ativo cadastrado.
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Consumo de estoque</Text>
                <View style={styles.choiceWrap}>
                  {stockItems.map((stockItem) => (
                    <Pressable key={stockItem.id} onPress={() => toggleStockItem(stockItem.id)}>
                      <StatusBadge
                        label={`${stockItem.name} (${stockItem.unit})`}
                        tone={
                          stockLinks.some((link) => link.stockItemId === stockItem.id)
                            ? 'success'
                            : 'neutral'
                        }
                      />
                    </Pressable>
                  ))}
                </View>

                {stockLinks.map((link) => {
                  const stockItem = stockItems.find((item) => item.id === link.stockItemId);

                  if (!stockItem) {
                    return null;
                  }

                  return (
                    <Input
                      key={link.stockItemId}
                      keyboardType="decimal-pad"
                      label={`Quantidade usada de ${stockItem.name}`}
                      onChangeText={(value) => updateStockQuantity(link.stockItemId, value)}
                      placeholder="1"
                      value={String(link.quantityUsed)}
                    />
                  );
                })}
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Imagem</Text>
                {imageUrl ? <Image contentFit="cover" source={{ uri: imageUrl }} style={styles.image} /> : null}
                <Button onPress={() => void pickImage()} variant="secondary">
                  {imageUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                </Button>
              </View>

              <View style={styles.actions}>
                <Button onPress={onClose} style={styles.action} variant="ghost">
                  Cancelar
                </Button>
                <Button
                  disabled={!name || !price}
                  loading={loading}
                  onPress={() => void handleSubmit()}
                  style={styles.action}>
                  Salvar
                </Button>
              </View>
            </View>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  content: {
    gap: theme.spacing.md,
  },
  group: {
    gap: theme.spacing.sm,
  },
  groupHint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  groupTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  image: {
    borderRadius: theme.radius.md,
    height: 180,
    width: '100%',
  },
  modal: {
    maxHeight: '90%',
    maxWidth: 620,
    width: '100%',
  },
  modifierTypeSection: {
    gap: theme.spacing.xs,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  switchLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
