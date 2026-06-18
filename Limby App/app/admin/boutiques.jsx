import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminBoutiques() {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchBoutiques = async () => {
    try {
      const res = await api.get('/admin/boutiques');
      setBoutiques(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchBoutiques().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoutiques();
    setRefreshing(false);
  };

  const handleDelete = (id, nom) => {
    Alert.alert('Confirmer', `Supprimer la boutique "${nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setActionId(id);
          try {
            await api.delete(`/admin/boutiques/${id}`);
            setBoutiques(prev => prev.filter(b => b._id !== id));
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la suppression');
          } finally {
            setActionId(null);
          }
        }
      }
    ]);
  };

  const handleActivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/activate`);
      setBoutiques(prev => prev.map(b => b._id === id ? res.data.boutique : b));
      Alert.alert('Succès', 'Boutique activée pour 30 jours');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/deactivate`);
      setBoutiques(prev => prev.map(b => b._id === id ? res.data.boutique : b));
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setActionId(null);
    }
  };

  const handleCertify = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/certify`);
      setBoutiques(prev => prev.map(b => b._id === id ? res.data.boutique : b));
      Alert.alert('Succès', 'Boutique certifiée');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setActionId(null);
    }
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
        <Text style={styles.title}>Boutiques ({boutiques.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {boutiques.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune boutique</Text>
          </View>
        ) : (
          boutiques.map(b => (
            <View key={b._id} style={styles.card}>
              <View style={styles.cardTop}>
                {b.logo ? (
                  <Image source={{ uri: b.logo }} style={styles.logo} />
                ) : (
                  <View style={[styles.logo, styles.logoPlaceholder]}>
                    <Ionicons name="storefront-outline" size={24} color={Colors.textMuted} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.boutiqueName}>{b.nom}</Text>
                  {b.description ? (
                    <Text style={styles.boutiqueDesc} numberOfLines={2}>{b.description}</Text>
                  ) : null}
                  <Text style={styles.boutiqueLocation}>
                    📍 {b.quartier}, {b.ville}
                  </Text>
                  <Text style={styles.boutiqueOwner}>
                    👤 {b.proprietaire?.nom} ({b.proprietaire?.telephone})
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, b.isActive ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={[styles.statusText, b.isActive ? styles.textActive : styles.textInactive]}>
                        {b.isActive ? '✓ Active' : '✗ Inactive'}
                      </Text>
                    </View>
                    {b.isVerified && (
                      <View style={[styles.statusBadge, styles.badgeVerified]}>
                        <Text style={[styles.statusText, styles.textVerified]}>✓ Vérifiée</Text>
                      </View>
                    )}
                    {b.isCertified && (
                      <View style={[styles.statusBadge, styles.badgeCertified]}>
                        <Text style={[styles.statusText, styles.textCertified]}>⭐ Certifiée</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                  onPress={() => router.push(`/admin/boutiques/${b._id}`)}
                  disabled={actionId === b._id}
                >
                  <Ionicons name="bar-chart-outline" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Bilan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: b.isCertified ? '#94a3b8' : '#06b6d4' }]}
                  onPress={() => !b.isCertified && handleCertify(b._id)}
                  disabled={actionId === b._id || b.isCertified}
                >
                  <Text style={styles.actionBtnText}>{b.isCertified ? '✓ Certifiée' : '⭐ Certifier'}</Text>
                </TouchableOpacity>

                {b.isActive ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
                    onPress={() => handleDeactivate(b._id)}
                    disabled={actionId === b._id}
                  >
                    <Ionicons name="close-circle-outline" size={14} color={Colors.white} />
                    <Text style={styles.actionBtnText}>Désactiver</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                    onPress={() => handleActivate(b._id)}
                    disabled={actionId === b._id}
                  >
                    <Ionicons name="checkmark-circle-outline" size={14} color={Colors.white} />
                    <Text style={styles.actionBtnText}>Activer (30j)</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnFull, { backgroundColor: '#dc2626' }]}
                  onPress={() => handleDelete(b._id, b.nom)}
                  disabled={actionId === b._id}
                >
                  <Ionicons name="trash-outline" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Supprimer</Text>
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
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  logo: { width: 52, height: 52, borderRadius: 8, objectFit: 'cover' },
  logoPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.border },
  boutiqueName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  boutiqueDesc: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  boutiqueLocation: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  boutiqueOwner: { fontSize: 11, color: Colors.textMuted, marginBottom: 6 },
  statusRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },
  badgeActive: { backgroundColor: '#dcfce7' },
  textActive: { color: '#166534' },
  badgeInactive: { backgroundColor: '#fee2e2' },
  textInactive: { color: '#991b1b' },
  badgeVerified: { backgroundColor: '#dbeafe' },
  textVerified: { color: '#1e40af' },
  badgeCertified: { backgroundColor: '#fef3c7' },
  textCertified: { color: '#92400e' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 6, minWidth: '46%',
  },
  actionBtnFull: { flex: 2 },
  actionBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
});
