import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

const STATUS_STYLE = {
  approuve: { color: Colors.success, bg: '#d1fae5', label: 'Approuve' },
  rejete: { color: Colors.danger, bg: '#fee2e2', label: 'Rejete' },
  en_attente: { color: '#f59e0b', bg: '#fef3c7', label: 'En attente' },
};

export default function CreditHistoriqueScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/credits/my-history');
      setHistory(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchHistory().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Credits & Historique</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCount}>{user?.credits ?? 0}</Text>
          <Text style={styles.balanceLabel}>credits disponibles</Text>
          <TouchableOpacity style={styles.buyBtn} onPress={() => router.push('/credits/acheter')}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.white} />
            <Text style={styles.buyBtnText}>Acheter des credits</Text>
          </TouchableOpacity>
        </View>

        {/* Credit requests */}
        {history?.requests && history.requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Demandes de credits ({history.requests.length})</Text>
            {history.requests.map((r, i) => {
              const st = STATUS_STYLE[r.statut] || STATUS_STYLE.en_attente;
              return (
                <View key={i} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardAmount}>{r.montant} GNF</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDate}>
                    {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Unlocked contacts */}
        {history?.unlocks && history.unlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacts debloques ({history.unlocks.length})</Text>
            {history.unlocks.map((u, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.unlockIconWrap}>
                    <Ionicons name="lock-open-outline" size={14} color={Colors.primary} />
                    <Text style={styles.unlockType}>{u.typeContenu}</Text>
                  </View>
                  <Text style={styles.creditSpent}>-{u.creditsDepenses} credit(s)</Text>
                </View>
                <Text style={styles.cardDate}>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!history || (history.requests?.length === 0 && history.unlocks?.length === 0) ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun historique disponible</Text>
          </View>
        ) : null}

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

  balanceCard: {
    backgroundColor: Colors.primary, margin: 12, borderRadius: 16,
    padding: 20, alignItems: 'center', gap: 4,
  },
  balanceCount: { fontSize: 40, fontWeight: '800', color: Colors.white },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  buyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  section: { paddingHorizontal: 12, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.text,
    marginBottom: 8, marginTop: 8,
  },

  card: {
    backgroundColor: Colors.card, borderRadius: 10,
    padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardAmount: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  unlockIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unlockType: { fontSize: 13, fontWeight: '600', color: Colors.text },
  creditSpent: { fontSize: 13, fontWeight: '700', color: Colors.danger },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
