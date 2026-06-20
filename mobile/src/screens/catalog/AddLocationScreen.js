import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, AlertBanner, PhotoUpload } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const CATEGORIE_OPTIONS = [
  { label: 'Location', value: 'Location' },
  { label: 'Colocation', value: 'Colocation' },
  { label: 'Vente immobilière', value: 'Vente_immobilière' },
];

// Portage exact de frontend/src/pages/AddLocation.jsx (description limitée à 4 chiffres max)
export default function AddLocationScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ titre: '', categorie: '', ville: '', quartier: '', description: '', prix: '', contact: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDescriptionChange = (value) => {
    const digitCount = (value.match(/\d/g) || []).length;
    if (digitCount <= 4) setForm({ ...form, description: value });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.titre.trim()) { setError('Le titre est requis.'); return; }
    if (!form.categorie) { setError('La catégorie est requise.'); return; }
    if (!form.ville) { setError('La ville est requise.'); return; }
    if (!form.prix || isNaN(Number(form.prix)) || Number(form.prix) <= 0) { setError('Un prix valide est requis.'); return; }
    if (!form.contact.trim()) { setError('Le contact est requis.'); return; }
    setLoading(true);
    try {
      await api.post('/locations', { ...form, prix: Number(form.prix), photos });
      navigation.navigate('LocationsList');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Publier une location</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}
      <AlertBanner variant="info">⚠️ Les numéros de téléphone ne sont pas autorisés dans la description.</AlertBanner>

      <FormInput label="Titre" value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} />
      <Select label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} options={CATEGORIE_OPTIONS} />
      <Select label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} options={VILLES_OPTIONS} />
      <FormInput label="Quartier" value={form.quartier} onChangeText={(v) => setForm({ ...form, quartier: v })} />
      <FormInput
        label="Description (max 4 chiffres)"
        placeholder="Décrivez la maison..."
        value={form.description}
        onChangeText={handleDescriptionChange}
        multiline
        numberOfLines={4}
      />
      <FormInput label="Prix (GNF)" keyboardType="numeric" value={form.prix} onChangeText={(v) => setForm({ ...form, prix: v })} />
      <FormInput label="Contact (caché aux acheteurs)" placeholder="+224..." keyboardType="phone-pad" value={form.contact} onChangeText={(v) => setForm({ ...form, contact: v })} />

      <Text style={styles.label}>Photos (max 10)</Text>
      <PhotoUpload photos={photos} setPhotos={setPhotos} max={10} />

      <Button title={loading ? 'Publication...' : 'Publier'} block loading={loading} onPress={handleSubmit} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
});
