export const theme = {
  colors: {
    accent: '#A1A1AA',
    background: '#000000',
    border: 'rgba(255, 255, 255, 0.08)',
    danger: '#F87171',
    overlay: 'rgba(0, 0, 0, 0.72)',
    primary: '#FF2D2D',
    primaryMuted: '#541616',
    success: '#34D399',
    surface: '#111111',
    surfaceMuted: '#181818',
    surfaceSoft: '#202020',
    text: '#FFFFFF',
    textMuted: '#A1A1AA',
    warning: '#F59E0B',
  },
  fonts: {
    bold: 'Sora_700Bold',
    regular: 'Sora_400Regular',
    semiBold: 'Sora_600SemiBold',
  },
  layout: {
    maxWidth: 1280,
  },
  radius: {
    lg: 24,
    md: 18,
    pill: 999,
    sm: 12,
  },
  shadow: {
    card: {
      elevation: 12,
      shadowColor: '#000000',
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
    },
  },
  spacing: {
    lg: 20,
    md: 16,
    sm: 10,
    xl: 28,
    xs: 6,
    xxl: 36,
  },
} as const;
