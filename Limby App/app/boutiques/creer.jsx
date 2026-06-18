import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { BOUTIQUE_CATEGORIES, VILLES_GUINEE } from '../../constants/config';

export default function CreerBoutiqueScreen() {
  const [form, setForm] = useState({
    nom: '',
    categorie: '',
    ville: '',
    quartier: '',
    description: '',
    telephone: '',
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const { nom, categorie, ville, quartier, description, telephone } = form;
    if (!nom || !categorie || !ville || !quartier || !description || !telephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!logo) {
      Alert.alert('Erreur', 'Veuillez ajouter un logo pour votre boutique');
      return;
    }

    setLoading(true);
    try {
      const logoUrl = await uploadImageToCloudinary(logo);

      await api.post('/boutiques', {
        nom,
        categorie,
        ville,
        quartier,
        description,
        telephone,
        logo: logoUrl,
      });

      Alert.alert(
        'Boutique créée !',
        'Votre boutique a été créée. Elle sera activée après approbation et paiement de l\'abonnement (10 000 GNF).',
        [
          { text: 'Renouveler l\'abonnement', onPress: () => router.replace('/credits/renouveler') },
          { text: 'Retour', onPress: () => router.back() },
        ]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de créer la boutique');
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
        <Text style={styles.headerTitle}>Créer ma boutique</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.createText}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Cost info */}
        <View style={styles.costBanner}>
          <Text style={styles.costIcon}>💳</Text>
          <View>
            <Text style={styles.costTitle}>Abonnement : 10 000 GNF / an</Text>
            <Text style={styles.costDesc}>
              Votre boutique sera activée après paiement Orange Money
            </Text>
          </View>
        </View>

        {/* Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo de la boutique *</Text>
          <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>📷</Text>
                <Text style={styles.logoPlaceholderText}>Choisir un logo</Text>
              </View>
            )}
          </TouchableOpacity>
          {logo && (
            <TouchableOpacity onPress={() => setLogo(null)} style={styles.removeLogo}>
              <Text style={styles.removeLogoText}>Changer le logo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nom de la boutique *</Text>
          <TextInput
            style={styles.input}
            value={form.nom}
            onChangeText={(v) => update('nom', v)}
            placeholder="Ex: Mode Conakry"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BOUTIQUE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.categorie === c && styles.chipActive]}
                onPress={() => update('categorie', c)}
              >
                <Text style={[styles.chipText, form.categorie === c && styles.chipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ville *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {VILLES_GUINEE.slice(0, 8).map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, form.ville === v && styles.chipActive]}
                onPress={() => update('ville', v)}
              >
                <Text style={[styles.chipText, form.ville === v && styles.chipTextActive]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quartier *</Text>
          <TextInput
            style={styles.input}
            value={form.quartier}
            onChangeText={(v) => update('quartier', v)}
            placeholder="Ex: Kipé, Kaloum..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Numéro de téléphone de la boutique *</Text>
          <TextInput
            style={styles.input}
            value={form.telephone}
            onChangeText={(v) => update('telephone', v)}
            placeholder="Ex: 620 000 000"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <Text style={styles.hint}>⚠️ Ne pas inclure de numéros de téléphone</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => update('description', v)}
            placeholder="Décrivez votre boutique (produits vendus, services...)"
            multiline
            numberOfLines={5}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: { color: Colors.textLight, fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  createText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scroll: { paddingBottom: 32 },
  costBanner: {
    backgroundColor: '#FFF3E0',
    margin: 12,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  costIcon: { fontSize: 28 },
  costTitle: { fontSize: 14, fontWeight: '700', color: '#E65100', marginBottom: 2 },
  costDesc: { fontSize: 12, color: '#BF360C' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.warning, marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  logoPicker: { alignItems: 'center' },
  logoPreview: { width: 120, height: 120, borderRadius: 20 },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoPlaceholderIcon: { fontSize: 32 },
  logoPlaceholderText: { fontSize: 12, color: Colors.textMuted },
  removeLogo: { alignItems: 'center', marginTop: 8 },
  removeLogoText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
});
