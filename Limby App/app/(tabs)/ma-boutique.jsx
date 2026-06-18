import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, TextInput, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Récent' },
  { value: 'price-asc', label: 'Prix ↑' },
  { value: 'price-desc', label: 'Prix ↓' },
];

export default function MaBoutiqueTab() {
  const { user } = useAuth();
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchBoutique = async () => {
    try {
      const [boutRes, msgRes] = await Promise.all([
        api.get('/boutiques/my-boutique'),
        api.get('/boutique-messages/boutique-inbox').catch(() => ({ data: { unreadCount: 0 } })),
      ]);
      setBoutique(boutRes.data.boutique || boutRes.data);
      setProducts(boutRes.data.products || []);
      setUnreadCount(msgRes.data.unreadCount || 0);
    } catch (err) {
      if (err.response?.status === 404) {
        setBoutique(null);
      }
    }
  };

  useEffect(() => {
    fetchBoutique().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoutique();
    setRefreshing(false);
  };

  const handleToggleProduct = async (productId, currentDisp) => {
    setToggling(productId);
    try {
      if (!boutique?._id) return;
      await api.put(`/boutiques/${boutique._id}/products/${productId}/disponibilite`);
      setProducts((prev) =>
        prev.map((p) => p._id === productId ? { ...p, disponible: !currentDisp } : p)
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert('Supprimer', 'Supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/boutiques/${boutique._id}/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p._id !== productId));
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!boutique) {
    return (
      <View style={styles.noBoutique}>
        <Ionicons name="storefront-outline" size={64} color={Colors.border} />
        <Text style={styles.noBoutiqueTitle}>Vous n'avez pas de boutique</Text>
        <Text style={styles.noBoutiqueDesc}>Créez votre boutique pour vendre en ligne</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/boutiques/creer')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={styles.createBtnText}>Créer une boutique</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeProducts = products.filter((p) => p.statut !== 'supprimé');

  let filtered = activeProducts;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.titre?.toLowerCase().includes(q) || p.categorie?.toLowerCase().includes(q)
    );
  }
  if (sort === 'recent') {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.prix - b.prix);
  } else if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.prix - a.prix);
  }

  const available = filtered.filter(p => p.disponible !== false);
  const unavailable = filtered.filter(p => p.disponible === false);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Carte boutique */}
      <View style={styles.boutiqueCard}>
        <View style={styles.boutiqueHeader}>
          {boutique.logo ? (
            <Image source={{ uri: boutique.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoLetter}>{boutique.nom?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.boutiqueInfo}>
            <Text style={styles.boutiqueName}>{boutique.nom}</Text>
            <Text style={styles.boutiqueCategory}>{boutique.categorie}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.boutiqueLocation}>{boutique.quartier}, {boutique.ville}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusRow}>
          <StatusBadge
            label={boutique.isActive ? 'Active' : 'Inactive'}
            color={boutique.isActive ? Colors.success : Colors.danger}
            icon={boutique.isActive ? 'checkmark-circle' : 'close-circle'}
          />
          {boutique.isVerified && (
            <StatusBadge label="Vérifiée" color={Colors.primaryAccent} icon="shield-checkmark" />
          )}
          {boutique.isCertified && (
            <StatusBadge label="Certifiée" color={Colors.warning} icon="star" />
          )}
        </View>

        {boutique.dateExpiration && (
          <Text style={styles.expireDate}>
            Expiration : {new Date(boutique.dateExpiration).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </Text>
        )}

        {/* Action buttons */}
        <View style={styles.actionGrid}>
          <ActionBtn
            icon="bar-chart-outline"
            label="Statistiques"
            onPress={() => router.push('/ma-boutique/bilan')}
          />
          <ActionBtn
            icon="receipt-outline"
            label="Commandes"
            onPress={() => router.push('/commandes/boutique-commandes')}
          />
          <ActionBtn
            icon="chatbubbles-outline"
            label={`Messages${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            badge={unreadCount}
            onPress={() => router.push('/messages/boutique-messages')}
          />
          <ActionBtn
            icon="eye-outline"
            label="Visites"
            onPress={() => router.push('/ma-boutique/visites')}
          />
          <ActionBtn
            icon="create-outline"
            label="Modifier"
            onPress={() => router.push('/boutiques/creer')}
          />
          <ActionBtn
            icon="refresh-circle-outline"
            label="Renouveler"
            onPress={() => router.push('/credits/renouveler')}
          />
        </View>
      </View>

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Chercher produit..."
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortBtn, sort === opt.value && styles.sortBtnActive]}
              onPress={() => setSort(opt.value)}
            >
              <Text style={[styles.sortBtnText, sort === opt.value && styles.sortBtnTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section produits */}
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>Mes produits ({filtered.length})</Text>
        <TouchableOpacity
          onPress={() => router.push('/ma-boutique/produits/ajouter')}
          style={styles.addProductBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addProductText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Ionicons name="cube-outline" size={40} color={Colors.border} />
          <Text style={styles.emptyText}>
            {search ? 'Aucun produit trouvé' : 'Aucun produit'}
          </Text>
          {!search && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/ma-boutique/produits/ajouter')}
              activeOpacity={0.85}
            >
              <Text style={styles.createBtnText}>Ajouter un produit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.productsList}>
          {available.length > 0 && (
            <>
              <Text style={styles.groupLabel}>
                <Text style={{ color: Colors.success }}>✓ Disponibles ({available.length})</Text>
              </Text>
              <View style={styles.productsGrid}>
                {available.map(product => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    toggling={toggling}
                    onToggle={handleToggleProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </View>
            </>
          )}
          {unavailable.length > 0 && (
            <>
              <Text style={[styles.groupLabel, { marginTop: 12 }]}>
                <Text style={{ color: Colors.danger }}>✗ Non disponibles ({unavailable.length})</Text>
              </Text>
              <View style={styles.productsGrid}>
                {unavailable.map(product => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    toggling={toggling}
                    onToggle={handleToggleProduct}
                    onDelete={handleDeleteProduct}
                    dimmed
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function StatusBadge({ label, color, icon }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, badge = 0 }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.actionBtnIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        {badge > 0 && (
          <View style={styles.badgeDot}>
            <Text style={styles.badgeDotText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.actionBtnText} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProductRow({ product, toggling, onToggle, onDelete, dimmed = false }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 120, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();

  return (
    <Animated.View style={[styles.productCard, { transform: [{ scale }] }, dimmed && styles.productCardDimmed]}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={styles.productTouchable}>
        {product.photos?.[0] ? (
          <Image source={{ uri: product.photos[0] }} style={styles.productThumb} />
        ) : (
          <View style={styles.productThumbPlaceholder}>
            <Ionicons name="cube-outline" size={28} color={Colors.textMuted} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.titre}</Text>
          <Text style={styles.productPrice}>{product.prix?.toLocaleString('fr-FR')} GNF</Text>
          <Text style={styles.productCategory} numberOfLines={1}>{product.categorie}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.productActions}>
        <TouchableOpacity
          onPress={() => onToggle(product._id, product.disponible)}
          disabled={toggling === product._id}
          style={[styles.toggleBtn, { backgroundColor: product.disponible !== false ? Colors.success : Colors.danger }]}
        >
          {toggling === product._id
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Ionicons name={product.disponible !== false ? 'checkmark' : 'close'} size={13} color={Colors.white} />
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(product._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={15} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noBoutique: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: Colors.background,
  },
  noBoutiqueTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  noBoutiqueDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  createBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  boutiqueCard: {
    backgroundColor: Colors.card,
    margin: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  boutiqueHeader: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  logo: { width: 70, height: 70, borderRadius: 12 },
  logoPlaceholder: {
    width: 70, height: 70, borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoLetter: { color: Colors.white, fontSize: 30, fontWeight: 'bold' },
  boutiqueInfo: { flex: 1, gap: 3 },
  boutiqueName: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
  boutiqueCategory: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  boutiqueLocation: { fontSize: 12, color: Colors.textMuted },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: Colors.card,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  expireDate: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  actionGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4,
  },
  actionBtn: {
    width: '30%',
    backgroundColor: Colors.background,
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
    flexGrow: 1,
  },
  actionBtnIconWrap: { position: 'relative' },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: Colors.primary, textAlign: 'center' },
  badgeDot: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: Colors.danger, borderRadius: 8,
    minWidth: 14, height: 14,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2,
  },
  badgeDotText: { color: Colors.white, fontSize: 9, fontWeight: 'bold' },

  searchRow: { paddingHorizontal: 12, marginBottom: 8, gap: 8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 10, paddingVertical: 8, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },
  sortRow: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortBtnText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  sortBtnTextActive: { color: Colors.white },

  productsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  addProductBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5, borderColor: Colors.primary,
  },
  addProductText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  emptyProducts: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted },

  productsList: { paddingHorizontal: 10 },
  groupLabel: {
    fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 4, paddingLeft: 2,
  },
  productsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  productCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    overflow: 'hidden', width: '47.5%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
    marginBottom: 0,
  },
  productTouchable: { flex: 1 },
  productCardDimmed: { opacity: 0.6 },
  productThumb: { width: '100%', height: 120 },
  productThumbPlaceholder: {
    width: '100%', height: 120,
    backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  productInfo: { padding: 8 },
  productTitle: { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 3, lineHeight: 16 },
  productPrice: { fontSize: 13, fontWeight: 'bold', color: Colors.primary, marginBottom: 2 },
  productCategory: { fontSize: 10, color: Colors.textMuted },
  productActions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  toggleBtn: {
    flex: 1, height: 26, borderRadius: 6, marginRight: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: { padding: 4 },
});
