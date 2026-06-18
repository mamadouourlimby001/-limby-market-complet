import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Package, Phone, Calendar } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button } from '../../components/ui';
import { colors, statusColors, statusLabels } from '../../theme/theme';

const FILTERS = ['all', 'en_attente', 'confirmée', 'livrée', 'annulée'];

export default function ProduitsCommandesScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [noteText, setNoteText] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/boutique-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, noteVendeur: noteText[orderId] || '' });
      setNoteText(prev => ({ ...prev, [orderId]: '' }));
      await fetchOrders();
      Alert.alert('', 'Statut mis à jour');
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDelete = (orderId) => {
    Alert.alert('', 'Supprimer définitivement cette commande ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setIsDeletingId(orderId);
        try {
          await api.delete(`/orders/${orderId}/delete-permanently`);
          await fetchOrders();
          setExpandedId(null);
          Alert.alert('', 'Commande supprimée avec succès');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
          setIsDeletingId(null);
        }
      }},
    ]);
  };

  if (loading) return <Loader fullScreen />;

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <Screen>
      <Text style={styles.title}>Commandes Reçues</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Toutes' : statusLabels[f]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.count}>{filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}</Text>

      {filteredOrders.length === 0 ? (
        <EmptyState icon={<Package size={32} color={colors.textLight} />} text="Aucune commande" />
      ) : (
        filteredOrders.map(order => (
          <Card key={order._id} style={styles.card}>
            <Pressable
              onPress={() => setExpandedId(expandedId === order._id ? null : order._id)}
              style={styles.cardHeader}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{order.product?.titre || 'Produit'}</Text>
                <Text style={styles.buyerName}>Acheteur: {order.buyer?.nom}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#6b7280' }]}>
                  <Text style={styles.statusText}>{statusLabels[order.status] || order.status}</Text>
                </View>
                <Text style={styles.chevron}>{expandedId === order._id ? '▼' : '▶'}</Text>
              </View>
            </Pressable>

            <View style={styles.detailGrid}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Quantité</Text>
                <Text style={styles.detailValue}>{order.quantite}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Prix total</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>{order.prixTotal} GNF</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color={colors.textLight} />
                  <Text style={styles.detailSmall}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</Text>
                </View>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Catégorie</Text>
                <Text style={styles.detailSmall}>{order.product?.categorie}</Text>
              </View>
            </View>

            {order.noteAcheteur ? (
              <View style={styles.buyerNote}>
                <Text style={styles.noteTitle}>Note de l'acheteur</Text>
                <Text style={styles.noteText}>{order.noteAcheteur}</Text>
              </View>
            ) : null}

            {order.buyer?.telephone ? (
              <View style={styles.phoneRow}>
                <Phone size={14} color="#3b82f6" />
                <Text style={styles.phoneText}>{order.buyer.telephone}</Text>
              </View>
            ) : null}

            {expandedId === order._id && (
              <View style={styles.expanded}>
                <Text style={styles.expandedLabel}>Mettre à jour le statut:</Text>
                {['en_attente', 'confirmée', 'livrée', 'annulée'].map(s => (
                  <Pressable
                    key={s}
                    onPress={() => handleStatusUpdate(order._id, s)}
                    disabled={statusUpdating[order._id] || order.status === s}
                    style={[styles.statusBtn, order.status === s && styles.statusBtnActive]}
                  >
                    <Text style={[styles.statusBtnText, order.status === s && styles.statusBtnTextActive]}>
                      {statusUpdating[order._id] && order.status !== s ? 'Mise à jour...' : statusLabels[s]}
                    </Text>
                  </Pressable>
                ))}

                <Text style={[styles.expandedLabel, { marginTop: 12 }]}>Votre note au client:</Text>
                <TextInput
                  value={noteText[order._id] || ''}
                  onChangeText={v => setNoteText(prev => ({ ...prev, [order._id]: v }))}
                  placeholder="Optionnel: délai de livraison, conditions..."
                  multiline
                  numberOfLines={3}
                  style={styles.noteInput}
                />

                <Button
                  variant="danger"
                  title={isDeletingId === order._id ? 'Suppression en cours...' : 'Supprimer cette commande'}
                  block
                  loading={isDeletingId === order._id}
                  onPress={() => handleDelete(order._id)}
                  style={{ marginTop: 8 }}
                />
              </View>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  filterRow: { marginBottom: 10 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  filterTextActive: { color: '#fff' },
  count: { fontSize: 13, color: colors.textLight, marginBottom: 12 },
  card: { padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 },
  productTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  buyerName: { fontSize: 12, color: colors.textLight },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  chevron: { fontSize: 10, color: '#9ca3af' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  detailCell: { width: '50%', marginBottom: 8 },
  detailLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  detailValue: { fontSize: 13, fontWeight: '600' },
  detailSmall: { fontSize: 11 },
  buyerNote: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  noteTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  noteText: { fontSize: 12, color: '#4b5563' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, backgroundColor: '#f0f9ff', borderRadius: 4, marginBottom: 12 },
  phoneText: { fontSize: 12 },
  expanded: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  expandedLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  statusBtn: { padding: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', marginBottom: 6 },
  statusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  statusBtnTextActive: { color: '#fff' },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 8, fontSize: 12, minHeight: 60, textAlignVertical: 'top', marginBottom: 4 },
});
