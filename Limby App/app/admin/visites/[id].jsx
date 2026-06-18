import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';

export default function AdminVisiteDetails() {
  const { id } = useLocalSearchParams();
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/visites/${id}`);
        setVisite(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Confirmer', 'Supprimer cette visite ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/admin/visites/${id}`);
            router.replace('/admin/visites');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            setDeleting(false);
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
        <Text style={styles.title}>Détails de la visite</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : !visite ? (
          <View style={styles.empty}><Text style={styles.emptyText}>Visite introuvable</Text></View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>VISITEUR</Text>
              <Text style={styles.visitorName}>{visite.nom}</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>CONTACT</Text>
                  <Text style={styles.infoValue}>{visite.telephone}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>PAGES VISITÉES</Text>
                  <Text style={styles.infoValue}>{visite.pagesVisitees?.length || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>LOCALISATION</Text>
                  <Text style={styles.infoValue}>
                    {visite.ville || '-'}, {visite.region || '-'}, {visite.pays || '-'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>DATE DÉBUT</Text>
                  <Text style={styles.infoValue}>
                    {new Date(visite.dateDebut).toLocaleDateString('fr-GN')} à {new Date(visite.dateDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <Text style={styles.infoLabel}>DURÉE TOTALE</Text>
              <Text style={styles.durationValue}>
                {Math.floor(visite.dureeTotale / 3600)}h {Math.floor((visite.dureeTotale % 3600) / 60)}m {visite.dureeTotale % 60}s
              </Text>

              <TouchableOpacity
                style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.white} />
                <Text style={styles.deleteBtnText}>
                  {deleting ? 'Suppression...' : 'Supprimer cette visite'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pagesTitle}>Pages visitées</Text>

            {!visite.pagesVisitees?.length ? (
              <View style={styles.empty}><Text style={styles.emptyText}>Aucune page visitée</Text></View>
            ) : (
              visite.pagesVisitees.map((page, idx) => (
                <View key={idx} style={styles.pageCard}>
                  <View style={styles.pageRow}>
                    <Ionicons name="globe-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.pageName} numberOfLines={2}>{page.page}</Text>
                  </View>
                  <View style={styles.pageStats}>
                    <Text style={styles.pageStat}>
                      Arrivée: {page.tempsDebut ? new Date(page.tempsDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                    </Text>
                    <Text style={styles.pageStat}>
                      Départ: {page.tempsFin ? new Date(page.tempsFin).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                    </Text>
                    <Text style={styles.pageStat}>
                      Durée: {page.duree ? Math.round(page.duree) + 's' : '-'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
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
  errorBox: { margin: 16, backgroundColor: '#fee2e2', borderRadius: 8, padding: 12 },
  errorText: { color: Colors.danger, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  infoCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    margin: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '700', marginBottom: 2 },
  visitorName: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 14 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  infoItem: { width: '47%' },
  infoLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', marginBottom: 2, marginTop: 6 },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.text },
  durationValue: { fontSize: 20, fontWeight: '800', color: Colors.success, marginBottom: 14 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.danger, borderRadius: 8, padding: 10,
  },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  pagesTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginHorizontal: 12, marginBottom: 8 },
  pageCard: {
    backgroundColor: Colors.card, borderRadius: 10,
    marginHorizontal: 12, marginBottom: 8, padding: 12,
  },
  pageRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  pageName: { fontSize: 12, color: Colors.text, flex: 1 },
  pageStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pageStat: { fontSize: 11, color: Colors.textMuted },
});
