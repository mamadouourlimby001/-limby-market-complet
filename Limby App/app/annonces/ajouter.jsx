import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { VILLES_GUINEE } from '../../constants/config';

export default function AjouterAnnonceScreen() {
  const [form, setForm] = useState({
    titre: '',
    entreprise: '',
    villeDeTravail: '',
    quartier: '',
    salaireMensuel: '',
    dateLimite: '',
    description: '',
    contact: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const { titre, entreprise, villeDeTravail, quartier, salaireMensuel, dateLimite, description, contact } = form;
    if (!titre || !entreprise || !villeDeTravail || !quartier || !salaireMensuel || !dateLimite || !description || !contact) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await api.post('/announcements', {
        titre, entreprise, villeDeTravail, quartier,
        salaireMensuel: Number(salaireMensuel),
        dateLimite: new Date(dateLimite).toISOString(),
        description, contact,
      });

      Alert.alert('Succès !', 'Votre offre d\'emploi a été publiée.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de publier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier une offre d'emploi</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.primary} /> : (
            <Text style={styles.publishText}>Publier</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {[
          { key: 'titre', label: 'Intitulé du poste *', placeholder: 'Ex: Développeur Web', autoCapitalize: 'words' },
          { key: 'entreprise', label: 'Nom de l\'entreprise *', placeholder: 'Ex: Limby Technologies', autoCapitalize: 'words' },
          { key: 'quartier', label: 'Quartier *', placeholder: 'Ex: Kaloum' },
        ].map(({ key, label, placeholder, autoCapitalize }) => (
          <View key={key} style={styles.section}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={(v) => update(key, v)}
              placeholder={placeholder}
              autoCapitalize={autoCapitalize || 'sentences'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.label}>Ville de travail *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {VILLES_GUINEE.slice(0, 8).map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, form.villeDeTravail === v && styles.chipActive]}
                onPress={() => update('villeDeTravail', v)}
              >
                <Text style={[styles.chipText, form.villeDeTravail === v && styles.chipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Salaire mensuel (GNF) *</Text>
          <TextInput
            style={styles.input}
            value={form.salaireMensuel}
            onChangeText={(v) => update('salaireMensuel', v)}
            placeholder="Ex: 3000000"
            keyboardType="numeric"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date limite de candidature *</Text>
          <TextInput
            style={styles.input}
            value={form.dateLimite}
            onChangeText={(v) => update('dateLimite', v)}
            placeholder="AAAA-MM-JJ (ex: 2025-12-31)"
            keyboardType="default"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description du poste *</Text>
          <Text style={styles.hint}>⚠️ Ne pas inclure de numéros de téléphone</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => update('description', v)}
            placeholder="Décrivez le poste, les responsabilités, les qualifications requises..."
            multiline
            numberOfLines={6}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Numéro de contact *</Text>
          <TextInput
            style={styles.input}
            value={form.contact}
            onChangeText={(v) => update('contact', v)}
            placeholder="Ex: 620 000 000"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancelText: { color: Colors.textLight, fontSize: 15 },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  publishText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  scroll: { paddingBottom: 32 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.warning, marginBottom: 8 },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text },
  textArea: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
});
