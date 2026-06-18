import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, StyleSheet, RefreshControl, ActivityIndicator, Alert,
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

const STATUS_FLOW = ['en_attente', 'confirmée', 'livrée', 'annulée'];

export default function BoutiqueCommandesScreen() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchCommandes = async () => {
    try {
      const res = await api.get('/orders/boutique-orders');
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

  const handleUpdateStatus = async (commandeId, newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${commandeId}/status`, { status: newStatus, noteVendeur: note });
      setCommandes((prev) =>
        prev.map((c) => c._id === commandeId ? { ...c, status: newStatus, noteVendeur: note } : c)
      );
      setSelectedCommande(null);
      setNote('');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setUpdating(false);
    }
  };

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.en_attente;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedCommande(item);
          setNote(item.noteVendeur || '');
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.product?.titre || 'Produit'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <Text style={styles.buyerName}>👤 {item.buyer?.nom || 'Acheteur'}</Text>
        <Text style={styles.buyerPhone}>📞 {item.buyer?.telephone}</Text>
        <Text style={styles.price}>
          💰 {item.prixTotal?.toLocaleString('fr-FR')} GNF × {item.quantite}
        </Text>
        <Text style={styles.date}>
          📅 {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </Text>

        <Text style={styles.tapHint}>Appuyer pour gérer →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Commandes reçues</Text>
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
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Aucune commande reçue</Text>
            </View>
          }
        />
      )}

      {/* Update Status Modal */}
      <Modal
        visible={!!selectedCommande}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedCommande(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              Gérer la commande
            </Text>
            <Text style={styles.modalProduct}>
              {selectedCommande?.product?.titre}
            </Text>
            <Text style={styles.modalBuyer}>
              Acheteur : {selectedCommande?.buyer?.nom} — {selectedCommande?.buyer?.telephone}
            </Text>

            <Text style={styles.fieldLabel}>Note pour l'acheteur (optionnel)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Ex: Votre commande est prête..."
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Changer le statut</Text>
            <View style={styles.statusButtons}>
              {STATUS_FLOW.filter((s) => s !== selectedCommande?.status).map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                    onPress={() => handleUpdateStatus(selectedCommande._id, s)}
                    disabled={updating}
                  >
                    <Text style={[styles.statusBtnText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {updating && <ActivityIndicator color={Colors.primary} style={{ marginTop: 10 }} />}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedCommande(null)}
            >
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  buyerName: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  buyerPhone: { fontSize: 13, color: Colors.textLight },
  price: { fontSize: 14, fontWeight: '600', color: Colors.text },
  date: { fontSize: 12, color: Colors.textMuted },
  tapHint: { fontSize: 11, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 6 },
  modalProduct: { fontSize: 14, color: Colors.textLight, marginBottom: 4 },
  modalBuyer: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  noteInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBtnText: { fontWeight: '700', fontSize: 13 },
  closeBtn: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
});
