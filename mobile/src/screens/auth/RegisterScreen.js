import { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/Register.jsx (inscription en 2 étapes)
export default function RegisterScreen() {
  const [step, setStep] = useState('info');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();
  const telephoneRef = useRef(null);
  const mdpRef = useRef(null);
  const confirmRef = useRef(null);
  const answerRef = useRef(null);

  const handleInfoSubmit = () => {
    setError('');
    if (motDePasse !== confirmMdp) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setStep('security');
  };

  const handleSecuritySubmit = async () => {
    setError('');
    if (!question || !answer) {
      setError('Veuillez remplir toutes les questions de sécurité');
      return;
    }
    setLoading(true);
    try {
      await register(nom, telephone, motDePasse);
      await api.put('/auth/security-questions', { questions: [{ question, answer }] });
      navigation.navigate('Accueil', { screen: 'Home' });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen center>
      <View style={styles.header}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Créez votre compte Limby Market</Text>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      {step === 'info' && (
        <View>
          <FormInput
            label="Nom complet"
            placeholder="Ex: Diallo Mamadou"
            value={nom}
            onChangeText={setNom}
            returnKeyType="next"
            onSubmitEditing={() => telephoneRef.current?.focus()}
          />
          <FormInput
            ref={telephoneRef}
            label="Numéro de téléphone"
            placeholder="+224..."
            keyboardType="phone-pad"
            value={telephone}
            onChangeText={setTelephone}
            returnKeyType="next"
            onSubmitEditing={() => mdpRef.current?.focus()}
          />
          <FormInput
            ref={mdpRef}
            label="Mot de passe"
            placeholder="Min. 6 caractères"
            secureTextEntry
            value={motDePasse}
            onChangeText={setMotDePasse}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <FormInput
            ref={confirmRef}
            label="Confirmer le mot de passe"
            placeholder="Confirmez..."
            secureTextEntry
            value={confirmMdp}
            onChangeText={setConfirmMdp}
            returnKeyType="done"
            onSubmitEditing={handleInfoSubmit}
          />
          <Button title="Continuer" block onPress={handleInfoSubmit} style={{ marginTop: 8 }} />
        </View>
      )}

      {step === 'security' && (
        <View>
          <Text style={styles.intro}>Définissez une question de sécurité pour récupérer votre compte:</Text>
          <FormInput
            label="Question"
            placeholder="Ex: Quel est le nom de votre animal de compagnie ?"
            value={question}
            onChangeText={setQuestion}
            returnKeyType="next"
            onSubmitEditing={() => answerRef.current?.focus()}
          />
          <FormInput
            ref={answerRef}
            label="Réponse"
            placeholder="Votre réponse"
            value={answer}
            onChangeText={setAnswer}
            returnKeyType="done"
            onSubmitEditing={handleSecuritySubmit}
          />
          <Button
            title={loading ? 'Inscription...' : "S'inscrire"}
            block
            loading={loading}
            onPress={handleSecuritySubmit}
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      <Text style={styles.footer}>
        Déjà un compte ?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Se connecter
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  intro: { fontSize: 13, color: colors.textLight, marginBottom: 16 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.textLight },
  link: { color: colors.primary, fontWeight: '600' },
});
