import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/SendMessageToAdmins.jsx
export default function SendMessageToAdminsScreen() {
  const navigation = useNavigation();
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!contenu.trim()) {
      setMessage('Veuillez écrire un message');
      return;
    }
    setLoading(true);
    try {
      await api.post('/messages/send-to-admins', { contenu });
      setMessage('Message envoyé avec succès');
      setContenu('');
      setTimeout(() => navigation.navigate('UserDashboard'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes('succès');

  return (
    <Screen>
      <Text style={styles.title}>Écrire aux administrateurs</Text>

      <FormInput
        value={contenu}
        onChangeText={setContenu}
        placeholder="Votre message..."
        maxLength={500}
        multiline
        numberOfLines={6}
      />
      <Text style={styles.counter}>{contenu.length}/500 caractères</Text>

      {message ? (
        <View style={[styles.banner, { backgroundColor: isSuccess ? '#d4edda' : '#f8d7da' }]}>
          <Text style={{ color: isSuccess ? '#155724' : '#721c24', fontSize: 13 }}>{message}</Text>
        </View>
      ) : null}

      <Button
        title={loading ? 'Envoi en cours...' : 'Envoyer'}
        block
        disabled={loading || !contenu.trim()}
        loading={loading}
        onPress={handleSubmit}
        style={{ marginBottom: 10 }}
      />
      <Button title="Annuler" variant="secondary" block onPress={() => navigation.navigate('UserDashboard')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  counter: { fontSize: 12, color: '#666', marginBottom: 12 },
  banner: { padding: 12, borderRadius: 6, marginBottom: 12 },
});
