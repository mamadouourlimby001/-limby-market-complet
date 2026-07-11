import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner, PhotoUpload } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AddServicePostScreen({ route }) {
  const { id } = route.params;
  const navigation = useNavigation();
  const [form, setForm] = useState({ titre: '', description: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.titre.trim()) { setError('Le titre est requis.'); return; }
    if (!form.description.trim()) { setError('La description est requise.'); return; }
    setLoading(true);
    try {
      await api.post(`/services/${id}/posts`, { ...form, photos });
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Ajouter une publication</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput label="Titre" placeholder="Ex: Robe traditionnelle sur mesure" value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} />
      <FormInput label="Description" placeholder="Décrivez votre réalisation..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />

      <Text style={styles.label}>Photos (max 5)</Text>
      <PhotoUpload photos={photos} setPhotos={setPhotos} max={5} />

      <Button title={loading ? 'Publication...' : 'Publier'} block loading={loading} onPress={handleSubmit} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
});
