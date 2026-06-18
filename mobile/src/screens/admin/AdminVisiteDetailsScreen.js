import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, Globe, Trash2, MapPin } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminVisiteDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/admin/visites/${id}`);
        setVisite(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette visite ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try {
          await api.delete(`/admin/visites/${id}`);
          Alert.alert('', 'Visite supprimée avec succès');
          navigation.goBack();
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
          setDeleting(false);
        }
      }},
    ]);
  };

  if (loading) return <Loader fullScreen />;

  if (error || !visite) {
    return (
      <Screen>
        <Button title="← Retour" variant="secondary" onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        {error ? <AlertBanner variant="danger">{error}</AlertBanner> : <EmptyState text="Visite introuvable" />}
      </Screen>
    );
  }

  const hours = Math.floor(visite.dureeTotale / 3600);
  const minutes = Math.floor((visite.dureeTotale % 3600) / 60);
  const seconds = visite.dureeTotale % 60;

  return (
    <Screen>
      <Button title="← Retour aux visites" variant="secondary" onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
      <Text style={styles.title}>Détails de la visite</Text>

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <Text style={styles.visitorLabel}>VISITEUR</Text>
        <Text style={styles.visitorName}>{visite.nom}</Text>

        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>CONTACT</Text>
            <Text style={styles.cellValue}>{visite.telephone}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>PAGES VISITÉES</Text>
            <Text style={styles.cellValue}>{visite.pagesVisitees?.length || 0}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>LOCALISATION</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={styles.locationText}>{visite.ville || '-'}, {visite.region || '-'}, {visite.pays || '-'}</Text>
            </View>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>DATE DÉBUT</Text>
            <Text style={styles.cellValue}>
              {new Date(visite.dateDebut).toLocaleDateString('fr-FR')} à {new Date(visite.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.cellLabel}>DURÉE TOTALE</Text>
          <Text style={styles.duration}>{hours}h {minutes}m {seconds}s</Text>
        </View>

        <Button
          title={deleting ? 'Suppression...' : 'Supprimer cette visite'}
          variant="danger"
          block
          loading={deleting}
          onPress={handleDelete}
        />
      </Card>

      <Text style={styles.sectionTitle}>Pages visitées</Text>

      {!visite.pagesVisitees?.length ? (
        <EmptyState text="Aucune page visitée" />
      ) : (
        visite.pagesVisitees.map((page, idx) => (
          <Card key={idx} style={styles.pageCard}>
            <View style={styles.pageRow}>
              <Globe size={14} color={colors.textLight} />
              <Text style={styles.pageName} numberOfLines={2}>{page.page}</Text>
            </View>
            <View style={styles.pageTimings}>
              <Text style={styles.pageTiming}>Arrivée: {page.tempsDebut ? new Date(page.tempsDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</Text>
              <Text style={styles.pageTiming}>Départ: {page.tempsFin ? new Date(page.tempsFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</Text>
              <View style={styles.durationRow}>
                <Clock size={12} color={colors.textLight} />
                <Text style={styles.pageTiming}>{page.duree ? Math.round(page.duree) + 's' : '-'}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 16 },
  visitorLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  visitorName: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  gridCell: { width: '50%', marginBottom: 16 },
  cellLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  cellValue: { fontSize: 14, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, flex: 1 },
  duration: { fontSize: 18, fontWeight: '700', color: colors.success },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 12 },
  pageCard: { padding: 12, marginBottom: 8 },
  pageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  pageName: { fontSize: 13, flex: 1 },
  pageTimings: { gap: 4 },
  pageTiming: { fontSize: 12, color: colors.textLight },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
