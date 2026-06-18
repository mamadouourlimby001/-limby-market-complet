import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminCreditRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/credit-requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/credit-requests/${id}/${action}`);
      fetchRequests();
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Demandes de crédits</Text>
      {requests.length === 0 ? (
        <EmptyState text="Aucune demande en attente" />
      ) : (
        requests.map(r => (
          <Card key={r._id} style={styles.card}>
            <Text style={styles.name}>{r.nomCompte}</Text>
            <Text style={styles.meta}>☎️ Dépôt: {r.telephoneDepot}</Text>
            <Text style={styles.amount}>{(r.montant || 0).toLocaleString('fr-GN')} GNF</Text>
            <Text style={styles.meta}>→ Créditer: {r.telephoneCompte}</Text>
            <Text style={styles.date}>{new Date(r.createdAt).toLocaleString('fr-FR')}</Text>
            <View style={styles.btnRow}>
              <Button title="✔️ Approuver" variant="success" style={{ flex: 1 }} onPress={() => handle(r._id, 'approve')} />
              <Button title="✖️ Rejeter" variant="danger" style={{ flex: 1 }} onPress={() => handle(r._id, 'reject')} />
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
  name: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textLight, marginBottom: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  date: { fontSize: 10, color: '#9ca3af', marginBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 8 },
});
