import { useState } from 'react';
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { MapPin, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { colors } from '../theme/theme';

const catLabels = { Location: 'Location', Colocation: 'Colocation', Vente_immobilière: 'Vente' };

export default function LocationCard({ location, onRefresh }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);
  const [disponible, setDisponible] = useState(location.disponible !== false);
  const goDetail = () => navigation.navigate('LocationDetail', { id: location._id });

  const isOwner = user && String(location.proprietaire?._id) === String(user._id);

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Cette publication sera définitivement supprimée ainsi que ses photos.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/locations/${location._id}`);
          setVisible(false);
          onRefresh?.();
        } catch { Alert.alert('Erreur', 'Suppression échouée'); }
      }},
    ]);
  };

  const handleToggle = async () => {
    try {
      await api.put(`/locations/${location._id}/disponibilite`);
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
        {location.photos?.length > 0
          ? <Image source={{ uri: location.photos[0] }} style={styles.image} resizeMode="contain" />
          : <View style={styles.imagePlaceholder} />
        }
      </Pressable>
      <View style={styles.body}>
        <Pressable onPress={goDetail}>
          <Text style={styles.title} numberOfLines={2}>{location.titre}</Text>
        </Pressable>
        <View style={styles.row}>
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} />
            <Text style={styles.meta}>{location.ville}</Text>
          </View>
          <Badge variant="primary">{catLabels[location.categorie] || location.categorie}</Badge>
        </View>
        <Text style={styles.price}>{Number(location.prix || 0).toLocaleString('fr-FR')} GNF</Text>
        <UnlockButton type="location" id={location._id} contact={location.contact} />
        <ReportButton typeContenu="location" contenuId={location._id} />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { fontSize: 11, color: colors.textLight },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  ownerRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  ownerBtn: { borderRadius: 4, paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  ownerBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
