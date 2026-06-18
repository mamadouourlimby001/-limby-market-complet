import { useState, useEffect } from 'react';
import { Text, View, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Info, CreditCard } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, Select, AlertBanner, PhotoUpload, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

const CATEGORIE_OPTIONS = [
  { label: 'Électronique', value: 'Électronique' },
  { label: 'Mode', value: 'Mode' },
  { label: 'Alimentation', value: 'Alimentation' },
  { label: 'Beauté', value: 'Beauté' },
  { label: 'Maison', value: 'Maison' },
  { label: 'Services', value: 'Services' },
  { label: 'Saisissez la catégorie', value: 'custom' },
];

// Portage exact de frontend/src/pages/CreateBoutique.jsx (création + édition)
export default function CreateBoutiqueScreen() {
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', categorie: '', telephone: '+224', ville: '', quartier: '' });
  const [logo, setLogo] = useState([]);
  const [originalLogo, setOriginalLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [boutique, setBoutique] = useState(null);
  const [showCustomCategorie, setShowCustomCategorie] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/boutiques/my-boutique');
        if (res.data?.boutique) {
          setBoutique(res.data.boutique);
          setForm({
            nom: res.data.boutique.nom,
            description: res.data.boutique.description,
            categorie: res.data.boutique.categorie,
            telephone: res.data.boutique.telephone || '+224',
            ville: res.data.boutique.ville,
            quartier: res.data.boutique.quartier,
          });
          setOriginalLogo(res.data.boutique.logo);
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

  const handleCategorieChange = (value) => {
    if (value === 'custom') setShowCustomCategorie(true);
    else setForm({ ...form, categorie: value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isEditMode) {
        const updateData = { ...form };
        if (logo[0]) updateData.logo = logo[0];
        else if (originalLogo) updateData.logo = originalLogo;
        await api.put(`/boutiques/${boutique._id}`, updateData);
        Alert.alert('', 'Boutique mise à jour avec succès');
        navigation.navigate('MyBoutique');
      } else {
        if (!logo[0]) {
          setError('Le logo est requis pour créer une boutique');
          setLoading(false);
          return;
        }
        await api.post('/boutiques', { ...form, logo: logo[0] });
        Alert.alert('', 'Boutique créée avec succès');
        navigation.navigate('Compte', { screen: 'UserDashboard' });
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
      <Text style={styles.title}>{isEditMode ? 'Modifier ma boutique' : 'Créer ma boutique'}</Text>

      {!isEditMode && (
        <>
          <AlertBanner variant="info" icon={<Info size={14} color={colors.accent} />}>
            Votre boutique sera créée mais inactive. Pour l'activer, vous devez payer un abonnement de 38000 GNF et obtenir l'approbation d'un administrateur.
          </AlertBanner>
          <AlertBanner variant="info" icon={<CreditCard size={14} color={colors.accent} />}>
            Déposez 38 000 GNF sur le numéro Orange Money +224625223418 pour activer votre boutique.
          </AlertBanner>
        </>
      )}
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput label="Nom de la boutique" value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} />
      <FormInput label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />

      {!showCustomCategorie ? (
        <Select label="Catégorie" value={form.categorie} onChange={handleCategorieChange} options={CATEGORIE_OPTIONS} />
      ) : (
        <FormInput label="Catégorie" placeholder="Saisissez votre catégorie" value={form.categorie} onChangeText={(v) => setForm({ ...form, categorie: v })} />
      )}

      <FormInput label="Ville" placeholder="Ex: Conakry" value={form.ville} onChangeText={(v) => setForm({ ...form, ville: v })} />
      <FormInput label="Quartier" placeholder="Ex: Kaloum" value={form.quartier} onChangeText={(v) => setForm({ ...form, quartier: v })} />
      <FormInput label="Téléphone" placeholder="+224..." keyboardType="phone-pad" maxLength={13} value={form.telephone} onChangeText={handleTelephoneChange} />

      <Text style={styles.label}>Logo</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        {!logo.length && isEditMode && originalLogo ? (
          <Image source={{ uri: originalLogo }} style={styles.currentLogo} />
        ) : null}
        <PhotoUpload photos={logo} setPhotos={setLogo} max={1} single />
      </View>

      <Button
        title={loading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer la boutique')}
        block
        loading={loading}
        disabled={!isEditMode && !logo[0]}
        onPress={handleSubmit}
        style={{ marginTop: 16 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  currentLogo: { width: 80, height: 80, borderRadius: 10, opacity: 0.7 },
});
