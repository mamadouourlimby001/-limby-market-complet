import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Linking, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Check, Wrench, Plus } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Badge, Button, Card, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function ServiceDetailScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/services/${id}`);
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!data) return <EmptyState text="Service introuvable" />;

  const { service, posts } = data;
  const isOwner = user && service.proprietaire?._id === user._id;
  const waUrl = `https://wa.me/${(service.telephone || '').replace(/\D/g, '')}`;

  return (
    <Screen>
      <View style={styles.header}>
        {service.photo
          ? <Image source={{ uri: service.photo }} style={styles.photo} resizeMode="cover" />
          : <View style={[styles.photo, styles.photoPlaceholder]}><Wrench size={32} color={colors.textLight} /></View>
        }
        <View style={styles.nameRow}>
          <Text style={styles.name}>{service.nom}</Text>
          {service.isVerified ? <Check size={16} color={colors.accent} /> : null}
        </View>
        {service.isCertified ? (
          <View style={styles.certified}><Text style={styles.certifiedText}>⭐ Certifié</Text></View>
        ) : null}
        <Badge variant="primary">{service.metier}</Badge>
        <View style={styles.metaRow}>
          <MapPin size={12} color={colors.textLight} />
          <Text style={styles.meta}>{service.quartier}, {service.ville}</Text>
        </View>
        <Text style={styles.description}>{service.description}</Text>

        {isOwner ? (
          <Button
            title="+ Ajouter une publication"
            leftIcon={<Plus size={16} color="#fff" />}
            block
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('MonProfilService', { screen: 'AddServicePost', params: { id } })}
          />
        ) : null}

        <Pressable style={styles.whatsapp} onPress={() => Linking.openURL(waUrl)}>
          <WhatsAppIcon size={17} />
          <Text style={styles.whatsappText}>Contacter par WhatsApp</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Publications ({posts.length})</Text>
      {posts.length === 0 ? (
        <EmptyState icon={<Wrench size={32} color={colors.textLight} />} text="Aucune publication pour le moment" />
      ) : (
        <View style={styles.grid}>
          {posts.map((p) => (
            <View key={p._id} style={styles.gridItem}>
              <Pressable onPress={() => navigation.navigate('ServicePostDetail', { serviceId: id, postId: p._id })}>
                <Card style={{ overflow: 'hidden' }}>
                  {p.photos?.length > 0
                    ? <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                    : <View style={{ width: '100%', height: 110, backgroundColor: '#f0f0f0' }} />
                  }
                  <View style={{ padding: 8 }}>
                    <Text style={styles.postTitle} numberOfLines={1}>{p.titre}</Text>
                    <Text style={styles.postDescription} numberOfLines={2}>{p.description}</Text>
                  </View>
                </Card>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', padding: 4, marginBottom: 20 },
  photo: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.primary, marginBottom: 10 },
  photoPlaceholder: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  name: { fontSize: 18, fontWeight: '700' },
  certified: { backgroundColor: '#d1fae5', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, marginBottom: 6 },
  certifiedText: { fontSize: 11, fontWeight: '600', color: '#059669' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  meta: { fontSize: 12, color: colors.textLight },
  description: { fontSize: 13, color: colors.text, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  whatsapp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20, marginTop: 16, backgroundColor: '#25D366', borderRadius: 12, elevation: 3, shadowColor: '#25D366', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  whatsappText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  gridItem: { width: '47%', position: 'relative' },
  postTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  postDescription: { fontSize: 12, color: colors.textLight },
});
