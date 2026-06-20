import { useState, useRef } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getResetToken, removeResetToken } from '../../services/storage';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://limby01-production.up.railway.app/api';

// Portage exact de frontend/src/pages/ResetPassword.jsx
export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const confirmRef = useRef(null);

  const handleSubmit = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const token = await getResetToken();
    if (!token) {
      setError('Session expirée. Veuillez recommencer.');
      navigation.navigate('Login');
      return;
    }

    setLoading(true);
    try {
      // Requête directe (pas via l'instance api.js) pour forcer le token de reset
      // à la place du token de session, exactement comme côté web.
      await axios.post(
        `${API_URL}/auth/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('', 'Mot de passe réinitialisé avec succès');
      await removeResetToken();
      navigation.navigate('Login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen center>
      <View style={styles.header}>
        <Text style={styles.title}>Définir un nouveau mot de passe</Text>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <FormInput
        label="Nouveau mot de passe"
        placeholder="Min. 6 caractères"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <FormInput
        ref={confirmRef}
        label="Confirmer le mot de passe"
        placeholder="Confirmez..."
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button title={loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'} block loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, textAlign: 'center' },
});
