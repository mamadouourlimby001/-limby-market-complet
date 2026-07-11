import { useState, useCallback } from 'react';
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Wrench, Trash2, RefreshCw, Settings, Plus, Check } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, Card, Badge, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function MyServiceScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchService = async () => {
    try {
      const res = await api.get('/services/my-service');
      setData(res.data);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchService(); }, []));

  const deletePost = (postId) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette publication ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setDeletingId(postId);
        try {
          await api.delete(`/services/${data.service._id}/posts/${postId}`);
          await fetchService();
        } catch (err) {
          Alert.alert('', 'Erreur lors de la suppression de la publication');
        } finally {
          setDeletingId(null);
        }
      } },
    ]);
  };

  if (loading) return <Loader fullScreen />;

  if (!data) {
    return (
      <Screen center>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ marginBottom: 12 }}>Vous n'avez pas encore de profil de service</Text>
          <Button title="Proposer mes compétences" onPress={() => navigation.navigate('CreateService')} />
        </View>
      </Screen>
    );
  }

  const { service, posts } = data;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.photoWrap}>
          {service.photo
            ? <Image source={{ uri: service.photo }} style={styles.photo} />
            : <View style={[styles.photo, styles.photoPlaceholder]}><Wrench size={28} color={colors.textLight} /></View>
          }
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{service.nom}</Text>
          {service.isVerified ? <Check size={15} color={colors.accent} /> : null}
        </View>
        <Text style={styles.description}>{service.description}</Text>
        <Text style={styles.location}>{service.quartier}, {service.ville}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: service.isActive ? '#059669' : '#dc3545' }]}>
            <Text style={styles.statusBadgeText}>{service.isActive ? 'Actif' : 'Inactif'}</Text>
          </View>
          <Badge variant="primary">{service.metier}</Badge>
          {service.isCertified ? (
            <View style={styles.certifiedBadge}>
              <Text style={styles.certifiedText}>Service Certifié</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 8, marginBottom: 16 }}>
        <Button title="Renouveler mon abonnement" leftIcon={<RefreshCw size={16} color="#fff" />} block onPress={() => navigation.navigate('RenewServiceSubscription')} />
        <Button title="Modifier mon profil" leftIcon={<Settings size={16} color={colors.primary} />} variant="secondary" block onPress={() => navigation.navigate('CreateService')} />
        <Button title="+ Ajouter une publication" leftIcon={<Plus size={16} color={colors.primary} />} variant="secondary" block onPress={() => navigation.navigate('AddServicePost', { id: service._id })} />
      </View>

      <Text style={styles.sectionTitle}>Mes publications ({posts.length})</Text>

      {posts.length === 0 ? (
        <Text style={styles.emptyText}>Aucune publication. Montrez vos réalisations à vos futurs clients !</Text>
      ) : (
        <View style={styles.grid}>
          {posts.map((p) => (
            <View key={p._id} style={styles.gridItem}>
              <Pressable onPress={() => navigation.navigate('ServicePostDetail', { serviceId: service._id, postId: p._id })}>
                <Card style={{ overflow: 'hidden' }}>
                  {p.photos?.length > 0
                    ? <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                    : <View style={{ width: '100%', height: 110, backgroundColor: '#f0f0f0' }} />
                  }
                  <View style={{ padding: 8 }}>
                    <Text style={styles.postTitle} numberOfLines={1}>{p.titre}</Text>
                    <Text style={styles.postDescription} numberOfLines={2}>{p.description}</Text>
                    <Text style={styles.postPrice}>{Number(p.prix || 0).toLocaleString('fr-FR')} GNF</Text>
                  </View>
                </Card>
              </Pressable>
              <Pressable
                disabled={deletingId === p._id}
                style={[styles.deleteBtn, { opacity: deletingId === p._id ? 0.6 : 1 }]}
                onPress={() => deletePost(p._id)}
              >
                <Trash2 size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  photoWrap: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 8 },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '700' },
  description: { fontSize: 12, color: colors.textLight, marginBottom: 8, textAlign: 'center' },
  location: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  certifiedBadge: { backgroundColor: '#d1fae5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  certifiedText: { color: '#059669', fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: colors.textLight, paddingVertical: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  gridItem: { width: '47%', position: 'relative' },
  postTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  postDescription: { fontSize: 12, color: colors.textLight },
  postPrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
  deleteBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', borderRadius: 4, padding: 7 },
});
