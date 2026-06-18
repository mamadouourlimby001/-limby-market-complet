import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme/theme';

const VARIANTS = {
  danger: { bg: 'rgba(239,68,68,0.1)', fg: colors.danger, border: 'rgba(239,68,68,0.2)' },
  success: { bg: 'rgba(16,185,129,0.1)', fg: colors.success, border: 'rgba(16,185,129,0.2)' },
  info: { bg: 'rgba(74,144,217,0.1)', fg: colors.accent, border: 'rgba(74,144,217,0.2)' },
};

// Équivalent .alert / .alert-danger / .alert-success / .alert-info
export default function AlertBanner({ variant = 'danger', icon, children, style }) {
  const v = VARIANTS[variant] || VARIANTS.danger;
  return (
    <View style={[styles.box, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      {icon ? (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.text, { color: v.fg }, styles.flex]}>{children}</Text>
        </View>
      ) : (
        <Text style={[styles.text, { color: v.fg }]}>{children}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, borderRadius: radius, marginBottom: 12, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  flex: { flex: 1 },
  text: { fontSize: 13 },
});
