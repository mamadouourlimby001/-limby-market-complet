import { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/ChangePassword.jsx
export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/update-password', { oldPassword, newPassword });
      Alert.alert('', 'Mot de passe modifié avec succès');
      navigation.navigate('UserDashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la modification';
      setError(
        msg === 'Ancien mot de passe incorrect.'
          ? 'Ancien mot de passe incorrect. Cliquez sur "Mot de passe oublié" si vous ne le souvenez pas.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen center>
      <View style={styles.header}>
        <Text style={styles.title}>Modifier le mot de passe</Text>
      </View>

      {error ? (
        <View>
          <AlertBanner variant="danger">{error}</AlertBanner>
          {error.includes('oublié') && (
            <Button
              title="Mot de passe oublié"
              variant="secondary"
              block
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ marginBottom: 16 }}
            />
          )}
        </View>
      ) : null}

      <FormInput label="Ancien mot de passe" placeholder="Votre mot de passe actuel" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      <FormInput label="Nouveau mot de passe" placeholder="Min. 6 caractères" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <FormInput label="Confirmer le nouveau mot de passe" placeholder="Confirmez..." secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <Button title={loading ? 'Modification...' : 'Modifier le mot de passe'} block loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, textAlign: 'center' },
});
