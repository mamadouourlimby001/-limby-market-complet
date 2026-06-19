import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ShoppingBag, Check, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import UserMessagesList from '../../components/UserMessagesList';
import { Button, Card, Badge, Tabs, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const roleLabels = {
  acheteur: 'Acheteur',
  vendeur: 'Vendeur',
  vendeur_boutique: 'Vendeur Boutique',
  admin_simple: 'Admin',
  admin_supreme: 'Admin Suprême',
};

const TABS = [
  { value: 'profil', label: 'Profil' },
  { value: 'publications', label: 'Publications' },
  { value: 'crédits', label: 'Crédits' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'messages', label: 'Messages' },
];

// Portage exact de frontend/src/pages/UserDashboard.jsx
export default function UserDashboardScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [boutique, setBoutique] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(null);
  const [tab, setTab] = useState('profil');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadBoutiqueMessagesCount, setUnreadBoutiqueMessagesCount] = useState(0);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchAll = async () => {
    try {
      await refreshUser();
      const [prodRes, locRes, annRes, boutRes, notifRes, histRes, messagesRes, boutiqueMessagesRes] = await Promise.all([
        api.get('/products', { params: { mine: 'true' } }),
        api.get('/locations', { params: { mine: 'true' } }),
        api.get('/announcements', { params: { mine: 'true' } }),
        api.get('/boutiques/my-boutique').catch(() => ({ data: null })),
        api.get('/notifications'),
        api.get('/credits/my-history'),
        api.get('/messages/my-messages').catch(() => ({ data: { unreadCount: 0 } })),
        api.get('/boutique-messages/user-boutique-messages').catch(() => ({ data: { unreadCount: 0 } })),
      ]);
      setProducts(prodRes.data);
      setLocations(locRes.data);
      setAnnouncements(annRes.data);
      setBoutique(boutRes.data?.boutique || boutRes.data || null);
      setNotifications(notifRes.data);
      setHistory(histRes.data);
      setUnreadMessagesCount(messagesRes.data.unreadCount || 0);
      setUnreadBoutiqueMessagesCount(boutiqueMessagesRes.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const handleDelete = (type, id) => {
    Alert.alert('', 'Supprimer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/${type}/${id}`);
          fetchAll();
        } catch (err) { console.error(err); }
      } },
    ]);
  };

  const toggleItemDisponibilite = async (type, id) => {
    try {
      setUpdatingItemId(id);
      await api.put(`/${type}/${id}/disponibilite`);
      if (type === 'products') setProducts((prev) => prev.map((p) => p._id === id ? { ...p, disponible: !p.disponible } : p));
      else if (type === 'locations') setLocations((prev) => prev.map((l) => l._id === id ? { ...l, disponible: !l.disponible } : l));
      else if (type === 'announcements') setAnnouncements((prev) => prev.map((a) => a._id === id ? { ...a, disponible: !a.disponible } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Accueil', { screen: 'Home' });
  };

  const renderItem = (item, type) => (
    <View key={item._id} style={[styles.itemRow, { opacity: item.disponible ? 1 : 0.6 }]}>
      <View>
        <Text style={styles.itemTitle}>{item.titre}</Text>
        <Text style={styles.itemPrice}>
          {Number(item.prix ?? item.salaireMensuel ?? 0).toLocaleString('fr-FR')} GNF
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable
          disabled={updatingItemId === item._id}
          onPress={() => toggleItemDisponibilite(type, item._id)}
          style={[styles.dispoBtn, { backgroundColor: item.disponible ? '#059669' : '#ef4444', opacity: updatingItemId === item._id ? 0.6 : 1 }]}
        >
          {item.disponible ? <Check size={14} color="#fff" /> : <X size={14} color="#fff" />}
          <Text style={styles.dispoText}>{item.disponible ? 'Dispo' : 'Indispo'}</Text>
        </Pressable>
        <Button title="🗑" size="sm" variant="danger" onPress={() => handleDelete(type, item._id)} />
      </View>
    </View>
  );

  return (
    <Screen>
      <Text style={styles.pageTitle}>Mon Compte</Text>
      <Tabs
        tabs={TABS.map((t) => ({
          ...t,
          label: t.value === 'messages' && unreadMessagesCount + unreadBoutiqueMessagesCount > 0
            ? `Messages (${unreadMessagesCount + unreadBoutiqueMessagesCount})`
            : t.label,
        }))}
        active={tab}
        onChange={setTab}
      />

      {tab === 'profil' && (
        <View>
          <Card style={styles.profileCard}>
            <Text style={styles.name}>{user?.nom}</Text>
            <Text style={styles.phone}>☎️ {user?.telephone}</Text>
            <View style={styles.badgeRow}>
              <Badge variant="primary">{roleLabels[user?.role]}</Badge>
              {user?.isVerified ? <Badge variant="success">✔️ Vérifié</Badge> : null}
            </View>
            <Text style={styles.credits}>💵 {user?.credits} crédits</Text>
            {user?.creditExpiry ? (
              <Text style={styles.expiry}>Expire le {new Date(user.creditExpiry).toLocaleDateString('fr-FR')}</Text>
            ) : null}
          </Card>

          <Button title="Acheter des crédits" block style={{ marginBottom: 8 }} onPress={() => navigation.navigate('BuyCredits')} />
          <Button title="📦 Mes commandes" variant="secondary" block style={{ marginBottom: 8 }} onPress={() => navigation.navigate('MesCommandes')} />
          <Button title="🔐 Modifier le mot de passe" variant="secondary" block style={{ marginBottom: 8 }} onPress={() => navigation.navigate('ChangePassword')} />
          <Button title="Déconnexion" variant="danger" block style={{ marginBottom: 8 }} onPress={handleLogout} />
          {boutique ? (
            <>
              <Button title="Renouveler mon abonnement" variant="secondary" block style={{ marginBottom: 8 }} onPress={() => navigation.navigate('RenewSubscription')} />
              <Pressable onPress={() => navigation.navigate('MaBoutique', { screen: 'MyBoutique' })}>
                <Card style={styles.boutiqueCard}>
                  <View style={styles.boutiqueTitleRow}>
                    <ShoppingBag size={16} color={colors.primary} />
                    <Text style={styles.boutiqueTitle}>Ma Boutique: {boutique.nom}</Text>
                  </View>
                  <View style={{ marginTop: 6 }}>
                    <Badge variant={boutique.isActive ? 'success' : 'danger'}>{boutique.isActive ? 'Active' : 'Inactive'}</Badge>
                  </View>
                  {boutique.dateExpiration ? (
                    <Text style={styles.expiry}>Expire le {new Date(boutique.dateExpiration).toLocaleDateString('fr-FR')}</Text>
                  ) : null}
                </Card>
              </Pressable>
            </>
          ) : null}
        </View>
      )}

      {tab === 'publications' && (
        <View>
          <Text style={styles.sectionTitle}>Mes produits ({products.length})</Text>
          {products.map((p) => renderItem(p, 'products'))}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Mes locations ({locations.length})</Text>
          {locations.map((l) => renderItem(l, 'locations'))}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Mes annonces ({announcements.length})</Text>
          {announcements.map((a) => renderItem(a, 'announcements'))}
        </View>
      )}

      {tab === 'crédits' && (
        <View>
          <Card style={[styles.profileCard, { alignItems: 'center' }]}>
            <Text style={styles.creditsBig}>{user?.credits}</Text>
            <Text style={styles.creditsLabel}>crédits disponibles</Text>
          </Card>
          <Button title="Acheter des crédits" block style={{ marginBottom: 14 }} onPress={() => navigation.navigate('BuyCredits')} />
          {history && (
            <>
              <Text style={styles.sectionTitle}>Demandes de crédits</Text>
              {history.requests.map((r, i) => (
                <Card key={i} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyText}>{r.montant} GNF</Text>
                    <Badge variant={r.statut === 'approuvé' ? 'success' : r.statut === 'rejeté' ? 'danger' : 'warning'}>{r.statut}</Badge>
                  </View>
                  <Text style={styles.historyDate}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</Text>
                </Card>
              ))}
              <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Contacts débloqués</Text>
              {history.unlocks.map((u, i) => (
                <Card key={i} style={styles.historyCard}>
                  <Text style={styles.historyText}>{u.typeContenu} - {u.creditsDepenses} crédit</Text>
                  <Text style={styles.historyDate}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</Text>
                </Card>
              ))}
            </>
          )}
        </View>
      )}

      {tab === 'notifications' && (
        <View>
          {notifications.length === 0 ? (
            <EmptyState text="Aucune notification" />
          ) : (
            notifications.map((n) => (
              <Card key={n._id} style={[styles.notifCard, { opacity: n.lu ? 0.6 : 1, borderLeftWidth: n.lu ? 0 : 3, borderLeftColor: colors.primary }]}>
                <Text style={styles.notifText}>{n.message}</Text>
                <Text style={styles.historyDate}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</Text>
              </Card>
            ))
          )}
        </View>
      )}

      {tab === 'messages' && (
        <View>
          <View style={styles.messagesHeader}>
            <Button title="✎ Écrire aux administrateurs" style={{ flex: 1 }} onPress={() => navigation.navigate('SendMessageToAdmins')} />
            <Button title="🔄" variant="secondary" onPress={fetchAll} />
          </View>
          <UserMessagesList />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  profileCard: { padding: 14, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  phone: { fontSize: 13, color: colors.textLight, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  credits: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 8 },
  expiry: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  boutiqueCard: { padding: 14, marginBottom: 12 },
  boutiqueTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boutiqueTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
  itemTitle: { fontSize: 13, fontWeight: '600' },
  itemPrice: { fontSize: 11, color: colors.textLight },
  itemActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dispoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
  dispoText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  creditsBig: { fontSize: 28, fontWeight: '700', color: colors.primary },
  creditsLabel: { fontSize: 12, color: colors.textLight },
  historyCard: { padding: 10, marginBottom: 6 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyText: { fontSize: 12 },
  historyDate: { fontSize: 10, color: '#9ca3af' },
  notifCard: { padding: 10, marginBottom: 6 },
  notifText: { fontSize: 13 },
  messagesHeader: { flexDirection: 'row', gap: 8, marginBottom: 16 },
});
