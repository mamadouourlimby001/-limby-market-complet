import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadMultipleImages } from '../../utils/cloudinaryUpload';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { LOCATION_CATEGORIES, VILLES_GUINEE } from '../../constants/config';

export default function AjouterLocationScreen() {
  const [form, setForm] = useState({
    titre: '',
    categorie: '',
    ville: '',
    quartier: '',
    prix: '',
    description: '',
    contact: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setPhotos(result.assets.map((a) => a.uri));
    }
  };

  const handleSubmit = async () => {
    const { titre, categorie, ville, quartier, prix, description, contact } = form;
    if (!titre || !categorie || !ville || !quartier || !prix || !description || !contact) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      let photoUrls = [];
      if (photos.length > 0) {
        photoUrls = await uploadMultipleImages(photos);
      }

      await api.post('/locations', {
        titre, categorie, ville, quartier,
        prix: Number(prix),
        description, contact,
        photos: photoUrls,
      });

      Alert.alert('Succès !', 'Votre annonce immobilière a été publiée.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de publier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier un logement</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.primary} /> : (
            <Text style={styles.publishText}>Publier</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (max 10)</Text>
          <View style={styles.photoRow}>
            {photos.slice(0, 4).map((p, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri: p }} style={styles.photoImg} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 10 && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhotos}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>{photos.length > 0 ? `+${photos.length}` : 'Ajouter'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput style={styles.input} value={form.titre} onChangeText={(v) => update('titre', v)} placeholder="Ex: Appartement F3 meublé" placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.chipRow}>
            {LOCATION_CATEGORIES.map((c) => (
              <TouchableOpacity key={c.value} style={[styles.chip, form.categorie === c.value && styles.chipActive]} onPress={() => update('categorie', c.value)}>
                <Text style={[styles.chipText, form.categorie === c.value && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ville *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {VILLES_GUINEE.slice(0, 8).map((v) => (
              <TouchableOpacity key={v} style={[styles.chip, form.ville === v && styles.chipActive]} onPress={() => update('ville', v)}>
                <Text style={[styles.chipText, form.ville === v && styles.chipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quartier *</Text>
          <TextInput style={styles.input} value={form.quartier} onChangeText={(v) => update('quartier', v)} placeholder="Ex: Ratoma" placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Loyer mensuel (GNF) *</Text>
          <TextInput style={styles.input} value={form.prix} onChangeText={(v) => update('prix', v)} placeholder="Ex: 800000" keyboardType="numeric" placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <Text style={styles.hint}>⚠️ Ne pas inclure de numéros de téléphone</Text>
          <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => update('description', v)} placeholder="Décrivez le logement..." multiline numberOfLines={5} placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Numéro de contact *</Text>
          <TextInput style={styles.input} value={form.contact} onChangeText={(v) => update('contact', v)} placeholder="Ex: 620 000 000" keyboardType="phone-pad" placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancelText: { color: Colors.textLight, fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  publishText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scroll: { paddingBottom: 32 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.warning, marginBottom: 8 },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  photoRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  photoThumb: { position: 'relative' },
  photoImg: { width: 90, height: 90, borderRadius: 8 },
  removePhoto: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.danger, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  removePhotoText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
  addPhotoBtn: { width: 90, height: 90, borderRadius: 8, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 4 },
  addPhotoIcon: { fontSize: 24 },
  addPhotoText: { fontSize: 11, color: Colors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
});
