import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminAbonnements() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/subscription-requests');
      setRequests(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/subscription-requests/${id}/${action}`);
      await fetchRequests();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Demandes d'abonnement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {requests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="refresh-circle-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune demande en attente</Text>
          </View>
        ) : (
          requests.map(r => (
            <View key={r._id} style={styles.card}>
              <Text style={styles.nomBoutique}>{r.nomBoutique}</Text>
              <Text style={styles.phone}>☎️ Dépôt: {r.telephoneDepot}</Text>
              <Text style={styles.montant}>{r.montant?.toLocaleString('fr-GN')} GNF</Text>
              <Text style={styles.meta}>Par: {r.demandeur?.nom}</Text>
              <Text style={styles.date}>{new Date(r.createdAt).toLocaleString('fr-FR')}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handle(r._id, 'approve')}>
                  <Text style={styles.btnText}>✔️ Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handle(r._id, 'reject')}>
                  <Text style={styles.btnText}>✖️ Rejeter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  nomBoutique: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  phone: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  montant: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  meta: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  date: { fontSize: 10, color: Colors.textMuted, marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnApprove: { backgroundColor: Colors.success },
  btnReject: { backgroundColor: Colors.danger },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
