import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

const MENU = [
  { path: '/admin/credits', label: 'Crédits', icon: 'card', desc: 'Demandes en attente' },
  { path: '/admin/abonnements', label: 'Abonnements', icon: 'refresh-circle', desc: 'Boutiques' },
  { path: '/admin/signalements', label: 'Signalements', icon: 'warning', desc: 'À traiter' },
  { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'people', desc: 'Gestion' },
  { path: '/admin/boutiques', label: 'Boutiques', icon: 'storefront', desc: 'Admin' },
  { path: '/admin/send-to-users', label: 'Écrire', icon: 'pencil', desc: 'Aux utilisateurs' },
  { path: '/admin/messages', label: 'Messages', icon: 'chatbubbles', desc: 'Boîte de réception' },
  { path: '/admin/visites', label: 'Visites', icon: 'eye', desc: 'Statistiques' },
  { path: '/admin/reset-stats', label: 'Réinitialiser', icon: 'refresh', desc: 'Données' },
  { path: '/admin/passwords', label: 'Mots de passe', icon: 'lock-closed', desc: 'Sécurité' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);

  const isSuperAdmin =
    (user?.telephone === '+224629043181' && user?.nom?.toLowerCase() === 'diallo mamadou oury') ||
    (user?.telephone === '+224625223418' && user?.nom?.toLowerCase() === 'barry fatoumata binta');

  const fetchData = async () => {
    try {
      const [statsRes, msgRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/messages/admin/messages').catch(() => ({ data: { unreadCount: 0 } })),
      ]);
      setStats(statsRes.data);
      setUnread(msgRes.data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const visibleMenu = MENU.filter((item) => {
    if (['/admin/boutiques', '/admin/reset-stats', '/admin/visites', '/admin/passwords'].includes(item.path)) {
      return isSuperAdmin;
    }
    return true;
  });

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.pageTitle}>Administration</Text>

      {/* Stats */}
      {stats && (
        <View style={styles.statsGrid}>
          <StatCard label="Utilisateurs" value={stats.totalUsers} icon="people-outline" />
          <StatCard label="Publications" value={(stats.totalProducts || 0) + (stats.totalLocations || 0) + (stats.totalAnnouncements || 0)} icon="newspaper-outline" />
          <StatCard label="Boutiques" value={stats.totalBoutiques} icon="storefront-outline" />
          <StatCard label="Contacts débloqués" value={stats.totalUnlocks} icon="lock-open-outline" />
          <StatCard label="Transactions" value={stats.totalCreditsVendus} icon="card-outline" />
          <StatCard label="Revenus (GNF)" value={stats.totalRevenue?.toLocaleString('fr-GN')} icon="trending-up-outline" />
        </View>
      )}

      {/* Menu admin */}
      <View style={styles.menuGrid}>
        {visibleMenu.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.menuCard}
            onPress={() => router.push(item.path)}
            activeOpacity={0.8}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon} size={26} color={Colors.primary} />
              {item.path === '/admin/messages' && unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              )}
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDesc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dernières transactions */}
      {stats?.recentTransactions?.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Dernières transactions</Text>
          {stats.recentTransactions.map((t, i) => (
            <View key={i} style={styles.transactionCard}>
              <View>
                <Text style={styles.transactionName}>{t.nomCompte}</Text>
                <Text style={styles.transactionPhone}>{t.telephoneDepot}</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>{t.montant} GNF</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: t.statut === 'approuvé' ? '#d1fae5' : t.statut === 'rejeté' ? '#fee2e2' : '#fef3c7'
                }]}>
                  <Text style={[styles.statusText, {
                    color: t.statut === 'approuvé' ? Colors.success : t.statut === 'rejeté' ? Colors.danger : Colors.warning
                  }]}>{t.statut}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={Colors.primary} style={{ marginBottom: 4 }} />
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: {
    fontSize: 22, fontWeight: '800', color: Colors.primary,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10, marginBottom: 16,
  },
  statCard: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  menuGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10, marginBottom: 16,
  },
  menuCard: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: 12, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  menuIconWrap: { position: 'relative', marginBottom: 8 },
  menuLabel: { fontSize: 13, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  menuDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  badge: {
    position: 'absolute', top: -6, right: -10,
    backgroundColor: Colors.danger, borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  transactionsSection: { paddingHorizontal: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  transactionCard: {
    backgroundColor: Colors.card, borderRadius: 10,
    padding: 12, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  transactionName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  transactionPhone: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end', gap: 4 },
  transactionAmount: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
