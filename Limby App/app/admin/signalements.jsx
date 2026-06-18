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

const TYPE_LABELS = {
  product: 'Produit',
  location: 'Location',
  announcement: 'Annonce',
  boutique: 'Boutique',
};

export default function AdminSignalements() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchReports().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/reports/${id}/handle`, { action });
      await fetchReports();
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
        <Text style={styles.title}>Signalements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {reports.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="warning-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun signalement en attente</Text>
          </View>
        ) : (
          reports.map(r => (
            <View key={r._id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{TYPE_LABELS[r.typeContenu] || r.typeContenu}</Text>
                </View>
                <Text style={styles.date}>{new Date(r.createdAt).toLocaleString('fr-FR')}</Text>
              </View>
              <Text style={styles.raison}>{r.raison || 'Aucune raison spécifiée'}</Text>
              <Text style={styles.by}>Par: {r.signalePar?.nom}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handle(r._id, 'supprimer')}>
                  <Ionicons name="trash-outline" size={14} color={Colors.white} />
                  <Text style={styles.btnText}>Supprimer contenu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => handle(r._id, 'ignorer')}>
                  <Text style={[styles.btnText, { color: Colors.text }]}>Ignorer</Text>
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#fef3c7', borderRadius: 6,
  },
  typeText: { fontSize: 11, color: '#92400e', fontWeight: '600' },
  date: { fontSize: 10, color: Colors.textMuted },
  raison: { fontSize: 13, color: Colors.text, marginBottom: 4 },
  by: { fontSize: 11, color: Colors.textLight, marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 4,
  },
  btnDanger: { backgroundColor: Colors.danger },
  btnSecondary: { backgroundColor: '#e5e7eb' },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
});
