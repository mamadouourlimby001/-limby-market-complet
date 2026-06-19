import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, Linking, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Check, Store } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import ReportButton from '../../components/ReportButton';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Badge, Button, Card, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/BoutiqueDetail.jsx (avec tracking de visite géolocalisé)
export default function BoutiqueDetailScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/boutiques/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!data || !user || data.boutique.proprietaire._id === user._id) return;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('gpsCoordinates');
        let visitData = {};
        if (cached) {
          const { latitude, longitude } = JSON.parse(cached);
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const addressData = await response.json();
          const address = addressData.address || {};
          visitData = {
            pays: address.country || null,
            region: address.state || address.province || null,
            ville: address.city || address.town || address.village || null,
          };
        }
        await api.post(`/boutiques/${id}/visit`, visitData);
      } catch (error) {
        console.log('Visite non enregistrée:', error);
      }
    })();
  }, [data, user, id]);

  if (loading) return <Loader fullScreen />;
  if (!data) return <EmptyState text="Boutique introuvable" />;

  const { boutique, products } = data;
  const isOwner = user && boutique.proprietaire?._id === user._id;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 12 }}>
      {boutique.logo
        ? <Image source={{ uri: boutique.logo }} style={styles.banner} resizeMode="contain" />
        : <View style={styles.bannerPlaceholder}><Store size={48} color={colors.textLight} /></View>
      }
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{boutique.nom}</Text>
          {boutique.isVerified ? <Check size={18} color={colors.accent} /> : null}
        </View>
        {boutique.isCertified ? (
          <View style={styles.certifiedBadge}>
            <Text style={styles.certifiedText}>Boutique Certifiée</Text>
          </View>
        ) : null}
        <Text style={styles.description}>{boutique.description}</Text>
        <View style={styles.metaRow}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.meta}>{boutique.quartier}, {boutique.ville}</Text>
        </View>
        <Text style={styles.phone}>☎️ {boutique.telephone}</Text>
        <Badge variant="primary">{boutique.categorie}</Badge>
      </View>

      {isOwner ? (
        <Button
          title="+ Ajouter un produit"
          block
          style={{ marginBottom: 14 }}
          onPress={() => navigation.navigate('MaBoutique', { screen: 'AddBoutiqueProduct', params: { id } })}
        />
      ) : (
        <Pressable
          style={styles.whatsappBtn}
          onPress={() => Linking.openURL(`https://wa.me/${(boutique.telephone || '').replace(/\D/g, '')}`)}
        >
          <WhatsAppIcon size={18} />
          <Text style={styles.whatsappText}>Contacter par WhatsApp</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Produits ({products.length})</Text>
      {products.length === 0 ? (
        <EmptyState icon={<Store size={32} color={colors.textLight} />} text="Aucun produit" />
      ) : (
        <View style={styles.grid}>
          {products.map((p) => (
            <Pressable
              key={p._id}
              style={styles.gridItem}
              onPress={() => navigation.navigate('ProductBoutiqueDetail', { boutiqueId: id, productId: p._id })}
            >
              <Card style={[styles.productCard, { opacity: p.disponible ? 1 : 0.6 }]}>
                {p.photos?.length > 0
                  ? <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                  : <View style={{ width: '100%', height: 110, backgroundColor: '#f0f0f0' }} />
                }
                <View style={{ padding: 8 }}>
                  <Text style={styles.productTitle} numberOfLines={1}>{p.titre}</Text>
                  <Text style={styles.productCategorie}>{p.categorie}</Text>
                  <Text style={styles.productPrice}>{Number(p.prix || 0).toLocaleString('fr-FR')} GNF</Text>
                </View>
              </Card>
              {!p.disponible && (
                <View style={styles.unavailableOverlay}>
                  <Text style={styles.unavailableText}>Indisponible</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <ReportButton typeContenu="boutique" contenuId={boutique._id} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  banner: { width: SCREEN_WIDTH, height: Math.round(SCREEN_WIDTH * 0.60), backgroundColor: '#f0f0f0' },
  bannerPlaceholder: { width: SCREEN_WIDTH, height: Math.round(SCREEN_WIDTH * 0.60), backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', padding: 12, marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '700' },
  certifiedBadge: { backgroundColor: '#0ea5e9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginTop: 4 },
  certifiedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  description: { fontSize: 13, color: colors.textLight, marginTop: 4, marginBottom: 4, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  meta: { fontSize: 13, color: colors.textLight },
  phone: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: 6 },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, marginBottom: 14 },
  whatsappText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47%', position: 'relative' },
  productCard: { overflow: 'hidden' },
  productTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  productCategorie: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  unavailableOverlay: { position: 'absolute', top: '40%', left: '10%', right: '10%', backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  unavailableText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
