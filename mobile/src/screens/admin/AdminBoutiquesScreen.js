import { useState, useEffect } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trash2, CheckCircle, XCircle, BarChart3 } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminBoutiquesScreen() {
  const navigation = useNavigation();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchBoutiques = async () => {
    try {
      const res = await api.get('/admin/boutiques');
      setBoutiques(res.data);
    } catch (err) {
      Alert.alert('', 'Erreur lors de la récupération des boutiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoutiques(); }, []);

  const handleDelete = (id) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette boutique ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setActionId(id);
        try {
          await api.delete(`/admin/boutiques/${id}`);
          setBoutiques(boutiques.filter(b => b._id !== id));
          Alert.alert('', 'Boutique supprimée');
        } catch (err) {
          Alert.alert('', 'Erreur lors de la suppression');
        } finally {
          setActionId(null);
        }
      }},
    ]);
  };

  const handleActivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/activate`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      Alert.alert('', 'Boutique activée pour 30 jours');
    } catch (err) {
      Alert.alert('', "Erreur lors de l'activation");
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/deactivate`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      Alert.alert('', 'Boutique désactivée');
    } catch (err) {
      Alert.alert('', 'Erreur lors de la désactivation');
    } finally {
      setActionId(null);
    }
  };

  const handleCertify = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/certify`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      Alert.alert('', 'Boutique certifiée');
    } catch (err) {
      Alert.alert('', 'Erreur lors de la certification');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Boutiques ({boutiques.length})</Text>

      {boutiques.length === 0 ? (
        <EmptyState text="Aucune boutique" />
      ) : (
        boutiques.map(boutique => (
          <Card key={boutique._id} style={styles.card}>
            <View style={styles.infoRow}>
              {boutique.logo ? <Image source={{ uri: boutique.logo }} style={styles.logo} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{boutique.nom}</Text>
                <Text style={styles.desc} numberOfLines={2}>{boutique.description}</Text>
                <Text style={styles.meta}>📍 {boutique.quartier}, {boutique.ville}</Text>
                <Text style={styles.meta}>👤 {boutique.proprietaire?.nom} ({boutique.proprietaire?.telephone})</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.activeBadge, { backgroundColor: boutique.isActive ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.activeBadgeText, { color: boutique.isActive ? '#166534' : '#991b1b' }]}>
                      {boutique.isActive ? '✓ Active' : '✗ Inactive'}
                    </Text>
                  </View>
                  {boutique.isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Vérifiée</Text></View>}
                  {boutique.isCertified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Certifiée</Text></View>}
                </View>
              </View>
            </View>

            <View style={styles.btnGrid}>
              <Button
                title="Bilan"
                style={[styles.gridBtn, { backgroundColor: '#3b82f6' }]}
                onPress={() => navigation.navigate('AdminBoutiqueDetail', { id: boutique._id })}
                disabled={actionId === boutique._id}
              />
              <Button
                title={boutique.isCertified ? '✓ Certifiée' : '⭐ Certifier'}
                style={[styles.gridBtn, { backgroundColor: boutique.isCertified ? '#cbd5e1' : '#06b6d4' }]}
                disabled={actionId === boutique._id || boutique.isCertified}
                onPress={() => handleCertify(boutique._id)}
              />
              {boutique.isActive ? (
                <Button
                  title="Désactiver"
                  variant="danger"
                  style={styles.gridBtn}
                  disabled={actionId === boutique._id}
                  onPress={() => handleDeactivate(boutique._id)}
                />
              ) : (
                <Button
                  title="Activer (30j)"
                  variant="success"
                  style={styles.gridBtn}
                  disabled={actionId === boutique._id}
                  onPress={() => handleActivate(boutique._id)}
                />
              )}
              <Button
                title="Supprimer"
                variant="danger"
                style={[styles.gridBtn, { flex: 2 }]}
                disabled={actionId === boutique._id}
                onPress={() => handleDelete(boutique._id)}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  card: { padding: 12, marginBottom: 10 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  logo: { width: 50, height: 50, borderRadius: 6 },
  name: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  activeBadgeText: { fontSize: 10, fontWeight: '600' },
  verifiedBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  verifiedText: { fontSize: 10, fontWeight: '600', color: '#1e40af' },
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridBtn: { flex: 1 },
});
