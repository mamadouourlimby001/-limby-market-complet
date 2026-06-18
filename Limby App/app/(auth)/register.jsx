import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import api from '../../services/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [step, setStep] = useState('info');

  // Étape 1 - informations de base
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Étape 2 - question de sécurité
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [loading, setLoading] = useState(false);

  const handleInfoSubmit = () => {
    if (!nom.trim() || !telephone.trim() || !motDePasse.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (motDePasse !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (motDePasse.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setStep('security');
  };

  const handleSecuritySubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir la question et la réponse de sécurité');
      return;
    }
    setLoading(true);
    try {
      await register(nom.trim(), telephone.trim(), motDePasse);
      await api.put('/auth/security-questions', {
        questions: [{ question: question.trim(), answer: answer.trim() }],
      });
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert(
        'Inscription impossible',
        err.response?.data?.message || 'Ce numéro est peut-être déjà utilisé'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.appName}>Limby Market</Text>
          <Text style={styles.tagline}>Créez votre compte gratuitement</Text>
        </View>

        {/* Indicateur d'étape */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'info' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'security' && styles.stepDotActive]} />
        </View>
        <Text style={styles.stepLabel}>
          {step === 'info' ? 'Étape 1 / 2 — Informations' : 'Étape 2 / 2 — Sécurité'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {step === 'info' ? 'Inscription' : 'Question de sécurité'}
          </Text>

          {step === 'info' && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Votre nom et prénom"
                  autoCapitalize="words"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="Ex : 620 000 000"
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={motDePasse}
                    onChangeText={setMotDePasse}
                    placeholder="Minimum 6 caractères"
                    secureTextEntry={!showPassword}
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Répétez votre mot de passe"
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <TouchableOpacity style={styles.btn} onPress={handleInfoSubmit} activeOpacity={0.85}>
                <Text style={styles.btnText}>Continuer</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'security' && (
            <>
              <Text style={styles.securityHint}>
                Définissez une question de sécurité pour récupérer votre compte en cas d'oubli.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Votre question de sécurité</Text>
                <TextInput
                  style={styles.input}
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Ex : Quel est le nom de votre animal de compagnie ?"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Votre réponse</Text>
                <TextInput
                  style={styles.input}
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Votre réponse"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSecuritySubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.btnText}>Créer mon compte</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep('info')}
              >
                <Text style={styles.backBtnText}>← Retour</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoLetter: {
    color: Colors.white,
    fontSize: 38,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  securityHint: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  field: {
    marginBottom: 14,
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
  passwordRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 13,
  },
  eyeIcon: {
    fontSize: 18,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  loginLabel: {
    color: Colors.textLight,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
