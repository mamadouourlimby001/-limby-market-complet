import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, DateInput, AlertBanner, PhotoUpload } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/AddAnnouncement.jsx
export default function AddAnnouncementScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ titre: '', villeDeTravail: '', quartier: '', salaireMensuel: '', dateLimite: '', entreprise: '', description: '', contact: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/announcements', { ...form, salaireMensuel: Number(form.salaireMensuel), photos });
      navigation.navigate('AnnouncementsList');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Publier une annonce</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}
      <AlertBanner variant="info">⚠️ Les numéros de téléphone ne sont pas autorisés dans la description.</AlertBanner>

      <FormInput label="Titre" value={form.titre} onChangeText={(v) => setForm({ ...form, titre: v })} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Select label="Ville de travail" value={form.villeDeTravail} onChange={(v) => setForm({ ...form, villeDeTravail: v })} options={VILLES_OPTIONS} />
        </View>
        <View style={{ flex: 1 }}>
          <FormInput label="Quartier" value={form.quartier} onChangeText={(v) => setForm({ ...form, quartier: v })} />
        </View>
      </View>
      <FormInput label="Salaire mensuel (GNF)" keyboardType="numeric" value={form.salaireMensuel} onChangeText={(v) => setForm({ ...form, salaireMensuel: v })} />
      <DateInput label="Date limite" value={form.dateLimite} onChange={(v) => setForm({ ...form, dateLimite: v })} />
      <FormInput label="Entreprise" value={form.entreprise} onChangeText={(v) => setForm({ ...form, entreprise: v })} />
      <FormInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />
      <FormInput label="Contact (caché aux acheteurs)" placeholder="+224..." keyboardType="phone-pad" value={form.contact} onChangeText={(v) => setForm({ ...form, contact: v })} />

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
