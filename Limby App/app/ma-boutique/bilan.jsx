import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function BoutiquebilanScreen() {
  const [bilan, setBilan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBilan = async () => {
    try {
      const res = await api.get('/boutiques/stats/bilan');
      setBilan(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBilan().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBilan();
    setRefreshing(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bilan boutique</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="📦" label="Total commandes" value={bilan?.totalOrders || 0} color="#2196F3" />
          <StatCard icon="✅" label="Confirmées" value={bilan?.totalConfirmed || 0} color={Colors.success} />
          <StatCard icon="❌" label="Annulées" value={bilan?.totalCancelled || 0} color={Colors.danger} />
          <StatCard
            icon="💰"
            label="Revenus totaux"
            value={`${(bilan?.totalRevenue || 0).toLocaleString('fr-FR')} GNF`}
            color={Colors.primary}
            wide
          />
        </View>

        {/* Rate */}
        {bilan?.totalOrders > 0 && (
          <View style={styles.rateCard}>
            <Text style={styles.rateTitle}>Taux de confirmation</Text>
            <Text style={styles.rateValue}>
              {Math.round((bilan.totalConfirmed / bilan.totalOrders) * 100)}%
            </Text>
            <View style={styles.rateBar}>
              <View
                style={[
                  styles.rateProgress,
                  {
                    width: `${Math.round((bilan.totalConfirmed / bilan.totalOrders) * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {bilan?.lastResetDate && (
          <Text style={styles.resetDate}>
            Dernière remise à zéro : {new Date(bilan.lastResetDate).toLocaleDateString('fr-FR')}
          </Text>
        )}

        {/* Quick Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/commandes/boutique-commandes')}
          >
            <Text style={styles.actionBtnText}>📋 Voir les commandes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/credits/renouveler')}
          >
            <Text style={styles.actionBtnText}>🔄 Renouveler l'abonnement</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, wide = false }) {
  return (
    <View style={[styles.statCard, wide && styles.statCardWide, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backText: { fontSize: 22, color: Colors.primary, fontWeight: '600' },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.text },
  scroll: { padding: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  statCardWide: { width: '100%' },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  rateCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  rateTitle: { fontSize: 14, color: Colors.textLight, marginBottom: 4 },
  rateValue: { fontSize: 28, fontWeight: 'bold', color: Colors.success, marginBottom: 8 },
  rateBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  rateProgress: { height: '100%', backgroundColor: Colors.success, borderRadius: 4 },
  resetDate: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 16 },
  actions: { gap: 10 },
  actionBtn: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
