import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';

export default function AdminBoutiqueDetail() {
  const { id } = useLocalSearchParams();
  const [boutique, setBoutique] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boutiqueRes, statsRes] = await Promise.all([
          api.get(`/boutiques/${id}`),
          api.get(`/admin/boutiques/${id}/stats`),
        ]);
        setBoutique(boutiqueRes.data.boutique);
        setStats(statsRes.data);
      } catch {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Bilan - {boutique?.nom || '...'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !boutique || !stats ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Boutique introuvable</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard icon="cart-outline" label="Total Commandes" value={stats.totalOrders} color="#3b82f6" />
              <StatCard icon="checkmark-circle-outline" label="Confirmées" value={stats.totalConfirmed} color={Colors.success} />
              <StatCard icon="close-circle-outline" label="Annulées" value={stats.totalCancelled} color={Colors.danger} />
              <StatCard icon="trending-up-outline" label="Revenu Total" value={`${stats.totalRevenue?.toLocaleString('fr-GN')} GNF`} color={Colors.warning} />
            </View>

            <View style={styles.resetCard}>
              <Text style={styles.resetLabel}>Dernière réinitialisation</Text>
              <Text style={styles.resetDate}>
                {new Date(stats.lastResetDate).toLocaleDateString('fr-GN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Retour aux boutiques</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={28} color={color} style={{ marginBottom: 8 }} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
    </View>
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
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
  container: { flex: 1 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 16, gap: 10,
  },
  statCard: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: 12, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statLabel: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  resetCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  resetLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  resetDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  backBtn: {
    backgroundColor: '#e5e7eb', borderRadius: 8,
    marginHorizontal: 12, marginTop: 16, paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  errorBox: {
    margin: 16, backgroundColor: '#fee2e2',
    borderRadius: 8, padding: 12,
  },
  errorText: { color: Colors.danger, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
