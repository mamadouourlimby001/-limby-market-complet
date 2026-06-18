import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, AlertBanner, PhotoUpload } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const CATEGORIES_OPTIONS = ['Électronique', 'Vêtements', 'Meubles', 'Véhicules', 'Téléphones', 'Informatique', 'Électroménager', 'Sport', 'Autres'].map((c) => ({ label: c, value: c }));
const ETATS_OPTIONS = [
  { v: 'neuf', l: 'Neuf' },
  { v: 'occasion', l: 'Occasion' },
  { v: 'bon_etat', l: 'Bon état' },
  { v: 'use', l: 'Usagé' },
].map((e) => ({ label: e.l, value: e.v }));

// Portage exact de frontend/src/pages/AddProduct.jsx
export default function AddProductScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ titre: '', categorie: '', sousCategorie: '', ville: '', quartier: '', prix: '', description: '', etat: '', contact: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/products', { ...form, prix: Number(form.prix), photos });
      navigation.navigate('ProductsList');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Publier un produit</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}
      <AlertBanner variant="info">⚠️ Les numéros de téléphone ne sont pas autorisés dans la description.</AlertBanner>

      <FormInput label="Titre" value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} />
      <Select label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} options={CATEGORIES_OPTIONS} />
      <FormInput label="Sous-catégorie (optionnel)" value={form.sousCategorie} onChangeText={(v) => setForm({ ...form, sousCategorie: v })} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Select label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} options={VILLES_OPTIONS} />
        </View>
        <View style={{ flex: 1 }}>
          <FormInput label="Quartier" value={form.quartier} onChangeText={(v) => setForm({ ...form, quartier: v })} />
        </View>
      </View>
      <FormInput label="Prix (GNF)" keyboardType="numeric" value={form.prix} onChangeText={(v) => setForm({ ...form, prix: v })} />
      <Select label="État" value={form.etat} onChange={(v) => setForm({ ...form, etat: v })} options={ETATS_OPTIONS} />
      <FormInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />
      <FormInput label="Contact (votre numéro, caché aux acheteurs)" placeholder="+224..." keyboardType="phone-pad" value={form.contact} onChangeText={(v) => setForm({ ...form, contact: v })} />

      <Text style={styles.label}>Photos (max 3)</Text>
      <PhotoUpload photos={photos} setPhotos={setPhotos} max={3} />

      <Button title={loading ? 'Publication...' : 'Publier'} block loading={loading} onPress={handleSubmit} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
});
