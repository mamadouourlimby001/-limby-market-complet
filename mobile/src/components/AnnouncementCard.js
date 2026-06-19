import { useState } from 'react';
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { MapPin, Building2, Clock, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import { colors } from '../theme/theme';

export default function AnnouncementCard({ announcement, onRefresh }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);
  const [disponible, setDisponible] = useState(announcement.disponible !== false);
  const goDetail = () => navigation.navigate('AnnouncementDetail', { id: announcement._id });

  const isOwner = user && String(announcement.auteur?._id) === String(user._id);

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Cette publication sera définitivement supprimée ainsi que ses photos.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/announcements/${announcement._id}`);
          setVisible(false);
          onRefresh?.();
        } catch { Alert.alert('Erreur', 'Suppression échouée'); }
      }},
    ]);
  };

  const handleToggle = async () => {
    try {
      await api.put(`/announcements/${announcement._id}/disponibilite`);
      const newDispo = !disponible;
      setDisponible(newDispo);
      if (!newDispo) setVisible(false);
      onRefresh?.();
    } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <Card style={[styles.card, !disponible && styles.dimmed]}>
      <Pressable onPress={goDetail}>
        {announcement.photos?.length > 0
          ? <Image source={{ uri: announcement.photos[0] }} style={styles.image} resizeMode="contain" />
          : <View style={styles.imagePlaceholder} />
        }
      </Pressable>
      <View style={styles.body}>
        <Pressable onPress={goDetail}>
          <Text style={styles.title} numberOfLines={2}>{announcement.titre}</Text>
        </Pressable>
        <View style={styles.metaRow}>
          <MapPin size={12} color={colors.textLight} />
          <Text style={styles.meta}>{announcement.villeDeTravail}</Text>
        </View>
        <View style={styles.metaRow}>
          <Building2 size={12} color={colors.textLight} />
          <Text style={styles.meta}>{announcement.entreprise}</Text>
        </View>
        <Text style={styles.price}>{Number(announcement.salaireMensuel || 0).toLocaleString('fr-FR')} GNF/mois</Text>
        <View style={styles.metaRow}>
          <Clock size={12} color={colors.warning} />
          <Text style={styles.limite}>Limite: {new Date(announcement.dateLimite).toLocaleDateString('fr-FR')}</Text>
        </View>
        <UnlockButton type="announcement" id={announcement._id} contact={announcement.contact} />
        <ReportButton typeContenu="announcement" contenuId={announcement._id} />
        {isOwner && (
          <View style={styles.ownerRow}>
            <Pressable style={[styles.ownerBtn, { backgroundColor: disponible ? '#059669' : '#6b7280', flex: 1 }]} onPress={handleToggle}>
              <Text style={styles.ownerBtnText}>{disponible ? '✓ Disponible' : '✗ Indisponible'}</Text>
            </Pressable>
            <Pressable style={[styles.ownerBtn, { backgroundColor: '#ef4444' }]} onPress={handleDelete}>
              <Trash2 size={13} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden' },
  dimmed: { opacity: 0.65 },
  image: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
  imagePlaceholder: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
  body: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  meta: { fontSize: 11, color: colors.textLight },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginVertical: 2 },
  limite: { fontSize: 10, color: colors.warning, marginBottom: 6 },
  ownerRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  ownerBtn: { borderRadius: 4, paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  ownerBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
