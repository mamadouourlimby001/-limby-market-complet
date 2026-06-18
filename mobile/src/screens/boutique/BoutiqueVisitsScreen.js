import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import api from '../../services/api';
import { Card, Loader, EmptyState, Button, AlertBanner, CenterModal } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function BoutiqueVisitsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { boutiqueId } = route.params;
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/boutiques/${boutiqueId}/visits`);
        setBilans(res.data.bilans || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des visites');
      } finally {
        setLoading(false);
      }
    })();
  }, [boutiqueId]);

  const toggleSelect = (date) => {
    const next = new Set(selectedForDelete);
    next.has(date) ? next.delete(date) : next.add(date);
    setSelectedForDelete(next);
  };

  const handleDeleteAll = async () => {
    setDeleting('all');
    try {
      for (const bilan of bilans) {
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilan.date });
      }
      setBilans([]);
      Alert.alert('', 'Tous les bilans de visite ont été supprimés');
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
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date });
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

  const handleDeleteBilan = (bilanDate) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer ce bilan ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setDeleting(bilanDate);
        try {
          await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilanDate });
          setBilans(bilans.filter(b => b.date !== bilanDate));
          Alert.alert('', 'Bilan supprimé avec succès');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
          setDeleting(null);
        }
      }},
    ]);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 12 }}>
      <Button title="← Retour" variant="secondary" style={styles.back} onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Visite de la boutique</Text>
        <Pressable style={styles.deleteAllBtn} onPress={() => setShowDeleteModal(true)}>
          <Trash2 size={16} color="#fff" />
          <Text style={styles.deleteAllText}>Supprimer</Text>
        </Pressable>
      </View>

      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}

      {bilans.length === 0 ? (
        <EmptyState text="Aucune visite enregistrée" />
      ) : (
        bilans.map((bilan, index) => (
          <Card key={index} style={styles.bilanCard}>
            <View style={styles.bilanHeader}>
              <View>
                <Text style={styles.bilanDate}>{bilan.date}</Text>
                <Text style={styles.bilanPeriod}>Période: {bilan.dateDebut} à {bilan.dateFin}</Text>
              </View>
              <Pressable
                onPress={() => handleDeleteBilan(bilan.date)}
                disabled={deleting === bilan.date}
                style={[styles.deleteBilanBtn, deleting === bilan.date && { opacity: 0.6 }]}
              >
                <Trash2 size={14} color="#fff" />
                <Text style={styles.deleteBilanText}>{deleting === bilan.date ? 'Suppression...' : 'Supprimer'}</Text>
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>NOMBRE DE VISITES</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{bilan.totalVisites}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VISITEURS UNIQUES</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{bilan.visitantsUniques}</Text>
              </View>
            </View>

            {bilan.parRegion?.length > 0 && (
              <View style={styles.tableSection}>
                <Text style={styles.tableTitle}>Visites par région</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Région</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Visites</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>%</Text>
                </View>
                {bilan.parRegion.map((r, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]}>{r.nom || '-'}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: '600' }]}>{r.visites}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', color: colors.textLight }]}>
                      {bilan.totalVisites > 0 ? ((r.visites / bilan.totalVisites) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {bilan.parVille?.length > 0 && (
              <View style={styles.tableSection}>
                <Text style={styles.tableTitle}>Visites par ville</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Ville</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Visites</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>%</Text>
                </View>
                {bilan.parVille.map((v, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2 }]}>{v.nom || '-'}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: '600' }]}>{v.visites}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', color: colors.textLight }]}>
                      {bilan.totalVisites > 0 ? ((v.visites / bilan.totalVisites) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))
      )}

      <CenterModal visible={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }}>
        <Text style={styles.modalTitle}>Supprimer les bilans de visite</Text>
        <Button
          title={deleting === 'all' ? 'Suppression...' : 'Supprimer tous les bilans'}
          variant="danger"
          block
          loading={deleting === 'all'}
          onPress={handleDeleteAll}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.modalSub}>OU sélectionnez les bilans à supprimer:</Text>
        <ScrollView style={styles.checkList}>
          {bilans.map(bilan => (
            <Pressable key={bilan.date} onPress={() => toggleSelect(bilan.date)} style={styles.checkRow}>
              <View style={[styles.checkbox, selectedForDelete.has(bilan.date) && styles.checkboxChecked]} />
              <Text style={styles.checkLabel}>{bilan.date} - {bilan.totalVisites} visite(s)</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Button
          title={deleting === 'selected' ? 'Suppression...' : `Supprimer ${selectedForDelete.size} bilan(s)`}
          variant="danger"
          block
          disabled={selectedForDelete.size === 0}
          loading={deleting === 'selected'}
          onPress={handleDeleteSelected}
          style={{ marginTop: 10 }}
        />
        <Button title="Annuler" variant="secondary" block onPress={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }} style={{ marginTop: 8 }} />
      </CenterModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  back: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  deleteAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  deleteAllText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  bilanCard: { padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: colors.primary },
  bilanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  bilanDate: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 4 },
  bilanPeriod: { fontSize: 13, color: colors.textLight },
  deleteBilanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  deleteBilanText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 6 },
  statLabel: { fontSize: 11, color: colors.textLight, fontWeight: '500', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700' },
  tableSection: { marginBottom: 12 },
  tableTitle: { fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.border, backgroundColor: '#f9fafb', paddingVertical: 6, paddingHorizontal: 4 },
  th: { fontSize: 12, fontWeight: '600' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 6, paddingHorizontal: 4 },
  td: { fontSize: 12 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.primary, marginBottom: 16 },
  modalSub: { color: colors.textLight, marginBottom: 10, fontSize: 13 },
  checkList: { maxHeight: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 18, height: 18, borderWidth: 2, borderColor: colors.border, borderRadius: 3 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontSize: 13 },
});
