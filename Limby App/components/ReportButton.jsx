import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Colors } from '../constants/colors';

export default function ReportButton({ typeContenu, contenuId }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [raison, setRaison] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleOpen = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    setVisible(true);
  };

  const handleReport = async () => {
    if (!raison.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire la raison du signalement');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reports', { typeContenu, contenuId, raison });
      setSent(true);
      setTimeout(() => {
        setVisible(false);
        setSent(false);
        setRaison('');
      }, 2000);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleOpen} style={styles.trigger}>
        <Text style={styles.triggerText}>⚠️ Signaler</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {sent ? (
              <View style={styles.sentContainer}>
                <Text style={styles.sentText}>✔️ Signalement envoyé. Merci !</Text>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Signaler ce contenu</Text>
                <Text style={styles.label}>Raison du signalement</Text>
                <TextInput
                  style={styles.textarea}
                  value={raison}
                  onChangeText={setRaison}
                  placeholder="Décrivez la raison..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={() => { setVisible(false); setRaison(''); }}
                  >
                    <Text style={styles.btnCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDanger, loading && styles.btnDisabled]}
                    onPress={handleReport}
                    disabled={loading}
                  >
                    {loading
                      ? <ActivityIndicator color={Colors.white} size="small" />
                      : <Text style={styles.btnText}>Envoyer</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { paddingVertical: 6 },
  triggerText: { fontSize: 12, color: Colors.textMuted },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.inputBg,
    minHeight: 90,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  btnCancel: { backgroundColor: '#e5e7eb' },
  btnCancelText: { fontWeight: '700', color: Colors.text, fontSize: 14 },
  btnDanger: { backgroundColor: Colors.danger },
  btnText: { fontWeight: '700', color: Colors.white, fontSize: 14 },
  btnDisabled: { opacity: 0.6 },

  sentContainer: { paddingVertical: 20, alignItems: 'center' },
  sentText: { fontSize: 15, color: Colors.success, fontWeight: '600' },
});
