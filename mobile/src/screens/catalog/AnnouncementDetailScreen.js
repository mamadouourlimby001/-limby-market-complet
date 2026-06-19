import { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { MapPin, Building2, Clock } from 'lucide-react-native';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { Badge, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const { height } = Dimensions.get('window');

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PhotoSlider photos={ann.photos} height={Math.round(height * 0.50)} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{ann.titre}</Text>
        <Text style={styles.price}>{Number(ann.salaireMensuel || 0).toLocaleString('fr-FR')} GNF/mois</Text>
        <View style={styles.badgeRow}>
          <Badge variant="primary" icon={<MapPin size={12} color={colors.primary} />}>
            {ann.villeDeTravail}, {ann.quartier}
          </Badge>
          <Badge variant="primary" icon={<Building2 size={12} color={colors.primary} />}>{ann.entreprise}</Badge>
        </View>
        <Badge variant="warning" icon={<Clock size={12} color={colors.warning} />} style={{ marginBottom: 6 }}>
          Limite: {new Date(ann.dateLimite).toLocaleDateString('fr-FR')}
        </Badge>
        {ann.description ? (
          <Text style={styles.description} numberOfLines={3}>{ann.description}</Text>
        ) : null}
        <UnlockButton type="announcement" id={ann._id} contact={ann.contact} />
        <View style={{ marginTop: 6 }}>
          <ReportButton typeContenu="announcement" contenuId={ann._id} />
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
});
