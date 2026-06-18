import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin } from 'lucide-react-native';
import CenterModal from './ui/CenterModal';
import { colors, radius } from '../theme/theme';

// Portage de frontend/src/components/LocationPermissionModal.jsx
export default function LocationPermissionModal({ visible, onClose }) {
  const markAsked = () => AsyncStorage.setItem('locationPermissionAsked', 'true');

  const handleYes = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch (e) {
      // silencieux, comme côté web
    } finally {
      await markAsked();
      onClose();
    }
  };

  const handleCancel = async () => {
    await markAsked();
    onClose();
  };

  return (
    <CenterModal visible={visible} onClose={handleCancel}>
      <View style={styles.header}>
        <MapPin size={24} color={colors.primary} />
        <Text style={styles.title}>Activer la localisation</Text>
      </View>
      <Text style={styles.body}>
        Pour une meilleure expérience, nous vous proposons d'activer la localisation. Cela nous
        permettra de vous afficher des informations adaptées à votre région.
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable style={styles.yesBtn} onPress={handleYes}>
          <Text style={styles.yesText}>Oui</Text>
        </Pressable>
      </View>
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: colors.primary },
  body: { color: colors.textLight, marginBottom: 24, lineHeight: 21, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.border,
    borderRadius: radius - 4,
    alignItems: 'center',
  },
  cancelText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  yesBtn: { flex: 1, padding: 10, backgroundColor: colors.primary, borderRadius: radius - 4, alignItems: 'center' },
  yesText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
