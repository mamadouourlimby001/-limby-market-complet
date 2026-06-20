// Reprend à l'identique les tokens CSS de frontend/src/index.css (:root)
export const colors = {
  primary: '#1B2A6B',
  primaryLight: '#2a3d8f',
  primaryDark: '#111d4a',
  accent: '#4A90D9',
  bg: '#F5F5F5',
  bgWhite: '#FFFFFF',
  text: '#1a1a2e',
  textLight: '#6b7280',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  border: '#e5e7eb',
  white: '#FFFFFF',
  textMid: '#4b5563',
  textMuted: '#9ca3af',
  textDark: '#1f2937',
};

export const radius = 10;

export const shadow = {
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const statusColors = {
  en_attente: colors.warning,
  'confirmée': '#3b82f6',
  'livrée': colors.success,
  'annulée': '#dc3545',
};

export const statusLabels = {
  en_attente: 'En attente',
  'confirmée': 'Confirmée',
  'livrée': 'Livrée',
  'annulée': 'Annulée',
};

export default { colors, radius, shadow, spacing, fontFamily, statusColors, statusLabels };
