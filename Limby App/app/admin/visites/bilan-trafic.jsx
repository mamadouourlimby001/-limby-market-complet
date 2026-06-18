import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';

export default function BilanTrafic() {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());

  const fetchBilans = async () => {
    try {
      const res = await api.get('/admin/traffic-summary');
      setBilans(res.data.bilans || res.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchBilans().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBilans();
    setRefreshing(false);
  };

  const toggleSelectForDelete = (date) => {
    const newSet = new Set(selectedForDelete);
    newSet.has(date) ? newSet.delete(date) : newSet.add(date);
    setSelectedForDelete(newSet);
  };

  const handleDeleteBilan = (bilanDate) => {
    Alert.alert('Confirmer', 'Supprimer ce bilan ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeleting(bilanDate);
          try {
            await api.post('/admin/traffic-summary/delete', { date: bilanDate });
            setBilans(prev => prev.filter(b => b.date !== bilanDate));
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeleting(null);
          }
        }
      }
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert('Attention', 'Supprimer TOUS les bilans ? Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer tout', style: 'destructive', onPress: async () => {
          setDeleting('all');
          try {
            for (const b of bilans) {
              await api.post('/admin/traffic-summary/delete', { date: b.date });
            }
            setBilans([]);
            setShowDeleteModal(false);
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeleting(null);
          }
        }
      }
    ]);
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un bilan');
      return;
    }
    Alert.alert('Confirmer', `Supprimer ${selectedForDelete.size} bilan(s) ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeleting('selected');
          try {
            for (const date of selectedForDelete) {
              await api.post('/admin/traffic-summary/delete', { date });
            }
            setBilans(prev => prev.filter(b => !selectedForDelete.has(b.date)));
            setSelectedForDelete(new Set());
            setShowDeleteModal(false);
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeleting(null);
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bilan du trafic</Text>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {bilans.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun bilan disponible</Text>
          </View>
        ) : (
          bilans.map((bilan, idx) => (
            <View key={idx} style={styles.bilanCard}>
              <View style={styles.bilanHeader}>
                <View>
                  <Text style={styles.bilanDate}>{bilan.date}</Text>
                  <Text style={styles.bilanPeriode}>Période: {bilan.dateDebut} → {bilan.dateFin}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteBtn, deleting === bilan.date && styles.deleteBtnDisabled]}
                  onPress={() => handleDeleteBilan(bilan.date)}
                  disabled={!!deleting}
                >
                  <Ionicons name="trash-outline" size={14} color={Colors.white} />
                  <Text style={styles.deleteBtnText}>{deleting === bilan.date ? '...' : 'Suppr.'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>CONNEXIONS</Text>
                  <Text style={styles.statValue}>{bilan.totalConnexions}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>UNIQUES</Text>
                  <Text style={[styles.statValue, { color: Colors.success }]}>{bilan.utilisateursUniques}</Text>
                </View>
              </View>

              {bilan.parRegion?.length > 0 && (
                <View style={styles.tableSection}>
                  <Text style={styles.tableTitle}>Par région</Text>
                  {bilan.parRegion.map((r, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{r.nom || '-'}</Text>
                      <Text style={styles.tableCellRight}>{r.connexions}</Text>
                      <Text style={styles.tableCellMuted}>
                        {bilan.totalConnexions > 0 ? ((r.connexions / bilan.totalConnexions) * 100).toFixed(1) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {bilan.parVille?.length > 0 && (
                <View style={styles.tableSection}>
                  <Text style={styles.tableTitle}>Par ville</Text>
                  {bilan.parVille.map((v, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{v.nom || '-'}</Text>
                      <Text style={styles.tableCellMuted}>{v.region || '-'}</Text>
                      <Text style={styles.tableCellRight}>{v.connexions}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Supprimer les bilans</Text>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: Colors.danger }]}
              onPress={handleDeleteAll}
              disabled={!!deleting}
            >
              <Text style={styles.modalBtnText}>Supprimer tous les bilans</Text>
            </TouchableOpacity>

            <Text style={styles.modalOrText}>OU sélectionnez des bilans :</Text>

            <ScrollView style={styles.checkList}>
              {bilans.map(b => (
                <TouchableOpacity
                  key={b.date}
                  style={styles.checkItem}
                  onPress={() => toggleSelectForDelete(b.date)}
                >
                  <Ionicons
                    name={selectedForDelete.has(b.date) ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selectedForDelete.has(b.date) ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={styles.checkItemText}>{b.date} - {b.totalConnexions} connexions</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: selectedForDelete.size === 0 ? '#d1d5db' : Colors.danger }]}
              onPress={handleDeleteSelected}
              disabled={selectedForDelete.size === 0 || !!deleting}
            >
              <Text style={styles.modalBtnText}>
                Supprimer {selectedForDelete.size} sélectionné(s)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#e5e7eb' }]}
              onPress={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }}
            >
              <Text style={[styles.modalBtnText, { color: Colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  bilanCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  bilanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  bilanDate: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  bilanPeriode: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.danger, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6,
  },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteBtnText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 10, alignItems: 'center' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  tableSection: { marginTop: 8 },
  tableTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tableCell: { fontSize: 12, color: Colors.text, flex: 1 },
  tableCellRight: { fontSize: 12, color: Colors.text, fontWeight: '700' },
  tableCellMuted: { fontSize: 12, color: Colors.textMuted, width: 40, textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 16 },
  modalBtn: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  modalBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  modalOrText: { fontSize: 13, color: Colors.textMuted, marginVertical: 8 },
  checkList: { maxHeight: 200, marginBottom: 8 },
  checkItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checkItemText: { fontSize: 13, color: Colors.text },
});
