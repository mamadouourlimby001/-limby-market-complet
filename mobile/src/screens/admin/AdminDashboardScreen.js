import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, CreditCard, RefreshCw, AlertTriangle, Users, PenTool, ShoppingBag, RotateCcw, Lock, Eye, Trash2, ShieldCheck, Wrench } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

const ICON_MAP = {
  credits: CreditCard, abonnements: RefreshCw, signalements: AlertTriangle, utilisateurs: Users,
  boutiques: ShoppingBag, 'reset-stats': RotateCcw, 'send-to-users': PenTool, passwords: Lock,
  visites: Eye, messages: MessageSquare, autorisation: ShieldCheck,
  services: Wrench, 'abonnements-services': RefreshCw,
};

const ALL_MENU_ITEMS = [
  { key: 'credits', screen: 'AdminCredits', label: 'Demandes crédits' },
  { key: 'abonnements', screen: 'AdminSubscriptions', label: 'Abonnements' },
  { key: 'signalements', screen: 'AdminReports', label: 'Signalements' },
  { key: 'utilisateurs', screen: 'AdminUsers', label: 'Utilisateurs' },
  { key: 'boutiques', screen: 'AdminBoutiques', label: 'Boutiques' },
  { key: 'services', screen: 'AdminServices', label: 'Services' },
  { key: 'abonnements-services', screen: 'AdminServiceSubscriptions', label: 'Abonnements Services' },
  { key: 'reset-stats', screen: 'AdminResetStats', label: 'Réinitialiser' },
  { key: 'send-to-users', screen: 'AdminSendToUsers', label: 'Écrire aux utilisateurs' },
  { key: 'passwords', screen: 'AdminPasswords', label: 'Mots de passe' },
  { key: 'visites', screen: 'AdminVisites', label: 'Visites' },
  { key: 'messages', screen: 'AdminMessages', label: 'Messages' },
];

const DEFAULT_SIMPLE_KEYS = ['credits', 'abonnements', 'signalements', 'utilisateurs', 'send-to-users', 'messages', 'services', 'abonnements-services'];

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const isSuperAdmin =
    (user?.telephone === '+224629043181' && user?.nom?.toLowerCase() === 'diallo mamadou oury') ||
    (user?.telephone === '+224625223418' && user?.nom?.toLowerCase() === 'barry fatoumata binta');

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, messagesRes, notifRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/messages/admin/messages').catch(() => ({ data: { unreadCount: 0 } })),
          api.get('/notifications').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setUnreadMessagesCount(messagesRes.data.unreadCount || 0);
        setNotifications(notifRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <Loader fullScreen />;

  let menuItems;
  if (isSuperAdmin) {
    menuItems = [...ALL_MENU_ITEMS, { key: 'autorisation', screen: 'AdminAutorisation', label: 'Autorisation' }];
  } else {
    const perms = user?.adminPermissions;
    const allowed = (perms && perms.length > 0) ? perms : DEFAULT_SIMPLE_KEYS;
    menuItems = ALL_MENU_ITEMS.filter(item => allowed.includes(item.key));
  }

  return (
    <Screen>
      <Text style={styles.title}>Administration</Text>

      {stats && (
        <View style={styles.statsGrid}>
          {[
            { label: 'Utilisateurs', value: stats.totalUsers },
            { label: 'Publications actives', value: (stats.totalProducts || 0) + (stats.totalLocations || 0) + (stats.totalAnnouncements || 0) },
            { label: 'Boutiques actives', value: stats.totalBoutiques },
            { label: 'Contacts débloqués', value: stats.totalUnlocks },
            { label: 'Transactions', value: stats.totalCreditsVendus },
            { label: 'Revenus (GNF)', value: (stats.totalRevenue || 0).toLocaleString('fr-GN') },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.menuGrid}>
        {menuItems.map(item => {
          const Icon = ICON_MAP[item.key] || MessageSquare;
          return (
            <Pressable key={item.key} onPress={() => navigation.navigate(item.screen)} style={styles.menuCard}>
              <Icon size={28} color={colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.key === 'messages' && unreadMessagesCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {stats?.recentTransactions?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Dernières transactions</Text>
          {stats.recentTransactions.map((t, i) => (
            <Card key={i} style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View>
                  <Text style={styles.transactionName}>{t.nomCompte}</Text>
                  <Text style={styles.transactionPhone}>{t.telephoneDepot}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.transactionAmount}>{t.montant} GNF</Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: t.statut === 'approuvé' ? colors.success : t.statut === 'rejeté' ? colors.danger : colors.warning
                  }]}>
                    <Text style={styles.statusText}>{t.statut}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

      {notifications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.map((n) => (
            <Card key={n._id} style={[styles.notifCard, { opacity: n.lu ? 0.6 : 1, borderLeftWidth: n.lu ? 0 : 3, borderLeftColor: colors.primary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifText}>{n.message}</Text>
                  <Text style={styles.notifDate}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Pressable onPress={() => handleDeleteNotification(n._id)} style={styles.notifDeleteBtn}>
                  <Trash2 size={14} color="#ef4444" />
                </Pressable>
              </View>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: '#fff', padding: 12, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  menuCard: { width: '47%', backgroundColor: '#fff', padding: 16, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, position: 'relative' },
  menuLabel: { fontSize: 12, fontWeight: '600', color: colors.primary, marginTop: 8, textAlign: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#dc3545', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  transactionCard: { padding: 10, marginBottom: 6 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionName: { fontSize: 12, fontWeight: '600' },
  transactionPhone: { fontSize: 11, color: colors.textLight },
  transactionAmount: { fontSize: 13, fontWeight: '700', color: colors.primary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginTop: 4 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  notifCard: { padding: 10, marginBottom: 6 },
  notifText: { fontSize: 13 },
  notifDate: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  notifDeleteBtn: { padding: 4 },
});
