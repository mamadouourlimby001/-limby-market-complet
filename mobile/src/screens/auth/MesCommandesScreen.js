import { useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Package, Calendar, AlertCircle } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Button, Loader, EmptyState } from '../../components/ui';
import { colors, statusColors, statusLabels } from '../../theme/theme';

const FILTERS = ['all', 'en_attente', 'confirmée', 'livrée', 'annulée'];

// Portage exact de frontend/src/pages/MesCommandes.jsx
export default function MesCommandesScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const handleCancel = (orderId) => {
    Alert.alert('', 'Annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', onPress: async () => {
        try {
          await api.delete(`/orders/${orderId}`);
          await fetchOrders();
          Alert.alert('', 'Commande annulée');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur');
        }
      } },
    ]);
  };

  const handleDelete = (orderId) => {
    Alert.alert('', 'Supprimer définitivement cette commande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => {
        setIsDeletingId(orderId);
        try {
          await api.delete(`/orders/${orderId}/delete-permanently`);
          await fetchOrders();
          Alert.alert('', 'Commande supprimée');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur');
        } finally {
          setIsDeletingId(null);
        }
      } },
    ]);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Mes Commandes</Text>

      <View style={styles.filters}>
        {FILTERS.map((status) => (
          <Text
            key={status}
            onPress={() => setFilter(status)}
            style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
          >
            {status === 'all' ? 'Toutes' : statusLabels[status]}
          </Text>
        ))}
      </View>

      <Text style={styles.count}>
        {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
      </Text>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package size={32} color={colors.textLight} />}
          text="Aucune commande"
        />
      ) : (
        filteredOrders.map((order) => (
          <Card key={order._id} style={styles.card}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderTitle}>{order.product?.titre || 'Produit'}</Text>
                <Text style={styles.meta}><Text style={{ fontWeight: '700' }}>Boutique:</Text> {order.boutique?.nom}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#6b7280' }]}>
                <Text style={styles.statusText}>{statusLabels[order.status] || order.status}</Text>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Quantité</Text>
                <Text style={styles.gridValue}>{order.quantite}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Prix total</Text>
                <Text style={[styles.gridValue, { color: colors.success }]}>{order.prixTotal} GNF</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color={colors.textLight} />
                  <Text style={styles.gridValueSm}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Catégorie</Text>
                <Text style={styles.gridValueSm}>{order.product?.categorie}</Text>
              </View>
            </View>

            {order.noteVendeur ? (
              <View style={styles.noteBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertCircle size={14} color={colors.text} />
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>Note du vendeur</Text>
                </View>
                <Text style={{ color: '#4b5563', fontSize: 12 }}>{order.noteVendeur}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              {order.status === 'en_attente' && (
                <Button title="Annuler" variant="warning" style={{ flex: 1 }} onPress={() => handleCancel(order._id)} />
              )}
              <Button
                title={isDeletingId === order._id ? 'Suppression...' : 'Supprimer'}
                variant="danger"
                style={{ flex: 1 }}
                loading={isDeletingId === order._id}
                onPress={() => handleDelete(order._id)}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: colors.border, color: '#1f2937', fontSize: 13, fontWeight: '600', overflow: 'hidden' },
  filterBtnActive: { backgroundColor: colors.primary, color: '#fff' },
  count: { fontSize: 13, color: colors.textLight, marginBottom: 16 },
  card: { padding: 12, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  orderTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textLight },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  gridItem: { width: '50%', marginBottom: 8 },
  gridLabel: { color: colors.textLight, fontSize: 12, marginBottom: 4 },
  gridValue: { fontWeight: '700', fontSize: 12 },
  gridValueSm: { fontSize: 11 },
  noteBox: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.warning },
  actions: { flexDirection: 'row', gap: 8 },
});
