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

export default function RenouvelerAbonnementScreen() {
  const { user } = useAuth();
  const [nomBoutique, setNomBoutique] = useState('');
  const [telephoneDepot, setTelephoneDepot] = useState('');
  const [loading, setLoading] = useState(false);

  const ABONNEMENT_PRICE = 10000;

  const handleRequest = async () => {
    if (!nomBoutique.trim() || !telephoneDepot.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await api.post('/credits/subscription-request', {
        nomBoutique: nomBoutique.trim(),
        telephoneDepot: telephoneDepot.trim(),
        montant: ABONNEMENT_PRICE,
      });

      Alert.alert(
        'Demande envoyée !',
        'Votre demande de renouvellement a été envoyée. Un administrateur la validera sous 24h.',
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
        <Text style={styles.title}>Renouveler l'abonnement</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.priceCard}>
          <Text style={styles.priceEmoji}>🏪</Text>
          <Text style={styles.priceTitle}>Abonnement boutique annuel</Text>
          <Text style={styles.priceAmount}>10 000 GNF</Text>
          <Text style={styles.priceDuration}>Valable 1 an</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Instructions</Text>
          <Text style={styles.infoText}>
            1. Déposez 10 000 GNF via Orange Money au numéro administrateur.{'\n'}
            2. Remplissez ce formulaire.{'\n'}
            3. Un admin validera et activera votre boutique sous 24h.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nom de votre boutique</Text>
          <TextInput
            style={styles.input}
            value={nomBoutique}
            onChangeText={setNomBoutique}
            placeholder="Ex: Ma Super Boutique"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Numéro Orange Money utilisé pour le dépôt</Text>
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
          <Text style={styles.label}>Montant déposé</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{ABONNEMENT_PRICE.toLocaleString('fr-FR')} GNF</Text>
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
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', color: Colors.text },
  scroll: { padding: 16, paddingBottom: 32 },
  priceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  priceEmoji: { fontSize: 40 },
  priceTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  priceAmount: { color: Colors.white, fontSize: 32, fontWeight: 'bold' },
  priceDuration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
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
  readonlyText: { fontSize: 15, color: Colors.textLight, fontWeight: '600' },
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
