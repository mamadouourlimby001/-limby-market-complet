import { Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../theme/theme';

export default function FAB({ onPress }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Plus size={26} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
});
