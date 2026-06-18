import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MapPin, Building2, Clock } from 'lucide-react-native';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { Badge, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/AnnouncementDetail.jsx
export default function AnnouncementDetailScreen({ route }) {
  const { id } = route.params;
  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/announcements/${id}`);
        setAnn(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!ann) return <EmptyState text="Annonce introuvable" />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <PhotoSlider photos={ann.photos} height={250} />
      <View style={styles.body}>
        <Text style={styles.title}>{ann.titre}</Text>
        <Text style={styles.price}>{Number(ann.salaireMensuel || 0).toLocaleString('fr-FR')} GNF/mois</Text>
        <View style={styles.badgeRow}>
          <Badge variant="primary" icon={<MapPin size={14} color={colors.primary} />}>
            {ann.villeDeTravail}, {ann.quartier}
          </Badge>
          <Badge variant="primary" icon={<Building2 size={14} color={colors.primary} />}>{ann.entreprise}</Badge>
        </View>
        <Badge variant="warning" icon={<Clock size={14} color={colors.warning} />} style={{ marginBottom: 12 }}>
          Limite: {new Date(ann.dateLimite).toLocaleDateString('fr-FR')}
        </Badge>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{ann.description}</Text>
        <UnlockButton type="announcement" id={ann._id} contact={ann.contact} />
        <View style={{ marginTop: 8 }}>
          <ReportButton typeContenu="announcement" contenuId={ann._id} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  description: { fontSize: 13, color: '#4b5563', lineHeight: 20, marginBottom: 14 },
});
