import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [telephone, setTelephone] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const handleFetchQuestions = async () => {
    if (!telephone.trim()) {
      Alert.alert('Erreur', 'Entrez votre numéro de téléphone');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/auth/get-security-questions/${telephone.trim()}`);
      setQuestions(res.data.questions || []);
      setStep(2);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Numéro introuvable');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswers = async () => {
    if (answers.some((a) => !a.trim())) {
      Alert.alert('Erreur', 'Veuillez répondre à toutes les questions');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-security-questions', {
        telephone: telephone.trim(),
        answers,
      });
      setToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Réponses incorrectes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mot de passe oublié</Text>

        <View style={styles.steps}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.step, step >= s && styles.stepActive]}>
              <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>{s}</Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Votre numéro</Text>
            <Text style={styles.cardDesc}>
              Entrez le numéro associé à votre compte Limby.
            </Text>
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={setTelephone}
              placeholder="Ex : 620 000 000"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleFetchQuestions}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Continuer</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Questions de sécurité</Text>
            <Text style={styles.cardDesc}>
              Répondez aux questions pour vérifier votre identité.
            </Text>
            {questions.map((q, i) => (
              <View key={i} style={styles.field}>
                <Text style={styles.label}>{q}</Text>
                <TextInput
                  style={styles.input}
                  value={answers[i]}
                  onChangeText={(v) => {
                    const next = [...answers];
                    next[i] = v;
                    setAnswers(next);
                  }}
                  placeholder="Votre réponse"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleVerifyAnswers}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Vérifier</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <ResetStep telephone={telephone} token={token} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResetStep({ telephone, token }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirm) {
      Alert.alert('Erreur', 'Remplissez les deux champs');
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Minimum 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await api.post(
        '/auth/reset-password',
        { telephone, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Succès', 'Mot de passe réinitialisé !', [
        { text: 'Se connecter', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Nouveau mot de passe</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Nouveau mot de passe</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Minimum 6 caractères"
          secureTextEntry={!showPw}
          placeholderTextColor={Colors.textMuted}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Confirmer</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Répétez le mot de passe"
          secureTextEntry={!showPw}
          placeholderTextColor={Colors.textMuted}
        />
      </View>
      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.btnText}>Réinitialiser</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  steps: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepText: {
    color: Colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  stepTextActive: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
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
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
