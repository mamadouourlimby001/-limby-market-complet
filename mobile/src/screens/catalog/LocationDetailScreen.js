import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Modal, Dimensions, StyleSheet } from 'react-native';
import { MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { Badge, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const catLabels = { Location: 'Location', Colocation: 'Colocation', Vente_immobilière: 'Vente immobilière' };
const { height } = Dimensions.get('window');

export default function LocationDetailScreen({ route }) {
  const { id } = route.params;
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/locations/${id}`);
        setLocation(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!location) return <EmptyState text="Location introuvable" />;

  const photos = location.photos || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PhotoSlider photos={photos} height={Math.round(height * 0.50)} onPhotoClick={setExpandedIndex} />

      <Modal visible={expandedIndex !== null} transparent animationType="fade" onRequestClose={() => setExpandedIndex(null)}>
        <View style={styles.lightbox}>
          <View style={styles.lightboxHeader}>
            <Text style={styles.lightboxCounter}>{expandedIndex + 1} / {photos.length}</Text>
            <Pressable onPress={() => setExpandedIndex(null)}>
              <X size={28} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.lightboxBody}>
            {expandedIndex !== null && (
              <Image source={{ uri: photos[expandedIndex] }} style={styles.lightboxImage} resizeMode="contain" />
            )}
            {photos.length > 1 && (
              <>
                <Pressable
                  style={[styles.lightboxArrow, { left: 12 }]}
                  onPress={() => setExpandedIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                >
                  <ChevronLeft size={22} color="#fff" />
                </Pressable>
                <Pressable
                  style={[styles.lightboxArrow, { right: 12 }]}
                  onPress={() => setExpandedIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                >
                  <ChevronRight size={22} color="#fff" />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{location.titre}</Text>
        <Text style={styles.price}>{Number(location.prix || 0).toLocaleString('fr-FR')} GNF</Text>
        <View style={styles.badgeRow}>
          <Badge variant="primary">{catLabels[location.categorie] || location.categorie}</Badge>
          <Badge variant="primary" icon={<MapPin size={12} color={colors.primary} />}>
            {location.ville}, {location.quartier === 'hidden' ? 'Quartier masqué' : location.quartier}
          </Badge>
        </View>
        {location.description ? (
          <Text style={styles.description} numberOfLines={3}>{location.description}</Text>
        ) : null}
        <UnlockButton type="location" id={location._id} contact={location.contact} quartier={location.quartier} />
        <View style={{ marginTop: 6 }}>
          <ReportButton typeContenu="location" contenuId={location._id} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: colors.text },
  price: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  description: { fontSize: 12, color: '#4b5563', lineHeight: 18, marginBottom: 8 },
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  lightboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.8)' },
  lightboxCounter: { color: '#fff', fontSize: 14, fontWeight: '600' },
  lightboxBody: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lightboxImage: { width: '100%', height: '100%' },
  lightboxArrow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
