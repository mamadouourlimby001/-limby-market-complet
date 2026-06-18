import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent .form-group / .form-control de frontend/src/index.css
export default function FormInput({
  label,
  error,
  containerStyle,
  style,
  multiline,
  ...inputProps
}) {
  return (
    <View style={[styles.group, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.control, multiline && styles.multiline, error && styles.controlError, style]}
        placeholderTextColor={colors.textLight}
        multiline={multiline}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 5 },
  control: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius,
    fontSize: 14,
    backgroundColor: '#fff',
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  controlError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
