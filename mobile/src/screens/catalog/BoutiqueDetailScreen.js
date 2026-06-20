import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Linking, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Check, Store } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ReportButton from '../../components/ReportButton';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Badge, Button, Card, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

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
    <View style={styles.flex}>
      {/* Header fixe */}
      <View style={styles.fixedHeader}>
        <View style={styles.avatarWrap}>
          {boutique.logo
            ? <Image source={{ uri: boutique.logo }} style={styles.avatar} resizeMode="cover" />
            : <View style={styles.avatarPlaceholder}><Store size={36} color={colors.textLight} /></View>
          }
        </View>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{boutique.nom}</Text>
            {boutique.isVerified ? <Check size={18} color={colors.accent} /> : null}
            {boutique.isCertified ? (
              <View style={styles.certifiedBadge}>
                <Text style={styles.certifiedText}>Boutique Certifiée</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.description}>{boutique.description}</Text>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.meta}>{boutique.quartier}, {boutique.ville}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.phone}>{boutique.telephone}</Text>
          </View>
          <Badge variant="primary">{boutique.categorie}</Badge>
        </View>

        {isOwner ? (
          <Button
            title="+ Ajouter un produit"
            block
            style={{ marginBottom: 10, marginHorizontal: 12 }}
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
      </View>

      {/* Contenu défilable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Produits ({products.length})</Text>
        {products.length === 0 ? (
          <EmptyState icon={<Store size={32} color={colors.textLight} />} text="Aucun produit" />
        ) : (
          <>
            {(() => {
              const orderedSecs = (boutique.sections || []).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
              const inSection = new Set();
              const groups = orderedSecs.map(s => {
                const prods = products.filter(p => p.section === s.nom).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
                prods.forEach(p => inSection.add(p._id));
                return { nom: s.nom, prods };
              }).filter(g => g.prods.length > 0);
              const rest = products.filter(p => !inSection.has(p._id)).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
              if (rest.length > 0) groups.push({ nom: null, prods: rest });

              const renderProd = (p) => (
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
              );

              return groups.map((group, gi) => (
                <View key={gi} style={group.nom ? styles.sectionContainer : styles.sectionContainerPlain}>
                  {group.nom ? (
                    <View style={styles.sectionBand}>
                      <Text style={styles.sectionBandTitle}>{group.nom}</Text>
                      <Text style={styles.sectionBandCount}>{group.prods.length} produit{group.prods.length !== 1 ? 's' : ''}</Text>
                    </View>
                  ) : null}
                  <View style={[styles.grid, group.nom ? styles.gridPadded : null]}>
                    {group.prods.map(renderProd)}
                  </View>
                </View>
              ));
            })()}
          </>
        )}
        <View style={{ marginTop: 12 }}>
          <ReportButton typeContenu="boutique" contenuId={boutique._id} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  fixedHeader: { backgroundColor: colors.bg, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatarWrap: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.primary },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.border, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700' },
  certifiedBadge: { backgroundColor: '#059669', paddingVertical: 3, paddingHorizontal: 7, borderRadius: 4 },
  certifiedText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  description: { fontSize: 13, color: colors.textLight, marginTop: 4, marginBottom: 4, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' },
  meta: { fontSize: 12, color: colors.textLight },
  metaSep: { fontSize: 12, color: colors.textLight },
  phone: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginHorizontal: 12, marginBottom: 10, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10 },
  whatsappText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  scrollContent: { padding: 12, paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  sectionContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, borderWidth: 1.5, borderColor: colors.primary, overflow: 'hidden' },
  sectionContainerPlain: { marginBottom: 8 },
  sectionBand: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionBandTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sectionBandCount: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridPadded: { padding: 10 },
  gridItem: { width: '47%', position: 'relative' },
  productCard: { overflow: 'hidden' },
  productTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  productCategorie: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  unavailableOverlay: { position: 'absolute', top: '40%', left: '10%', right: '10%', backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  unavailableText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
