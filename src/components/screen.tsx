import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppAssets } from '@/constants/assets';
import { theme } from '@/constants/theme';

type ScreenProps = {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  contentContainerStyle,
  scroll = true,
  style,
}: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.root, style]}>
      <ImageBackground source={AppAssets.background} style={StyleSheet.absoluteFill} imageStyle={styles.image} />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.90)', 'rgba(12, 12, 12, 0.96)', 'rgba(0, 0, 0, 1)']}
        style={StyleSheet.absoluteFill}
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    gap: theme.spacing.lg,
    maxWidth: theme.layout.maxWidth,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    width: '100%',
  },
  image: {
    opacity: 0.08,
  },
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
