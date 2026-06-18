import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button, Badge } from '../../components/ui';
import { colors } from '../../theme/theme';

const TYPE_LABELS = { product: 'Produit', location: 'Location', announcement: 'Annonce', boutique: 'Boutique' };

export default function AdminReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/reports/${id}/handle`, { action });
      fetchReports();
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Signalements</Text>
      {reports.length === 0 ? (
        <EmptyState text="Aucun signalement en attente" />
      ) : (
        reports.map(r => (
          <Card key={r._id} style={styles.card}>
            <View style={styles.cardTop}>
              <Badge variant="warning">{TYPE_LABELS[r.typeContenu] || r.typeContenu}</Badge>
              <Text style={styles.date}>{new Date(r.createdAt).toLocaleString('fr-FR')}</Text>
            </View>
            <Text style={styles.raison}>{r.raison || 'Aucune raison spécifiée'}</Text>
            <Text style={styles.meta}>Par: {r.signalePar?.nom}</Text>
            <View style={styles.btnRow}>
              <Button title="🗑 Supprimer contenu" variant="danger" style={{ flex: 1 }} onPress={() => handle(r._id, 'supprimer')} />
              <Button title="Ignorer" variant="secondary" style={{ flex: 1 }} onPress={() => handle(r._id, 'ignorer')} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  card: { padding: 12, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 10, color: '#9ca3af' },
  raison: { fontSize: 13, marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textLight, marginBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 8 },
});
