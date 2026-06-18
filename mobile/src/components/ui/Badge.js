import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

const VARIANTS = {
  primary: { bg: 'rgba(27,42,107,0.1)', fg: colors.primary },
  success: { bg: 'rgba(16,185,129,0.1)', fg: colors.success },
  danger: { bg: 'rgba(239,68,68,0.1)', fg: colors.danger },
  warning: { bg: 'rgba(245,158,11,0.1)', fg: colors.warning },
};

export default function Badge({ children, variant = 'primary', icon, style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      {icon}
      <Text style={[styles.text, { color: v.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
