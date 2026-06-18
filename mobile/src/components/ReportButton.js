import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import CenterModal from './ui/CenterModal';
import { colors } from '../theme/theme';

// Portage exact de frontend/src/components/ReportButton.jsx
export default function ReportButton({ typeContenu, contenuId }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [raison, setRaison] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const goLogin = () => navigation.navigate('Compte', { screen: 'Login' });

  const handleReport = async () => {
    if (!user) return goLogin();
    setLoading(true);
    try {
      await api.post('/reports', { typeContenu, contenuId, raison });
      setSent(true);
      setTimeout(() => {
        setShowModal(false);
        setSent(false);
        setRaison('');
      }, 2000);
    } catch (err) {
      // ignoré, comme côté web
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable onPress={() => (user ? setShowModal(true) : goLogin())} style={styles.trigger}>
        <Text style={styles.triggerText}>⚠️ Signaler</Text>
      </Pressable>
      <CenterModal visible={showModal} onClose={() => setShowModal(false)}>
        {sent ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 14, color: colors.success }}>✔️ Signalement envoyé. Merci !</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Signaler ce contenu</Text>
            <FormInput
              label="Raison du signalement"
              value={raison}
              onChangeText={setRaison}
              placeholder="Décrivez la raison..."
              multiline
              numberOfLines={3}
            />
            <View style={styles.row}>
              <Button title="Annuler" variant="secondary" style={{ flex: 1 }} onPress={() => setShowModal(false)} />
              <Button title="Envoyer" variant="danger" style={{ flex: 1 }} loading={loading} onPress={handleReport} />
            </View>
          </>
        )}
      </CenterModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { paddingVertical: 2, alignSelf: 'flex-start' },
  triggerText: { color: '#9ca3af', fontSize: 11 },
  title: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
});
