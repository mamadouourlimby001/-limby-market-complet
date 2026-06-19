import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, AlertBanner, PhotoUpload } from '../../components/ui';
import { colors } from '../../theme/theme';

const CATEGORIE_OPTIONS = ['Électronique', 'Mode', 'Beauté', 'Maison', 'Autres'].map((c) => ({ label: c, value: c }));

// Portage exact de frontend/src/pages/AddBoutiqueProduct.jsx
export default function AddBoutiqueProductScreen({ route }) {
  const { id } = route.params;
  const navigation = useNavigation();
  const [form, setForm] = useState({ titre: '', description: '', prix: '', categorie: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/boutiques/${id}/products`, { ...form, prix: Number(form.prix), photos });
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Ajouter un produit</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput label="Titre" value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} />
      <FormInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />
      <FormInput label="Prix (GNF)" keyboardType="numeric" value={form.prix} onChangeText={(v) => setForm({ ...form, prix: v })} />
      <Select label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} options={CATEGORIE_OPTIONS} />

      <Text style={styles.label}>Photos (max 10)</Text>
      <PhotoUpload photos={photos} setPhotos={setPhotos} max={10} />

      <Button title={loading ? 'Ajout...' : 'Ajouter'} block loading={loading} onPress={handleSubmit} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
});
