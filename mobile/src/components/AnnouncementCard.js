import { useState, memo } from 'react';
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { MapPin, Building2, Clock, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import { colors } from '../theme/theme';

export default memo(function AnnouncementCard({ announcement, onRefresh }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);
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
        } catch (e) { Alert.alert('Erreur', 'Suppression échouée'); }
      }},
    ]);
  };

  if (!visible) return null;

  return (
    <Card style={styles.card}>
      <Pressable style={styles.imageWrap} onPress={goDetail}>
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
          <MapPin size={12} color={colors.success} />
          <Text style={styles.metaVille}>{announcement.villeDeTravail}</Text>
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
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={13} color="#fff" />
            <Text style={styles.deleteBtnText}>Supprimer</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', height: 340 },
  imageWrap: { flex: 1 },
  image: { width: '100%', height: '100%', backgroundColor: '#fff' },
  imagePlaceholder: { width: '100%', flex: 1, backgroundColor: '#f0f0f0' },
  body: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  meta: { fontSize: 11, color: colors.textLight },
  metaVille: { fontSize: 11, color: colors.success },
  price: { fontSize: 17, fontWeight: '700', color: '#111', marginVertical: 2 },
  limite: { fontSize: 10, color: colors.warning, marginBottom: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ef4444', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8, marginTop: 6, alignSelf: 'flex-start' },
  deleteBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
