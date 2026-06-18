import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, TextInput, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { Colors } from '../../../../constants/colors';

export default function ProductBoutiqueDetailScreen() {
  const { boutiqueId, productId } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [quantite, setQuantite] = useState('1');
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [boutiqueId, productId]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/boutiques/${boutiqueId}`);
      const { boutique: b, products } = res.data;
      setBoutique(b);
      const prod = (products || []).find(p => p._id === productId);
      setProduct(prod || null);
    } catch {
      Alert.alert('Erreur', 'Produit introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour passer une commande', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    const isOwner =
      user._id === boutique?.proprietaire?._id ||
      user._id === boutique?.proprietaire;
    if (isOwner) {
      Alert.alert('Attention', 'Vous ne pouvez pas commander vos propres produits');
      return;
    }
    const qty = parseInt(quantite, 10);
    if (!qty || qty < 1) {
      Alert.alert('Erreur', 'Quantite invalide');
      return;
    }
    setOrdering(true);
    try {
      await api.post('/orders', { productId, boutiqueId, quantite: qty });
      Alert.alert('Commande envoyee', 'Le vendeur va vous contacter.', [
        { text: 'Mes commandes', onPress: () => router.push('/commandes/mes-commandes') },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product || !boutique) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produit introuvable</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color={Colors.border} />
          <Text style={styles.errorText}>Ce produit n'existe pas</Text>
        </View>
      </SafeAreaView>
    );
  }

  const photos = product.photos || [];
  const isAvailable = product.disponible !== false;
  const isOwner = user && (user._id === boutique?.proprietaire?._id || user._id === boutique?.proprietaire);

  const handleWhatsApp = () => {
    const number = boutique?.telephone?.replace(/\D/g, '');
    if (number) {
      Linking.openURL(`https://wa.me/${number}`).catch(() =>
        Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp')
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.titre}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        {photos.length > 0 ? (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: photos[photoIndex] }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
            {photos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbsRow}>
                {photos.map((ph, i) => (
                  <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                    <Image
                      source={{ uri: ph }}
                      style={[styles.thumb, i === photoIndex && styles.thumbActive]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="cube-outline" size={64} color={Colors.border} />
          </View>
        )}

        <View style={styles.body}>
          {/* Title and price */}
          <Text style={styles.productTitle}>{product.titre}</Text>
          <Text style={styles.productCategory}>{product.categorie}</Text>
          <Text style={styles.productPrice}>
            {product.prix?.toLocaleString('fr-FR')} GNF
          </Text>
          <Text style={styles.productDate}>
            Ajoute le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
          </Text>

          {/* Availability badge */}
          <View style={[styles.availBadge, { backgroundColor: isAvailable ? '#d1fae5' : '#fee2e2' }]}>
            <Ionicons
              name={isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={14}
              color={isAvailable ? Colors.success : Colors.danger}
            />
            <Text style={[styles.availText, { color: isAvailable ? Colors.success : Colors.danger }]}>
              {isAvailable ? 'Disponible' : 'Non disponible'}
            </Text>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Boutique info */}
          <View style={styles.boutiqueCard}>
            {boutique.logo ? (
              <Image source={{ uri: boutique.logo }} style={styles.boutiqueLogo} />
            ) : (
              <View style={styles.boutiqueLogoPlaceholder}>
                <Text style={styles.boutiqueLogoLetter}>{boutique.nom?.[0]}</Text>
              </View>
            )}
            <View style={styles.boutiqueInfo}>
              <Text style={styles.boutiqueName}>{boutique.nom}</Text>
              {boutique.isVerified && (
                <Text style={styles.boutiqueVerified}>Verifie</Text>
              )}
              {boutique.telephone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.infoText}>{boutique.telephone}</Text>
                </View>
              )}
              {boutique.ville && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.infoText}>
                    {boutique.quartier ? `${boutique.quartier}, ` : ''}{boutique.ville}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Order section — non-owners only */}
          {!isOwner ? (
            <>
              {isAvailable && (
                <View style={styles.orderSection}>
                  <Text style={styles.sectionLabel}>Quantite</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantite(q => String(Math.max(1, parseInt(q, 10) - 1)))}
                    >
                      <Ionicons name="remove" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      value={quantite}
                      onChangeText={setQuantite}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantite(q => String(parseInt(q, 10) + 1))}
                    >
                      <Ionicons name="add" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.orderBtn, ordering && styles.orderBtnDisabled]}
                    onPress={handleOrder}
                    disabled={ordering}
                    activeOpacity={0.85}
                  >
                    {ordering ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <>
                        <Ionicons name="cart-outline" size={18} color={Colors.white} />
                        <Text style={styles.orderBtnText}>Commander</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {boutique?.telephone && (
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={handleWhatsApp}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                  <Text style={styles.whatsappBtnText}>Contacter par WhatsApp</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.ownerBox}>
              <Text style={styles.ownerBoxText}>C'est votre produit</Text>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginHorizontal: 8 },
  errorText: { fontSize: 15, color: Colors.textMuted },
  container: { flex: 1 },

  photoSection: { backgroundColor: Colors.card },
  mainPhoto: { width: '100%', height: 280 },
  thumbsRow: { padding: 10 },
  thumb: {
    width: 64, height: 64, borderRadius: 8, marginRight: 8,
    borderWidth: 2, borderColor: 'transparent',
  },
  thumbActive: { borderColor: Colors.primary },
  noPhoto: {
    height: 200, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },

  body: { padding: 16 },
  productTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  productCategory: { fontSize: 13, color: Colors.textLight, marginBottom: 8 },
  productPrice: { fontSize: 28, fontWeight: '800', color: Colors.success, marginBottom: 4 },
  productDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 12 },

  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 16,
  },
  availText: { fontSize: 12, fontWeight: '700' },

  descSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  descText: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },

  boutiqueCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12, padding: 12,
    marginBottom: 20, borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  boutiqueLogo: { width: 56, height: 56, borderRadius: 10 },
  boutiqueLogoPlaceholder: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  boutiqueLogoLetter: { color: Colors.white, fontSize: 24, fontWeight: 'bold' },
  boutiqueInfo: { flex: 1, gap: 3 },
  boutiqueName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  boutiqueVerified: { fontSize: 11, color: Colors.success, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: Colors.textMuted },

  orderSection: { marginTop: 4 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 14,
  },
  qtyBtn: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyInput: {
    flex: 1, height: 38,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    fontSize: 16, fontWeight: '700', color: Colors.text,
    backgroundColor: Colors.card,
  },
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366', borderRadius: 12,
    paddingVertical: 14, marginTop: 12,
  },
  whatsappBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  ownerBox: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    padding: 20, alignItems: 'center', marginTop: 8,
  },
  ownerBoxText: { fontSize: 14, color: Colors.textMuted },
});
