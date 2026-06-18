import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner, Card } from '../../components/ui';
import { colors } from '../../theme/theme';

const packs = [
  { credits: 2, prix: 2000, bonus: 0, label: '2 crédits' },
  { credits: 5, prix: 5000, bonus: 1, label: '5 crédits + 1 bonus' },
  { credits: 10, prix: 10000, bonus: 2, label: '10 crédits + 2 bonus' },
];

// Portage exact de frontend/src/pages/BuyCredits.jsx
export default function BuyCreditsScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nomCompte: '', telephoneDepot: '', montant: '', telephoneCompte: user?.telephone || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/credits/request', { ...form, montant: Number(form.montant) });
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
          <Text style={styles.successIcon}>✔️</Text>
          <Text style={styles.successTitle}>Demande envoyée !</Text>
          <Text style={styles.successText}>Votre demande sera traitée sous peu par un administrateur.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Acheter des crédits</Text>

      {packs.map((pack, i) => (
        <Pressable
          key={i}
          onPress={() => setForm({ ...form, montant: String(pack.prix) })}
          style={[styles.pack, form.montant === String(pack.prix) && styles.packActive]}
        >
          <View style={styles.packLeft}>
            <Text style={styles.packLabel}>{pack.label}</Text>
            {pack.bonus > 0 ? <Text style={styles.gift}> 🎁</Text> : null}
          </View>
          <Text style={styles.packPrice}>{pack.prix.toLocaleString('fr-FR')} GNF</Text>
        </Pressable>
      ))}

      <AlertBanner variant="info">
        📋 Effectuez un dépôt Orange Money sur le numéro +224625223418 puis remplissez le formulaire ci-dessous.
      </AlertBanner>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput label="Nom du compte à créditer" value={form.nomCompte} onChangeText={(v) => setForm({ ...form, nomCompte: v })} />
      <FormInput label="Numéro avec lequel le dépôt a été fait" keyboardType="phone-pad" value={form.telephoneDepot} onChangeText={(v) => setForm({ ...form, telephoneDepot: v })} />
      <FormInput label="Montant du dépôt (GNF)" keyboardType="numeric" value={form.montant} onChangeText={(v) => setForm({ ...form, montant: v })} />
      <FormInput label="Numéro du compte Limby à créditer" keyboardType="phone-pad" value={form.telephoneCompte} onChangeText={(v) => setForm({ ...form, telephoneCompte: v })} />
      <Button title={loading ? 'Envoi...' : 'Soumettre la demande'} block loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  pack: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  packActive: { borderColor: colors.primary },
  packLeft: { flexDirection: 'row', alignItems: 'center' },
  packLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  gift: { fontSize: 14 },
  packPrice: { fontSize: 14, fontWeight: '700' },
  successWrap: { alignItems: 'center', paddingTop: 40 },
  successIcon: { fontSize: 48 },
  successTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, color: colors.primary },
  successText: { fontSize: 13, color: colors.textLight, marginTop: 8, textAlign: 'center' },
});
