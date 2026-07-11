import { useState, useEffect } from 'react';
import { Text, View, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Info, CreditCard } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, AlertBanner, PhotoUpload, Loader } from '../../components/ui';
import { METIER_OPTIONS } from '../../data/metiers';
import { colors } from '../../theme/theme';

export default function CreateServiceScreen() {
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', metier: '', telephone: '+224', ville: '', quartier: '' });
  const [photo, setPhoto] = useState([]);
  const [originalPhoto, setOriginalPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [service, setService] = useState(null);
  const [showCustomMetier, setShowCustomMetier] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/services/my-service');
        if (res.data?.service) {
          setService(res.data.service);
          setForm({
            nom: res.data.service.nom,
            description: res.data.service.description,
            metier: res.data.service.metier,
            telephone: res.data.service.telephone || '+224',
            ville: res.data.service.ville,
            quartier: res.data.service.quartier,
          });
          setOriginalPhoto(res.data.service.photo);
          setIsEditMode(true);
        }
      } catch (err) {
        setIsEditMode(false);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleTelephoneChange = (val) => {
    let next = val;
    if (!next.startsWith('+224')) {
      next = '+224' + next.replace(/\D/g, '');
    } else {
      const digits = next.replace(/\D/g, '');
      next = '+224' + digits.substring(3, 12);
    }
    setForm({ ...form, telephone: next.slice(0, 13) });
  };

  const handleMetierChange = (value) => {
    if (value === 'custom') setShowCustomMetier(true);
    else setForm({ ...form, metier: value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isEditMode) {
        const updateData = { ...form };
        if (photo[0]) updateData.photo = photo[0];
        else if (originalPhoto) updateData.photo = originalPhoto;
        await api.put(`/services/${service._id}`, updateData);
        Alert.alert('', 'Profil mis à jour avec succès');
        navigation.navigate('MyService');
      } else {
        if (!photo[0]) {
          setError('La photo est requise pour créer votre profil');
          setLoading(false);
          return;
        }
        await api.post('/services', { ...form, photo: photo[0] });
        Alert.alert('', 'Profil créé avec succès');
        navigation.navigate('MyService');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>{isEditMode ? 'Modifier mon profil' : 'Proposer mes compétences'}</Text>

      {!isEditMode && (
        <>
          <AlertBanner variant="info" icon={<Info size={14} color={colors.accent} />}>
            Votre profil sera créé mais inactif. Pour l'activer, vous devez payer un abonnement de 15 000 GNF/mois et obtenir l'approbation d'un administrateur.
          </AlertBanner>
          <AlertBanner variant="info" icon={<CreditCard size={14} color={colors.accent} />}>
            Déposez 15 000 GNF sur le numéro Orange Money +224625223418 pour activer votre profil.
          </AlertBanner>
        </>
      )}
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput label="Nom / Nom de l'activité" value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} />
      <FormInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />

      {!showCustomMetier ? (
        <Select label="Métier" value={form.metier} onChange={handleMetierChange} options={METIER_OPTIONS} small />
      ) : (
        <FormInput label="Métier" placeholder="Saisissez votre métier" value={form.metier} onChangeText={(v) => setForm({ ...form, metier: v })} />
      )}

      <FormInput label="Ville" placeholder="Ex: Conakry" value={form.ville} onChangeText={(v) => setForm({ ...form, ville: v })} />
      <FormInput label="Quartier" placeholder="Ex: Kaloum" value={form.quartier} onChangeText={(v) => setForm({ ...form, quartier: v })} />
      <FormInput label="Téléphone" placeholder="+224..." keyboardType="phone-pad" maxLength={13} value={form.telephone} onChangeText={handleTelephoneChange} />

      <Text style={styles.label}>Photo</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        {!photo.length && isEditMode && originalPhoto ? (
          <Image source={{ uri: originalPhoto }} style={styles.currentPhoto} />
        ) : null}
        <PhotoUpload photos={photo} setPhotos={setPhoto} max={1} single />
      </View>

      <Button
        title={loading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer mon profil')}
        block
        loading={loading}
        disabled={!isEditMode && !photo[0]}
        onPress={handleSubmit}
        style={{ marginTop: 16 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  currentPhoto: { width: 80, height: 80, borderRadius: 10, opacity: 0.7 },
});
