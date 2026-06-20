import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent des classes .btn / .btn-primary / .btn-secondary / .btn-danger / .btn-success
// de frontend/src/index.css.
const VARIANTS = {
  primary: { bg: colors.primary, fg: '#fff', border: null },
  secondary: { bg: colors.bg, fg: colors.primary, border: colors.border },
  danger: { bg: colors.danger, fg: '#fff', border: null },
  success: { bg: colors.success, fg: '#fff', border: null },
  warning: { bg: colors.warning, fg: '#fff', border: null },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  leftIcon,
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        block && styles.block,
        { backgroundColor: v.bg, borderColor: v.border || 'transparent', borderWidth: v.border ? 1.5 : 0 },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
          <Text style={[styles.text, size === 'sm' && styles.textSm, { color: v.fg }, textStyle]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius,
  },
  sm: { paddingVertical: 7, paddingHorizontal: 12 },
  block: { width: '100%' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginRight: 7 },
  text: { fontSize: 14, fontWeight: '600' },
  textSm: { fontSize: 12 },
});
