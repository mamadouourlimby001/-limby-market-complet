import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/RenewSubscription.jsx
export default function RenewSubscriptionScreen() {
  const [form, setForm] = useState({ nomBoutique: '', telephoneDepot: '', montant: '38000', boutiqueId: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/boutiques/my-boutique').catch(() => ({ data: null }));
        if (res.data) {
          const boutique = res.data.boutique || res.data;
          setForm((prev) => ({ ...prev, nomBoutique: boutique.nom, boutiqueId: boutique._id }));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/credits/subscription-request', { ...form, montant: Number(form.montant) });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Screen center>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>OK</Text>
          <Text style={styles.successTitle}>Demande envoyée !</Text>
          <Text style={styles.successText}>Votre demande de renouvellement sera traitée sous peu.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Renouveler abonnement</Text>

      <AlertBanner variant="info">
        Déposez 38 000 GNF sur le numéro Orange Money +224625223418 puis soumettez ce formulaire.
      </AlertBanner>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput
        label="Nom de la boutique"
        value={form.nomBoutique}
        editable={false}
        style={{ opacity: 0.6 }}
      />
      <FormInput label="Numéro avec lequel le dépôt a été fait" keyboardType="phone-pad" value={form.telephoneDepot} onChangeText={(v) => setForm({ ...form, telephoneDepot: v })} />
      <FormInput label="Montant (GNF)" keyboardType="numeric" value={form.montant} onChangeText={(v) => setForm({ ...form, montant: v })} />
      <Button title={loading ? 'Envoi...' : 'Soumettre la demande'} block loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  successWrap: { alignItems: 'center', paddingTop: 40 },
  successIcon: { fontSize: 48 },
  successTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, color: colors.primary },
  successText: { fontSize: 13, color: colors.textLight, marginTop: 8, textAlign: 'center' },
});
