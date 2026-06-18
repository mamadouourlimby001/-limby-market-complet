import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent .modal-overlay / .modal-content de frontend/src/index.css
export default function CenterModal({ visible, onClose, children, dismissable = true }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={dismissable ? onClose : undefined}>
        <Pressable style={styles.content} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: '#fff', borderRadius: radius, padding: 20, width: '100%', maxWidth: 400 },
});
