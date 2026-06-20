import { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { setResetToken } from '../../services/storage';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/ForgotPassword.jsx
export default function ForgotPasswordScreen() {
  const [step, setStep] = useState('phone');
  const [telephone, setTelephone] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGetQuestions = async () => {
    setError('');
    if (!telephone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/auth/get-security-questions/${telephone}`);
      setQuestions(res.data.questions);
      setAnswers(res.data.questions.map(() => ''));
      setStep('questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Numéro non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswers = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-security-questions', { telephone, answers });
      await setResetToken(res.data.token);
      navigation.navigate('ResetPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Réponses incorrectes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen center>
      <View style={styles.header}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>Récupérez l'accès à votre compte</Text>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      {step === 'phone' && (
        <View>
          <FormInput
            label="Numéro de téléphone"
            placeholder="+224..."
            keyboardType="phone-pad"
            value={telephone}
            onChangeText={setTelephone}
            returnKeyType="done"
            onSubmitEditing={handleGetQuestions}
          />
          <Button title={loading ? 'Chargement...' : 'Continuer'} block loading={loading} onPress={handleGetQuestions} />
        </View>
      )}

      {step === 'questions' && (
        <View>
          <Text style={styles.intro}>Répondez à votre question de sécurité:</Text>
          {questions.map((q, i) => (
            <FormInput
              key={i}
              label={q}
              placeholder="Votre réponse"
              value={answers[i]}
              onChangeText={(v) => {
                const next = [...answers];
                next[i] = v;
                setAnswers(next);
              }}
            />
          ))}
          <Button title={loading ? 'Vérification...' : 'Vérifier'} block loading={loading} onPress={handleVerifyAnswers} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  intro: { fontSize: 13, color: colors.textLight, marginBottom: 16 },
});
