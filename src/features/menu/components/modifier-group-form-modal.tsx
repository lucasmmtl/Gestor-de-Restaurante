import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { StatusBadge } from '@/components/status-badge';
import { theme } from '@/constants/theme';
import { modifierTypeLabels } from '@/lib/labels';
import type { ModifierGroupListItem, ModifierGroupPayload, ModifierListItem } from '@/types/models';

type ModifierGroupFormModalProps = {
  initialValue?: ModifierGroupListItem | null;
  loading?: boolean;
  modifiers: ModifierListItem[];
  onClose: () => void;
  onSubmit: (payload: ModifierGroupPayload) => Promise<void>;
  visible: boolean;
};

export function ModifierGroupFormModal({
  initialValue,
  loading = false,
  modifiers,
  onClose,
  onSubmit,
  visible,
}: ModifierGroupFormModalProps) {
  const [name, setName] = useState('');
  const [minSelect, setMinSelect] = useState('0');
  const [maxSelect, setMaxSelect] = useState('1');
  const [required, setRequired] = useState(false);
  const [active, setActive] = useState(true);
  const [modifierIds, setModifierIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialValue?.name ?? '');
    setMinSelect(String(initialValue?.min_select ?? 0));
    setMaxSelect(String(initialValue?.max_select ?? 1));
    setRequired(initialValue?.required ?? false);
    setActive(initialValue?.active ?? true);
    setModifierIds(initialValue?.modifiers.map((modifier) => modifier.id) ?? []);
  }, [initialValue, visible]);

  function toggleModifier(modifierId: string) {
    setModifierIds((current) =>
      current.includes(modifierId)
        ? current.filter((item) => item !== modifierId)
        : [...current, modifierId]
    );
  }

  async function handleSubmit() {
    await onSubmit({
      active,
      maxSelect: Number(maxSelect),
      minSelect: Number(minSelect),
      modifierIds,
      name,
      required,
    });
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <Card style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>{initialValue ? 'Editar grupo' : 'Novo grupo'}</Text>

              <Input
                label="Nome do grupo"
                onChangeText={setName}
                placeholder="Escolha ate 3 complementos"
                value={name}
              />
              <Input
                keyboardType="number-pad"
                label="Minimo de selecoes"
                onChangeText={setMinSelect}
                placeholder="0"
                value={minSelect}
              />
              <Input
                keyboardType="number-pad"
                label="Maximo de selecoes"
                onChangeText={setMaxSelect}
                placeholder="1"
                value={maxSelect}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Obrigatorio</Text>
                <Switch
                  onValueChange={setRequired}
                  thumbColor={theme.colors.text}
                  trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.primary }}
                  value={required}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Grupo ativo</Text>
                <Switch
                  onValueChange={setActive}
                  thumbColor={theme.colors.text}
                  trackColor={{ false: theme.colors.surfaceSoft, true: theme.colors.primary }}
                  value={active}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.groupTitle}>Modificadores disponiveis</Text>
                <View style={styles.choiceWrap}>
                  {modifiers.map((modifier) => (
                    <Pressable key={modifier.id} onPress={() => toggleModifier(modifier.id)}>
                      <StatusBadge
                        label={`${modifier.name} (${modifierTypeLabels[modifier.type]})`}
                        tone={modifierIds.includes(modifier.id) ? 'success' : 'neutral'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                <Button onPress={onClose} style={styles.action} variant="ghost">
                  Cancelar
                </Button>
                <Button
                  disabled={!name || !maxSelect}
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
  groupTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  modal: {
    maxHeight: '88%',
    maxWidth: 560,
    width: '100%',
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
