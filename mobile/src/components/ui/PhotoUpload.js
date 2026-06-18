import { View, Image, Pressable, Text, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Camera } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent .photo-upload / .photo-upload-item de frontend/src/index.css.
// Remplace fileToBase64() du web : on récupère directement le base64 via expo-image-picker
// puis on l'envoie tel quel dans `photos[]`, exactement comme le fait le backend existant
// (uploadImagesToCloudinary détecte les chaînes 'data:' et les convertit côté serveur).
export default function PhotoUpload({ photos, setPhotos, max = 3, single = false }) {
  const pickFrom = async (source) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission refusée', "Limby Market n'a pas accès à cette fonctionnalité.");
      return;
    }

    const options = { mediaTypes: ['images'], quality: 0.7, base64: true };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;

    if (single) {
      setPhotos([dataUrl]);
      return;
    }
    if (photos.length >= max) {
      Alert.alert('Erreur', `Maximum ${max} photo${max > 1 ? 's' : ''}`);
      return;
    }
    setPhotos([...photos, dataUrl]);
  };

  const addPhoto = () => {
    Alert.alert('Ajouter une photo', undefined, [
      { text: 'Prendre une photo', onPress: () => pickFrom('camera') },
      { text: 'Choisir dans la galerie', onPress: () => pickFrom('library') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const removePhoto = (idx) => setPhotos(photos.filter((_, i) => i !== idx));

  const canAddMore = single ? photos.length === 0 : photos.length < max;

  return (
    <View style={styles.row}>
      {photos.map((uri, idx) => (
        <View key={idx} style={styles.item}>
          <Image source={{ uri }} style={styles.image} />
          <Pressable style={styles.remove} onPress={() => removePhoto(idx)}>
            <X size={12} color="#fff" />
          </Pressable>
        </View>
      ))}
      {canAddMore && (
        <Pressable style={styles.addSlot} onPress={addPhoto}>
          {photos.length === 0 ? <Camera size={22} color={colors.textLight} /> : <Plus size={22} color={colors.textLight} />}
        </Pressable>
      )}
    </View>
  );
}

const SIZE = 80;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: SIZE, height: SIZE, borderRadius: radius, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlot: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
