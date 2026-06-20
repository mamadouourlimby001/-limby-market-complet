import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, Linking, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Check, Store } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ReportButton from '../../components/ReportButton';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Badge, Button, Card, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const EXPANDED_H = 210;
const COLLAPSED_H = 86;
const COLLAPSE_AT  = 70;

export default function BoutiqueDetailScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/boutiques/${id}`);
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
          visitData = { pays: address.country || null, region: address.state || address.province || null, ville: address.city || address.town || address.village || null };
        }
        await api.post(`/boutiques/${id}/visit`, visitData);
      } catch (error) { console.log('Visite non enregistrée:', error); }
    })();
  }, [data, user, id]);

  const headerHeight   = scrollY.interpolate({ inputRange: [0, COLLAPSE_AT], outputRange: [EXPANDED_H, COLLAPSED_H], extrapolate: 'clamp' });
  const expandedOpacity = scrollY.interpolate({ inputRange: [0, COLLAPSE_AT * 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
  const collapsedOpacity = scrollY.interpolate({ inputRange: [COLLAPSE_AT * 0.5, COLLAPSE_AT], outputRange: [0, 1], extrapolate: 'clamp' });

  if (loading) return <Loader fullScreen />;
  if (!data)   return <EmptyState text="Boutique introuvable" />;

  const { boutique, products } = data;
  const isOwner = user && boutique.proprietaire?._id === user._id;
  const waUrl = `https://wa.me/${(boutique.telephone || '').replace(/\D/g, '')}`;

  const ActionBtn = ({ small }) => isOwner ? (
    <Button
      title="+ Ajouter un produit"
      size="sm"
      block
      style={small ? { marginTop: 4 } : { marginHorizontal: 12, marginTop: 8 }}
      onPress={() => navigation.navigate('MaBoutique', { screen: 'AddBoutiqueProduct', params: { id } })}
    />
  ) : (
    <Pressable style={small ? styles.whatsappSmall : styles.whatsappLarge} onPress={() => Linking.openURL(waUrl)}>
      <WhatsAppIcon size={small ? 14 : 17} />
      <Text style={small ? styles.whatsappTextSmall : styles.whatsappTextLarge}>
        {small ? 'WhatsApp' : 'Contacter par WhatsApp'}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.flex}>
      {/* Header animé */}
      <Animated.View style={[styles.fixedHeader, { height: headerHeight }]}>

        {/* Vue étendue : centrée, grande */}
        <Animated.View style={[styles.fill, { opacity: expandedOpacity }]}>
          <View style={styles.avatarCenter}>
            {boutique.logo
              ? <Image source={{ uri: boutique.logo }} style={styles.avatarLarge} resizeMode="cover" />
              : <View style={[styles.avatarLarge, styles.avatarPlaceholder]}><Store size={32} color={colors.textLight} /></View>
            }
          </View>
          <View style={styles.infoCenter}>
            <View style={styles.nameRow}>
              <Text style={styles.nameLarge} numberOfLines={1}>{boutique.nom}</Text>
              {boutique.isVerified ? <Check size={15} color={colors.accent} /> : null}
              {boutique.isCertified ? <View style={styles.certBadge}><Text style={styles.certText}>Certifiée</Text></View> : null}
            </View>
            <Text style={styles.descLarge} numberOfLines={1}>{boutique.description}</Text>
            <View style={styles.metaRow}>
              <MapPin size={12} color={colors.textLight} />
              <Text style={styles.metaLarge} numberOfLines={1}>{boutique.quartier}, {boutique.ville} · {boutique.telephone}</Text>
            </View>
            <Badge variant="primary">{boutique.categorie}</Badge>
          </View>
          <ActionBtn small={false} />
        </Animated.View>

        {/* Vue réduite : ligne, petite */}
        <Animated.View style={[styles.fill, { opacity: collapsedOpacity }]}>
          <View style={styles.collapsedRow}>
            {boutique.logo
              ? <Image source={{ uri: boutique.logo }} style={styles.avatarSmall} resizeMode="cover" />
              : <View style={[styles.avatarSmall, styles.avatarPlaceholder]}><Store size={16} color={colors.textLight} /></View>
            }
            <View style={styles.collapsedInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameSmall} numberOfLines={1}>{boutique.nom}</Text>
                {boutique.isVerified ? <Check size={12} color={colors.accent} /> : null}
                {boutique.isCertified ? <View style={styles.certBadge}><Text style={styles.certText}>Certifiée</Text></View> : null}
              </View>
              <Text style={styles.metaSmall} numberOfLines={1}>{boutique.quartier}, {boutique.ville}</Text>
            </View>
            <ActionBtn small={true} />
          </View>
        </Animated.View>

      </Animated.View>

      {/* Contenu défilable */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
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
              const rest = products.filter(p => !inSection.has(p._id));
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
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  fixedHeader: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  /* Expanded */
  avatarCenter: { alignItems: 'center', paddingTop: 10, marginBottom: 6 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.primary },
  infoCenter: { alignItems: 'center', paddingHorizontal: 12, marginBottom: 4 },
  nameLarge: { fontSize: 16, fontWeight: '700' },
  descLarge: { fontSize: 11, color: colors.textLight, marginVertical: 2 },
  metaLarge: { fontSize: 10, color: colors.textLight, flex: 1 },
  whatsappLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, marginHorizontal: 12, marginTop: 6, backgroundColor: '#25D366', borderRadius: 12, elevation: 3, shadowColor: '#25D366', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  whatsappTextLarge: { fontSize: 14, fontWeight: '700', color: '#fff' },

  /* Collapsed */
  collapsedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 10 },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.primary },
  avatarPlaceholder: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  collapsedInfo: { flex: 1 },
  nameSmall: { fontSize: 13, fontWeight: '700' },
  metaSmall: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  whatsappSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#25D366', borderRadius: 8 },
  whatsappTextSmall: { fontSize: 11, fontWeight: '700', color: '#fff' },

  /* Shared */
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  certBadge: { backgroundColor: '#059669', paddingVertical: 1, paddingHorizontal: 5, borderRadius: 4 },
  certText: { color: '#fff', fontSize: 9, fontWeight: '600' },

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
