import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, FlatList, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';
import ReportButton from '../../../components/ReportButton';

export default function BoutiqueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);

  useEffect(() => {
    fetchBoutique();
  }, [id]);

  const fetchBoutique = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/boutiques/${id}`);
      setBoutique(res.data.boutique || res.data);
      setProducts(res.data.products || []);
      // Record visit with GPS coordinates if available
      try {
        const cachedCoords = await AsyncStorage.getItem('gpsCoordinates');
        let visitData = {};
        if (cachedCoords) {
          const { latitude, longitude } = JSON.parse(cachedCoords);
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const addressData = await geoRes.json();
          const address = addressData.address || {};
          visitData = {
            pays: address.country || null,
            region: address.state || address.province || null,
            ville: address.city || address.town || address.village || null,
          };
        }
        await api.post(`/boutiques/${id}/visit`, visitData);
      } catch {
        // Visite non enregistrée — non bloquant
      }
    } catch {
      Alert.alert('Erreur', 'Boutique introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (product) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour passer une commande', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    Alert.alert(
      'Confirmer la commande',
      `Quantité : 1\nPrix : ${product.prix?.toLocaleString('fr-FR')} GNF`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commander',
          onPress: async () => {
            setOrdering(product._id);
            try {
              await api.post('/orders', {
                productId: product._id,
                boutiqueId: id,
                quantite: 1,
              });
              Alert.alert('Commande envoyée !', 'Le vendeur va vous contacter.');
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la commande');
            } finally {
              setOrdering(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!boutique) return null;

  const isOwner = user && (boutique.proprietaire?._id === user._id || boutique.proprietaire === user._id);
  const availableProducts = products.filter((p) => p.disponible !== false && p.statut !== 'supprimé');

  const handleWhatsApp = () => {
    const number = boutique.telephone?.replace(/\D/g, '');
    if (number) {
      Linking.openURL(`https://wa.me/${number}`).catch(() =>
        Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp')
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        {boutique.telephone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color={Colors.text} />
            <Text style={styles.contactText}>{boutique.telephone}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Boutique header */}
        <View style={styles.boutiqueHeader}>
          {boutique.logo ? (
            <Image source={{ uri: boutique.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoLetter}>{boutique.nom?.[0]?.toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.boutiqueInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.boutiqueName}>{boutique.nom}</Text>
              {boutique.isCertified && (
                <View style={styles.certBadge}>
                  <Ionicons name="checkmark" size={10} color={Colors.white} />
                  <Text style={styles.certBadgeText}>Certifiée</Text>
                </View>
              )}
              {boutique.isVerified && (
                <Ionicons name="shield-checkmark" size={16} color={Colors.primaryAccent} />
              )}
            </View>
            <Text style={styles.boutiqueCategory}>{boutique.categorie}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textLight} />
              <Text style={styles.boutiqueLocation}>{boutique.ville} — {boutique.quartier}</Text>
            </View>
          </View>
        </View>

        {boutique.description && (
          <View style={styles.descSection}>
            <Text style={styles.description}>{boutique.description}</Text>
          </View>
        )}

        {!isOwner && boutique.telephone && (
          <View style={styles.whatsappSection}>
            <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
              <Text style={styles.whatsappBtnText}>Contacter par WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            Produits disponibles ({availableProducts.length})
          </Text>

          {availableProducts.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Ionicons name="cube-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>Aucun produit disponible</Text>
            </View>
          ) : (
            availableProducts.map((product) => (
              <View key={product._id} style={styles.productCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/boutiques/${id}/produits/${product._id}`)}
                  activeOpacity={0.85}
                >
                  {product.photos?.[0] && (
                    <Image
                      source={{ uri: product.photos[0] }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>{product.titre}</Text>
                    <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                    <Text style={styles.productPrice}>{product.prix?.toLocaleString('fr-FR')} GNF</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.orderBtn, ordering === product._id && styles.orderBtnDisabled]}
                  onPress={() => handleOrder(product)}
                  disabled={ordering === product._id}
                >
                  {ordering === product._id ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.orderBtnText}>Commander</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ReportButton typeContenu="boutique" contenuId={boutique._id} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactText: { color: Colors.text, fontSize: 13 },
  boutiqueHeader: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  logo: { width: 80, height: 80, borderRadius: 14 },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: { color: Colors.white, fontSize: 36, fontWeight: 'bold' },
  boutiqueInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  boutiqueName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  certBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  boutiqueCategory: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  boutiqueLocation: { color: Colors.textLight, fontSize: 13 },
  descSection: { padding: 16, backgroundColor: Colors.card },
  description: { fontSize: 14, color: Colors.textLight, lineHeight: 20 },
  whatsappSection: { padding: 16, backgroundColor: Colors.card },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366', borderRadius: 10, paddingVertical: 13,
  },
  whatsappBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  divider: { height: 8, backgroundColor: Colors.background },
  productsSection: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  emptyProducts: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: { width: '100%', height: 160 },
  productInfo: { padding: 12 },
  productTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  productDesc: { fontSize: 13, color: Colors.textLight, lineHeight: 18, marginBottom: 8 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  orderBtn: {
    backgroundColor: Colors.primary,
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
