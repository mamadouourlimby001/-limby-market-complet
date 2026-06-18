import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { CREDIT_PACKAGES } from '../../constants/config';

export default function AcheterCreditsScreen() {
  const { user } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [nomCompte, setNomCompte] = useState(user?.nom || '');
  const [telephoneDepot, setTelephoneDepot] = useState('');
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePackageSelect = (pkg) => {
    setSelectedPkg(pkg);
    setMontant(String(pkg.montant));
  };

  const handleRequest = async () => {
    if (!nomCompte.trim() || !telephoneDepot.trim() || !montant) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    const amount = Number(montant);
    if (amount < 1000) {
      Alert.alert('Erreur', 'Montant minimum : 1 000 GNF');
      return;
    }

    setLoading(true);
    try {
      await api.post('/credits/request', {
        nomCompte: nomCompte.trim(),
        telephoneDepot: telephoneDepot.trim(),
        montant: amount,
        telephoneCompte: user?.telephone,
      });

      Alert.alert(
        'Demande envoyée !',
        'Votre demande de crédits a été transmise. Un administrateur validera votre paiement sous 24h.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Acheter des crédits</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* How it works */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Comment ça marche ?</Text>
          <Text style={styles.infoText}>
            1. Déposez de l'argent via Orange Money au numéro de l'administrateur.{'\n'}
            2. Remplissez ce formulaire avec les détails du dépôt.{'\n'}
            3. Un admin validera et ajoutera vos crédits sous 24h.{'\n'}
            4. Utilisez vos crédits pour débloquer les contacts des vendeurs.
          </Text>
        </View>

        {/* Packages */}
        <Text style={styles.sectionTitle}>Choisir un forfait</Text>
        <View style={styles.packages}>
          {CREDIT_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.montant}
              style={[styles.pkgCard, selectedPkg?.montant === pkg.montant && styles.pkgCardActive]}
              onPress={() => handlePackageSelect(pkg)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pkgCredits, selectedPkg?.montant === pkg.montant && styles.pkgTextActive]}>
                ⭐ {pkg.credits} crédit{pkg.credits > 1 ? 's' : ''}
              </Text>
              <Text style={[styles.pkgPrice, selectedPkg?.montant === pkg.montant && styles.pkgTextActive]}>
                {pkg.montant.toLocaleString('fr-FR')} GNF
              </Text>
              {selectedPkg?.montant === pkg.montant && (
                <Text style={styles.pkgCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <Text style={styles.sectionTitle}>Détails du dépôt Orange Money</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Votre nom complet</Text>
          <TextInput
            style={styles.input}
            value={nomCompte}
            onChangeText={setNomCompte}
            placeholder="Nom du titulaire du compte"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Numéro utilisé pour le dépôt</Text>
          <TextInput
            style={styles.input}
            value={telephoneDepot}
            onChangeText={setTelephoneDepot}
            placeholder="Ex: 620 000 000"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Montant déposé (GNF)</Text>
          <TextInput
            style={styles.input}
            value={montant}
            onChangeText={setMontant}
            placeholder="Ex: 5000"
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Numéro de votre compte Limby</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{user?.telephone || '—'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Envoyer la demande</Text>
          )}
        </TouchableOpacity>

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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backText: { fontSize: 22, color: Colors.primary, fontWeight: '600' },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 32 },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.info, marginBottom: 8 },
  infoText: { fontSize: 13, color: '#1A5276', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  packages: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  pkgCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 4,
    position: 'relative',
  },
  pkgCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF3EE',
  },
  pkgCredits: { fontSize: 15, fontWeight: '700', color: Colors.text },
  pkgPrice: { fontSize: 13, color: Colors.textLight },
  pkgTextActive: { color: Colors.primary },
  pkgCheck: {
    position: 'absolute',
    top: 8,
    right: 10,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  readonlyInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  readonlyText: { fontSize: 15, color: Colors.textLight },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
