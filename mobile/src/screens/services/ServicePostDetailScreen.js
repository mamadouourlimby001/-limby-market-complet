import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Linking, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wrench } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Card, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function ServicePostDetailScreen({ route }) {
  const { serviceId, postId } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${serviceId}`);
        const { service: serviceData, posts } = res.data;
        setService(serviceData);
        const p = posts.find((p) => p._id === postId);
        if (!p) setError('Publication non trouvée');
        else setPost(p);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement de la publication');
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId, postId]);

  if (loading) return <Loader fullScreen />;

  if (error || !post || !service) {
    return (
      <View style={styles.flexPad}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
        <Text style={styles.errorText}>{error || 'Publication non trouvée'}</Text>
      </View>
    );
  }

  const isOwner = user && service.proprietaire?._id === user._id;
  const waUrl = `https://wa.me/${(service.telephone || '').replace(/\D/g, '')}`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12 }}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={18} color={colors.primary} />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      <PhotoSlider photos={post.photos || []} height={320} />

      <View style={{ marginTop: 16, marginBottom: 16 }}>
        <Text style={styles.title}>{post.titre}</Text>
        <Text style={styles.created}>Publié le {new Date(post.createdAt).toLocaleDateString('fr-FR')}</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      <Card style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          {service.photo ? <Image source={{ uri: service.photo }} style={styles.serviceLogo} /> : null}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Wrench size={16} color={colors.text} />
              <Text style={styles.serviceName}>{service.nom}</Text>
            </View>
            {service.isVerified ? <Text style={styles.verified}>Vérifié</Text> : null}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          {service.metier ? (
            <Text style={styles.infoTextSm}><Text style={{ fontWeight: '700' }}>Métier:</Text> {service.metier}</Text>
          ) : null}
          {service.quartier && service.ville ? (
            <Text style={styles.infoTextSm}>{service.quartier}, {service.ville}</Text>
          ) : null}
        </View>
      </Card>

      {!isOwner ? (
        <Pressable style={styles.whatsappBtn} onPress={() => Linking.openURL(waUrl)}>
          <WhatsAppIcon size={18} color="#fff" />
          <Text style={styles.whatsappText}>Contacter par WhatsApp</Text>
        </Pressable>
      ) : (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerText}>C'est votre publication</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flexPad: { flex: 1, padding: 12, backgroundColor: colors.bg },
  errorText: { textAlign: 'center', color: colors.danger },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  created: { fontSize: 12, color: '#9ca3af' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 21 },
  serviceCard: { padding: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: colors.primary },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  serviceLogo: { width: 60, height: 60, borderRadius: 30 },
  serviceName: { fontSize: 14, fontWeight: '700' },
  verified: { fontSize: 11, color: colors.success, fontWeight: '600', marginTop: 2 },
  infoTextSm: { fontSize: 12, color: colors.text },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: '#25D366', borderRadius: 6 },
  whatsappText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ownerBox: { alignItems: 'center', padding: 20, backgroundColor: '#f3f4f6', borderRadius: 6 },
  ownerText: { fontSize: 14, color: colors.textLight },
});
