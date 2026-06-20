import { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Screen from '../../components/Screen';
import Logo from '../../components/Logo';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/Login.jsx
export default function LoginScreen() {
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();
  const mdpRef = useRef(null);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(telephone, motDePasse);
      navigation.navigate('Accueil', { screen: 'Home' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen center>
      <View style={styles.header}>
        <Logo size={40} />
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte Limby</Text>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput
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
        placeholder="Votre mot de passe"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button
        title={loading ? 'Connexion...' : 'Se connecter'}
        block
        loading={loading}
        onPress={handleSubmit}
        style={{ marginTop: 8 }}
      />

      <Pressable style={styles.center} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Mot de passe oublié ?</Text>
      </Pressable>

      <Text style={styles.footer}>
        Pas encore de compte ?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          S'inscrire
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  center: { alignItems: 'center', marginTop: 12 },
  link: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.textLight },
});
