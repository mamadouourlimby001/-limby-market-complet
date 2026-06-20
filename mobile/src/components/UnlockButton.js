import { useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { Unlock, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from './ui/Button';
import CenterModal from './ui/CenterModal';
import WhatsAppIcon from './WhatsAppIcon';
import { colors } from '../theme/theme';

// Portage exact de frontend/src/components/UnlockButton.jsx
export default function UnlockButton({ type, id, contact, quartier }) {
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState(contact !== 'hidden' ? contact : null);
  const [unlockedQuartier, setUnlockedQuartier] = useState(quartier !== 'hidden' ? quartier : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const creditCost = type === 'location' ? 10 : 1;

  const goLogin = () => navigation.navigate('Compte', { screen: 'Login' });

  const handleUnlock = async () => {
    if (!user) return goLogin();
    setLoading(true);
    setError('');
    try {
      const endpoint =
        type === 'product'
          ? `/products/${id}/unlock-contact`
          : type === 'location'
          ? `/locations/${id}/unlock-contact`
          : `/announcements/${id}/unlock-contact`;
      const res = await api.post(endpoint);
      setUnlockedContact(res.data.contact);
      if (res.data.quartier) setUnlockedQuartier(res.data.quartier);
      setShowConfirm(false);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (unlockedContact) {
    const phone = (unlockedContact || '').replace(/\D/g, '');
    return (
      <View>
        <View style={styles.unlockedBadge}>
          <Phone size={14} color={colors.success} />
          <Text style={styles.unlockedText}>{unlockedContact}</Text>
        </View>
        <Pressable
          style={styles.whatsappBtn}
          onPress={() => Linking.openURL(`https://wa.me/${phone}`)}
        >
          <WhatsAppIcon size={16} />
          <Text style={styles.whatsappText}>Contacter sur WhatsApp</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Button
        title={`Débloquer contact (${creditCost} crédit${creditCost > 1 ? 's' : ''})`}
        size="sm"
        block
        onPress={() => (user ? setShowConfirm(true) : goLogin())}
        style={{ marginBottom: 4 }}
      />
      <CenterModal visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <Text style={styles.title}>Débloquer ce contact ?</Text>
        <Text style={styles.body}>
          Cela vous coûtera{' '}
          <Text style={styles.bold}>
            {creditCost} crédit{creditCost > 1 ? 's' : ''} ({creditCost * 1000} GNF)
          </Text>
          .{'\n'}
          Votre solde actuel : <Text style={styles.bold}>{user?.credits || 0} crédits</Text>
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.row}>
          <Button title="Annuler" variant="secondary" style={{ flex: 1 }} onPress={() => setShowConfirm(false)} />
          <Button title="Confirmer" style={{ flex: 1 }} loading={loading} onPress={handleUnlock} />
        </View>
      </CenterModal>
    </>
  );
}

const styles = StyleSheet.create({
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  unlockedText: { fontSize: 13, fontWeight: '600', color: colors.success },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#25D366', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginTop: 6, alignSelf: 'flex-start' },
  whatsappText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  body: { fontSize: 13, color: colors.textLight, marginBottom: 16, lineHeight: 19 },
  bold: { fontWeight: '700', color: colors.text },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8 },
});
