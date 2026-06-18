import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { colors } from '../../theme/theme';

export default function StatCard({ icon, value, label, valueColor }) {
  return (
    <Card style={styles.card}>
      {icon}
      <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, flex: 1, minWidth: '47%' },
  value: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 6 },
  label: { fontSize: 11, color: colors.textLight, marginTop: 2 },
});
