import { useState, forwardRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';

const FormInput = forwardRef(function FormInput(
  {
    label,
    error,
    containerStyle,
    style,
    multiline,
    secureTextEntry = false,
    keyboardType,
    autoCapitalize,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...inputProps
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showText, setShowText] = useState(false);

  // autoCapitalize=none automatique pour clavier numérique/téléphone/email
  const resolvedAutoCapitalize =
    autoCapitalize !== undefined
      ? autoCapitalize
      : keyboardType === 'phone-pad' ||
        keyboardType === 'numeric' ||
        keyboardType === 'email-address'
      ? 'none'
      : undefined;

  return (
    <View style={[styles.group, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          isFocused && styles.inputWrapFocused,
          error && styles.inputWrapError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.control, multiline && styles.multiline, style]}
          placeholderTextColor={colors.textLight}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !showText}
          keyboardType={keyboardType}
          autoCapitalize={resolvedAutoCapitalize}
          onFocus={(e) => { setIsFocused(true); onFocusProp?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlurProp?.(e); }}
          {...inputProps}
        />
        {secureTextEntry && !multiline && (
          <Pressable
            onPress={() => setShowText((v) => !v)}
            style={styles.toggleBtn}
            hitSlop={8}
          >
            {showText
              ? <EyeOff size={18} color={colors.textLight} />
              : <Eye size={18} color={colors.textLight} />}
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default FormInput;

const styles = StyleSheet.create({
  group: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 5 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  inputWrapFocused: { borderColor: colors.primary },
  inputWrapError: { borderColor: colors.danger },
  control: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
