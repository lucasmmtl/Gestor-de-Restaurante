import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

type QuickActionButtonProps = {
  description: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
  primary?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function QuickActionButton({
  description,
  icon,
  onPress,
  primary = false,
  style,
  title,
}: QuickActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        primary ? styles.primaryShell : styles.secondaryShell,
        pressed ? styles.pressed : null,
        style,
      ]}>
      {primary ? (
        <LinearGradient
          colors={['#FF4D4D', '#FF2D2D', '#C31616']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={[styles.iconWrap, primary ? styles.iconWrapPrimary : null]}>
        <MaterialCommunityIcons color={theme.colors.text} name={icon} size={20} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.description, primary ? styles.descriptionPrimary : null]}>{description}</Text>
      </View>

      <MaterialCommunityIcons color={theme.colors.text} name="chevron-right" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  descriptionPrimary: {
    color: 'rgba(255,255,255,0.84)',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconWrapPrimary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  pressable: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 92,
    overflow: 'hidden',
    padding: theme.spacing.md,
  },
  primaryShell: {
    backgroundColor: '#FF2D2D',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryShell: {
    backgroundColor: 'rgba(17, 17, 17, 0.92)',
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
});
