import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

// Équivalent de la classe .page de frontend/src/index.css : conteneur scrollable
// avec le padding standard, utilisé par les écrans de formulaire/détail.
export default function Screen({ children, contentContainerStyle, center = false }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, center && styles.center, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, paddingBottom: 32 },
  center: { maxWidth: 400, width: '100%', alignSelf: 'center', paddingTop: 40 },
});
