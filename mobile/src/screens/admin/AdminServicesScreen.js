import { useState, useEffect } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { Trash2, CheckCircle, XCircle } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminServicesScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await api.get('/admin/services');
      setServices(res.data);
    } catch (err) {
      Alert.alert('', 'Erreur lors de la récupération des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = (id) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer ce service ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setActionId(id);
        try {
          await api.delete(`/admin/services/${id}`);
          setServices(services.filter(s => s._id !== id));
          Alert.alert('', 'Service supprimé');
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
      const res = await api.put(`/admin/services/${id}/activate`);
      setServices(services.map(s => s._id === id ? res.data.service : s));
      Alert.alert('', 'Service activé pour 30 jours');
    } catch (err) {
      Alert.alert('', "Erreur lors de l'activation");
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/services/${id}/deactivate`);
      setServices(services.map(s => s._id === id ? res.data.service : s));
      Alert.alert('', 'Service désactivé');
    } catch (err) {
      Alert.alert('', 'Erreur lors de la désactivation');
    } finally {
      setActionId(null);
    }
  };

  const handleCertify = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/services/${id}/certify`);
      setServices(services.map(s => s._id === id ? res.data.service : s));
      Alert.alert('', 'Service certifié');
    } catch (err) {
      Alert.alert('', 'Erreur lors de la certification');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Services ({services.length})</Text>

      {services.length === 0 ? (
        <EmptyState text="Aucun service" />
      ) : (
        services.map(service => (
          <Card key={service._id} style={styles.card}>
            <View style={styles.infoRow}>
              {service.photo ? <Image source={{ uri: service.photo }} style={styles.photo} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{service.nom}</Text>
                <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
                <Text style={styles.meta}>{service.metier}</Text>
                <Text style={styles.meta}>{service.quartier}, {service.ville}</Text>
                <Text style={styles.meta}>{service.proprietaire?.nom} ({service.proprietaire?.telephone})</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.activeBadge, { backgroundColor: service.isActive ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.activeBadgeText, { color: service.isActive ? '#166534' : '#991b1b' }]}>
                      {service.isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                  {service.isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Vérifié</Text></View>}
                  {service.isCertified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Certifié</Text></View>}
                </View>
              </View>
            </View>

            <View style={styles.btnGrid}>
              <Button
                title={service.isCertified ? 'Certifié' : '⭐ Certifier'}
                style={[styles.gridBtn, { backgroundColor: service.isCertified ? '#cbd5e1' : '#06b6d4' }]}
                disabled={actionId === service._id || service.isCertified}
                onPress={() => handleCertify(service._id)}
              />
              {service.isActive ? (
                <Button
                  title="Désactiver"
                  variant="danger"
                  style={styles.gridBtn}
                  disabled={actionId === service._id}
                  onPress={() => handleDeactivate(service._id)}
                />
              ) : (
                <Button
                  title="Activer (30j)"
                  variant="success"
                  style={styles.gridBtn}
                  disabled={actionId === service._id}
                  onPress={() => handleActivate(service._id)}
                />
              )}
              <Button
                title="Supprimer"
                variant="danger"
                style={[styles.gridBtn, { flex: 2 }]}
                disabled={actionId === service._id}
                onPress={() => handleDelete(service._id)}
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
  photo: { width: 50, height: 50, borderRadius: 25 },
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
