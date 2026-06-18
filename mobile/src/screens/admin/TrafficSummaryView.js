import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import api from '../../services/api';
import { Card, Loader, EmptyState, Button, AlertBanner, CenterModal } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function TrafficSummaryView({ onClose }) {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/traffic-summary');
        setBilans(res.data.bilans || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du bilan');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSelect = (date) => {
    const next = new Set(selectedForDelete);
    next.has(date) ? next.delete(date) : next.add(date);
    setSelectedForDelete(next);
  };

  const handleDeleteAll = async () => {
    setDeleting('all');
    try {
      for (const bilan of bilans) {
        await api.post('/admin/traffic-summary/delete', { date: bilan.date });
      }
      setBilans([]);
      Alert.alert('', 'Tous les bilans ont été supprimés');
      setShowDeleteModal(false);
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) { Alert.alert('', 'Sélectionnez au moins un bilan'); return; }
    setDeleting('selected');
    try {
      for (const date of selectedForDelete) {
        await api.post('/admin/traffic-summary/delete', { date });
      }
      setBilans(bilans.filter(b => !selectedForDelete.has(b.date)));
      setSelectedForDelete(new Set());
      Alert.alert('', 'Bilans supprimés avec succès');
      setShowDeleteModal(false);
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 12 }}>
      <Button title="← Retour aux visites" variant="secondary" onPress={onClose} style={{ marginBottom: 12 }} />

      <View style={styles.header}>
        <Text style={styles.title}>Bilan du trafic</Text>
        <Pressable style={styles.deleteAllBtn} onPress={() => setShowDeleteModal(true)}>
          <Trash2 size={16} color="#fff" />
          <Text style={styles.deleteAllText}>Supprimer</Text>
        </Pressable>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      {bilans.length === 0 ? (
        <EmptyState text="Aucun bilan disponible" />
      ) : (
        bilans.map((bilan, index) => (
          <Card key={index} style={styles.bilanCard}>
            <View style={styles.bilanHeader}>
              <View>
                <Text style={styles.bilanDate}>{bilan.date}</Text>
                <Text style={styles.bilanPeriod}>Période: {bilan.dateDebut} à {bilan.dateFin}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VISITEURS</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{bilan.totalVisiteurs}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>PAGES VUES</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{bilan.totalPages}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>DURÉE MOY.</Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>{Math.round((bilan.dureeMoyenne || 0) / 60)}m</Text>
              </View>
            </View>

            {bilan.parRegion?.length > 0 && (
              <View style={styles.tableSection}>
                <Text style={styles.tableTitle}>Par région</Text>
                {bilan.parRegion.slice(0, 5).map((r, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.td}>{r.nom || '-'}</Text>
                    <Text style={[styles.td, { fontWeight: '600' }]}>{r.visites}</Text>
                    <Text style={[styles.td, { color: colors.textLight }]}>
                      {bilan.totalVisiteurs > 0 ? ((r.visites / bilan.totalVisiteurs) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))
      )}

      <CenterModal visible={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }}>
        <Text style={styles.modalTitle}>Supprimer les bilans</Text>
        <Button title={deleting === 'all' ? 'Suppression...' : 'Supprimer tous les bilans'} variant="danger" block loading={deleting === 'all'} onPress={handleDeleteAll} style={{ marginBottom: 12 }} />
        <Text style={styles.modalSub}>OU sélectionnez les bilans à supprimer:</Text>
        <ScrollView style={styles.checkList}>
          {bilans.map(bilan => (
            <Pressable key={bilan.date} onPress={() => toggleSelect(bilan.date)} style={styles.checkRow}>
              <View style={[styles.checkbox, selectedForDelete.has(bilan.date) && styles.checkboxChecked]} />
              <Text style={styles.checkLabel}>{bilan.date} - {bilan.totalVisiteurs} visiteur(s)</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Button title={deleting === 'selected' ? 'Suppression...' : `Supprimer ${selectedForDelete.size} bilan(s)`} variant="danger" block disabled={selectedForDelete.size === 0} loading={deleting === 'selected'} onPress={handleDeleteSelected} style={{ marginTop: 10 }} />
        <Button title="Annuler" variant="secondary" block onPress={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }} style={{ marginTop: 8 }} />
      </CenterModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  deleteAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  deleteAllText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  bilanCard: { padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: colors.primary },
  bilanHeader: { marginBottom: 12 },
  bilanDate: { fontSize: 15, fontWeight: '600', color: colors.primary },
  bilanPeriod: { fontSize: 12, color: colors.textLight },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#f3f4f6', padding: 10, borderRadius: 6, alignItems: 'center' },
  statLabel: { fontSize: 10, color: colors.textLight, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  tableSection: { marginTop: 8 },
  tableTitle: { fontSize: 13, fontWeight: '600', color: colors.primary, marginBottom: 6 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { fontSize: 12, flex: 1 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.primary, marginBottom: 16 },
  modalSub: { color: colors.textLight, marginBottom: 10, fontSize: 13 },
  checkList: { maxHeight: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 18, height: 18, borderWidth: 2, borderColor: colors.border, borderRadius: 3 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontSize: 13 },
});
