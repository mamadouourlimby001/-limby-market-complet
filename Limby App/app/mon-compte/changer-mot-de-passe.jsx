import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function ChangerMotDePasseScreen() {
  const [ancienMdp, setAncienMdp] = useState('');
  const [newMdp, setNewMdp] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = async () => {
    if (!ancienMdp || !newMdp || !confirm) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (newMdp !== confirm) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (newMdp.length < 6) {
      Alert.alert('Erreur', 'Minimum 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/update-password', {
        ancienMotDePasse: ancienMdp,
        nouveauMotDePasse: newMdp,
      });
      Alert.alert('Succès', 'Mot de passe modifié avec succès.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Mot de passe actuel incorrect');
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
        <Text style={styles.title}>Changer le mot de passe</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <TextInput
                style={styles.input}
                value={ancienMdp}
                onChangeText={setAncienMdp}
                placeholder="Votre mot de passe actuel"
                secureTextEntry={!showPw}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={newMdp}
                onChangeText={setNewMdp}
                placeholder="Minimum 6 caractères"
                secureTextEntry={!showPw}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Répétez le nouveau mot de passe"
                secureTextEntry={!showPw}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={styles.showPwBtn}
              onPress={() => setShowPw((v) => !v)}
            >
              <Text style={styles.showPwText}>
                {showPw ? '🙈 Masquer' : '👁️ Afficher'} les mots de passe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleChange}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Modifier le mot de passe</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  showPwBtn: { alignSelf: 'center', marginBottom: 16 },
  showPwText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: 'bold' },
});
