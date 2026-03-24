import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/constants/theme';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

type ButtonProps = {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

const stylesByVariant: Record<ButtonVariant, ViewStyle> = {
  danger: {
    backgroundColor: '#5A1A1A',
    borderColor: '#7F1D1D',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
  },
};

export function Button({
  children,
  disabled = false,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        stylesByVariant[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <View>
          <Text style={styles.label}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
