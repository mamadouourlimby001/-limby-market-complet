import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

const STATUS_CONFIG = {
  en_attente: { label: 'En attente', color: '#F39C12', bg: '#FFF9E6' },
  confirmée: { label: 'Confirmée', color: '#27AE60', bg: '#E8F8F5' },
  livrée: { label: 'Livrée', color: '#2980B9', bg: '#EBF5FB' },
  annulée: { label: 'Annulée', color: '#E74C3C', bg: '#FDEDEC' },
};

export default function MesCommandesScreen() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommandes = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setCommandes(res.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCommandes().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommandes();
    setRefreshing(false);
  };

  const handleCancel = (id) => {
    Alert.alert('Annuler la commande', 'Êtes-vous sûr ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/orders/${id}`);
            setCommandes((prev) =>
              prev.map((c) => c._id === id ? { ...c, status: 'annulée' } : c)
            );
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.en_attente;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.product?.titre || 'Produit supprimé'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <Text style={styles.boutiqueName}>
          🏪 {item.boutique?.nom || 'Boutique'}
        </Text>
        <Text style={styles.price}>
          💰 {item.prixTotal?.toLocaleString('fr-FR')} GNF × {item.quantite}
        </Text>
        <Text style={styles.date}>
          📅 {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </Text>

        {item.noteVendeur && (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Note du vendeur :</Text>
            <Text style={styles.noteText}>{item.noteVendeur}</Text>
          </View>
        )}

        {item.status === 'en_attente' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item._id)}
          >
            <Text style={styles.cancelBtnText}>Annuler la commande</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes commandes</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={commandes}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptyDesc}>
                Parcourez les boutiques pour passer votre première commande
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)/boutiques')}
              >
                <Text style={styles.browseBtnText}>Voir les boutiques</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  list: { padding: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  boutiqueName: { fontSize: 13, color: Colors.textLight },
  price: { fontSize: 14, fontWeight: '600', color: Colors.text },
  date: { fontSize: 12, color: Colors.textMuted },
  noteBox: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  noteLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  noteText: { fontSize: 13, color: Colors.text },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: { color: Colors.danger, fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyDesc: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  browseBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
