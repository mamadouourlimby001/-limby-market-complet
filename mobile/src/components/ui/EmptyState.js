import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { colors } from '../../theme/theme';

export default function EmptyState({ icon, text }) {
  return (
    <View style={styles.wrap}>
      {icon || <Inbox size={48} color={colors.textLight} style={{ opacity: 0.4 }} />}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  text: { fontSize: 14, color: colors.textLight, marginTop: 12, textAlign: 'center' },
});
