import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminVisites() {
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchVisites = async () => {
    try {
      const res = await api.get('/admin/visites');
      setVisites(res.data.visites || res.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchVisites().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisites();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmer', 'Supprimer cette visite ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeleting(id);
          try {
            await api.delete(`/admin/visites/${id}`);
            setVisites(prev => prev.filter(v => v._id !== id));
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
        <Text style={styles.title}>Visites 24h</Text>
        <TouchableOpacity onPress={() => router.push('/admin/visites/bilan-trafic')}>
          <Ionicons name="bar-chart-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.countBanner}>
        <Ionicons name="people-outline" size={18} color={Colors.primary} />
        <Text style={styles.countText}>
          {visites.length} visiteur{visites.length > 1 ? 's' : ''} au total
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {visites.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="eye-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune visite enregistrée</Text>
          </View>
        ) : (
          visites.map(v => (
            <View key={v._id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitorName}>{v.nom}</Text>
                  <Text style={styles.visitorPhone}>
                    <Ionicons name="call-outline" size={11} color={Colors.textMuted} /> {v.telephone}
                  </Text>
                  <Text style={styles.visitorLocation}>
                    <Ionicons name="location-outline" size={11} color={Colors.textMuted} /> {v.ville || '-'}, {v.region || '-'}, {v.pays || '-'}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statItem}>
                      <Ionicons name="globe-outline" size={11} color={Colors.textMuted} /> {v.nombrePages} pages
                    </Text>
                    <Text style={styles.statItem}>
                      <Ionicons name="time-outline" size={11} color={Colors.textMuted} /> {Math.round(v.dureeTotale / 60)}m
                    </Text>
                    <Text style={styles.statItem}>
                      {new Date(v.dateDebut).toLocaleDateString('fr-GN')} {new Date(v.dateDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnPrimary]}
                  onPress={() => router.push(`/admin/visites/${v._id}`)}
                >
                  <Ionicons name="eye-outline" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Détails</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnDanger, deleting === v._id && styles.btnDisabled]}
                  onPress={() => handleDelete(v._id)}
                  disabled={deleting === v._id}
                >
                  <Ionicons name="trash-outline" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>
                    {deleting === v._id ? '...' : 'Supprimer'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  countBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  countText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardRow: { marginBottom: 10 },
  visitorName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  visitorPhone: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  visitorLocation: { fontSize: 11, color: Colors.textMuted, marginBottom: 6 },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statItem: { fontSize: 11, color: Colors.textMuted },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 6,
  },
  actionBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnDanger: { backgroundColor: Colors.danger },
  btnDisabled: { opacity: 0.5 },
});
