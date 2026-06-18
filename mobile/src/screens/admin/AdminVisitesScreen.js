import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, Phone, Clock, Globe, Trash2, MapPin, BarChart3 } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Loader, EmptyState, Button, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';
import TrafficSummaryView from './TrafficSummaryView';

export default function AdminVisitesScreen() {
  const navigation = useNavigation();
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showTrafficSummary, setShowTrafficSummary] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/visites');
        setVisites(res.data.visites || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = (visitId) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette visite ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setDeleting(visitId);
        try {
          await api.delete(`/admin/visites/${visitId}`);
          setVisites(visites.filter(v => v._id !== visitId));
          Alert.alert('', 'Visite supprimée avec succès');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
          setDeleting(null);
        }
      }},
    ]);
  };

  if (loading) return <Loader fullScreen />;
  if (showTrafficSummary) return <TrafficSummaryView onClose={() => setShowTrafficSummary(false)} />;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Visites des 24 dernières heures</Text>
        <Pressable style={styles.bilanBtn} onPress={() => setShowTrafficSummary(true)}>
          <BarChart3 size={16} color="#fff" />
          <Text style={styles.bilanBtnText}>Bilan du trafic</Text>
        </Pressable>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      <AlertBanner variant="info" style={{ marginBottom: 12 }}>
        <Text><Text style={{ fontWeight: '700' }}>Total de visiteurs :</Text> {visites.length} personne{visites.length > 1 ? 's' : ''}</Text>
      </AlertBanner>

      {visites.length === 0 ? (
        <EmptyState text="Aucune visite enregistrée" />
      ) : (
        visites.map(visite => (
          <View key={visite._id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.visitorName}>{visite.nom}</Text>
              <View style={styles.metaRow}>
                <Phone size={12} color={colors.textLight} />
                <Text style={styles.metaText}>{visite.telephone}</Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={12} color={colors.textLight} />
                <Text style={styles.metaText}>{visite.ville || '-'}, {visite.region || '-'}, {visite.pays || '-'}</Text>
              </View>
              <View style={styles.metaRowInline}>
                <View style={styles.metaRow}>
                  <Globe size={12} color={colors.textLight} />
                  <Text style={styles.metaText}>{visite.nombrePages} pages</Text>
                </View>
                <View style={styles.metaRow}>
                  <Clock size={12} color={colors.textLight} />
                  <Text style={styles.metaText}>{Math.round(visite.dureeTotale / 60)}m</Text>
                </View>
              </View>
              <Text style={styles.dateText}>
                {new Date(visite.dateDebut).toLocaleDateString('fr-FR')} {new Date(visite.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.actionCol}>
              <Pressable style={styles.detailBtn} onPress={() => navigation.navigate('AdminVisiteDetails', { id: visite._id })}>
                <Eye size={14} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.deleteBtn, deleting === visite._id && { opacity: 0.6 }]}
                disabled={deleting === visite._id}
                onPress={() => handleDelete(visite._id)}
              >
                <Trash2 size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.primary, flex: 1 },
  bilanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  bilanBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  visitorName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaRowInline: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  metaText: { fontSize: 11, color: colors.textLight },
  dateText: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  actionCol: { gap: 8, marginLeft: 8 },
  detailBtn: { backgroundColor: colors.primary, padding: 8, borderRadius: 4 },
  deleteBtn: { backgroundColor: colors.danger, padding: 8, borderRadius: 4 },
});
