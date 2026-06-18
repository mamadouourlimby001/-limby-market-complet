import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function BoutiqueVisitesScreen() {
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const fetchData = async () => {
    try {
      const boutRes = await api.get('/boutiques/my-boutique');
      const id = boutRes.data.boutique?._id || boutRes.data._id;
      setBoutiqueId(id);
      if (id) {
        const res = await api.get(`/boutiques/${id}/visits`);
        setBilans(res.data.bilans || res.data || []);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDeleteBilan = (bilanDate) => {
    Alert.alert('Supprimer', 'Supprimer ce bilan de visite ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(bilanDate);
          try {
            await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilanDate });
            setBilans(prev => prev.filter(b => b.date !== bilanDate));
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const handleDeleteAll = async () => {
    setDeleting('all');
    try {
      for (const bilan of bilans) {
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilan.date });
      }
      setBilans([]);
      setShowModal(false);
      Alert.alert('Succes', 'Tous les bilans ont ete supprimes');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) {
      Alert.alert('Info', 'Selectionnez au moins un bilan');
      return;
    }
    setDeleting('selected');
    try {
      for (const date of selected) {
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date });
      }
      setBilans(prev => prev.filter(b => !selected.has(b.date)));
      setSelected(new Set());
      setShowModal(false);
      Alert.alert('Succes', 'Bilans supprimes avec succes');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (date) => {
    const s = new Set(selected);
    if (s.has(date)) {
      s.delete(date);
    } else {
      s.add(date);
    }
    setSelected(s);
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
        <Text style={styles.title}>Visites de ma boutique</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Supprimer les bilans</Text>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnRed, deleting === 'all' && styles.btnDisabled]}
              onPress={handleDeleteAll}
              disabled={!!deleting}
            >
              <Text style={styles.modalBtnText}>
                {deleting === 'all' ? 'Suppression...' : 'Supprimer tous les bilans'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalOrText}>OU selectionnez des bilans :</Text>

            <ScrollView style={styles.checkList}>
              {bilans.map(bilan => (
                <TouchableOpacity
                  key={bilan.date}
                  style={styles.checkRow}
                  onPress={() => toggleSelect(bilan.date)}
                >
                  <View style={[styles.checkbox, selected.has(bilan.date) && styles.checkboxChecked]}>
                    {selected.has(bilan.date) && (
                      <Ionicons name="checkmark" size={12} color={Colors.white} />
                    )}
                  </View>
                  <Text style={styles.checkLabel}>
                    {bilan.date} - {bilan.totalVisites} visite(s)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.modalBtnRed,
                (deleting === 'selected' || selected.size === 0) && styles.btnDisabled,
              ]}
              onPress={handleDeleteSelected}
              disabled={!!deleting || selected.size === 0}
            >
              <Text style={styles.modalBtnText}>
                {deleting === 'selected'
                  ? 'Suppression...'
                  : 'Supprimer (' + selected.size + ') selectionne(s)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnGray]}
              onPress={() => {
                setShowModal(false);
                setSelected(new Set());
              }}
            >
              <Text style={[styles.modalBtnText, { color: Colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {bilans.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="eye-off-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune visite enregistree</Text>
          </View>
        ) : (
          bilans.map((bilan, idx) => (
            <View key={idx} style={styles.bilanCard}>
              <View style={styles.bilanHeader}>
                <View>
                  <Text style={styles.bilanDate}>{bilan.date}</Text>
                  <Text style={styles.bilanPeriod}>
                    {bilan.dateDebut} - {bilan.dateFin}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteBtn, deleting === bilan.date && styles.btnDisabled]}
                  onPress={() => handleDeleteBilan(bilan.date)}
                  disabled={deleting === bilan.date}
                >
                  {deleting === bilan.date ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Ionicons name="trash-outline" size={14} color={Colors.white} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>VISITES</Text>
                  <Text style={styles.statValue}>{bilan.totalVisites}</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxGreen]}>
                  <Text style={styles.statLabel}>UNIQUES</Text>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {bilan.visitantsUniques}
                  </Text>
                </View>
              </View>

              {bilan.parRegion && bilan.parRegion.length > 0 && (
                <View style={styles.tableSection}>
                  <Text style={styles.tableTitle}>Par region</Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableCellFlex]}>Region</Text>
                    <Text style={styles.tableCell}>Visites</Text>
                    <Text style={styles.tableCell}>%</Text>
                  </View>
                  {bilan.parRegion.map((r, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableCellFlex]}>{r.nom || '-'}</Text>
                      <Text style={[styles.tableCell, styles.tableCellBold]}>{r.visites}</Text>
                      <Text style={[styles.tableCell, styles.tableCellMuted]}>
                        {bilan.totalVisites > 0
                          ? ((r.visites / bilan.totalVisites) * 100).toFixed(1)
                          : 0}
                        %
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {bilan.parVille && bilan.parVille.length > 0 && (
                <View style={styles.tableSection}>
                  <Text style={styles.tableTitle}>Par ville</Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.tableCellFlex]}>Ville</Text>
                    <Text style={[styles.tableCell, styles.tableCellFlex]}>Region</Text>
                    <Text style={styles.tableCell}>Visites</Text>
                    <Text style={styles.tableCell}>%</Text>
                  </View>
                  {bilan.parVille.map((v, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableCellFlex]}>{v.nom || '-'}</Text>
                      <Text style={[styles.tableCell, styles.tableCellFlex]}>{v.region || '-'}</Text>
                      <Text style={[styles.tableCell, styles.tableCellBold]}>{v.visites}</Text>
                      <Text style={[styles.tableCell, styles.tableCellMuted]}>
                        {bilan.totalVisites > 0
                          ? ((v.visites / bilan.totalVisites) * 100).toFixed(1)
                          : 0}
                        %
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
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
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },

  bilanCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    margin: 12, marginBottom: 0, padding: 14,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  bilanHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  bilanDate: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  bilanPeriod: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  deleteBtn: {
    backgroundColor: Colors.danger, borderRadius: 6,
    padding: 8, minWidth: 36, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: '#f3f4f6',
    borderRadius: 8, padding: 10,
  },
  statBoxGreen: { backgroundColor: '#f0fdf4' },
  statLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.5, marginBottom: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },

  tableSection: { marginBottom: 12 },
  tableTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#f9fafb',
    paddingVertical: 6, paddingHorizontal: 4,
    borderBottomWidth: 2, borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tableCell: { fontSize: 12, color: Colors.text, minWidth: 50, paddingHorizontal: 2 },
  tableCellFlex: { flex: 1 },
  tableCellBold: { fontWeight: '700', textAlign: 'center' },
  tableCellMuted: { color: Colors.textMuted, textAlign: 'center' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, marginBottom: 14 },
  modalOrText: { fontSize: 13, color: Colors.textMuted, marginVertical: 10 },
  checkList: { maxHeight: 200, marginBottom: 10 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkLabel: { fontSize: 13, color: Colors.text, flex: 1 },
  modalBtn: {
    borderRadius: 8, paddingVertical: 12,
    alignItems: 'center', marginBottom: 8,
  },
  modalBtnRed: { backgroundColor: Colors.danger },
  modalBtnGray: { backgroundColor: '#e5e7eb' },
  modalBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
