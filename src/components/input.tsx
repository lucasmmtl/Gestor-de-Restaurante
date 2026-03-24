import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/constants/theme';

type InputProps = TextInputProps & {
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
};

export function Input({ error, label, multiline, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, multiline ? styles.multiline : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    marginBottom: 8,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  wrapper: {
    width: '100%',
  },
});
