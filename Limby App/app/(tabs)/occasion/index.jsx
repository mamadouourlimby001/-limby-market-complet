import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../../components/ProductCard';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';
import { VILLES_GUINEE } from '../../../constants/config';

export default function OccasionListScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVille, setSelectedVille] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({ page: currentPage, limit: 12 });
      if (search.trim()) params.append('search', search.trim());
      if (selectedVille) params.append('ville', selectedVille);
      const res = await api.get(`/products?${params}`);
      const data = res.data?.products || res.data || [];
      if (reset) { setProducts(data); setPage(2); }
      else { setProducts((prev) => [...prev, ...data]); setPage((p) => p + 1); }
      setHasMore(data.length === 12);
    } catch { /* ignore */ }
  }, [search, selectedVille, page]);

  useEffect(() => {
    setLoading(true);
    fetchProducts(true).finally(() => setLoading(false));
  }, [search, selectedVille]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchProducts(false);
    setLoadingMore(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un produit..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedVille && styles.filterChipActive]}
          onPress={() => setSelectedVille('')}
        >
          <Text style={[styles.filterChipText, !selectedVille && styles.filterChipTextActive]}>Toutes</Text>
        </TouchableOpacity>
        {VILLES_GUINEE.slice(0, 6).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.filterChip, selectedVille === v && styles.filterChipActive]}
            onPress={() => setSelectedVille(selectedVille === v ? '' : v)}
          >
            <Text style={[styles.filterChipText, selectedVille === v && styles.filterChipTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {user && (
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() => router.push('/occasion/ajouter')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={styles.publishBtnText}>Publier un produit</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bag-handle-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
              <Text style={styles.emptyDesc}>Essayez de changer vos filtres</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, margin: 12, gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },
  filtersRow: { maxHeight: 44 },
  filtersContent: { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary,
    marginHorizontal: 12, marginVertical: 8,
    borderRadius: 10, paddingVertical: 11,
  },
  publishBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 10, paddingBottom: 24, paddingTop: 4 },
  row: { gap: 8, marginBottom: 8 },
  loader: { flex: 1, marginTop: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptyDesc: { fontSize: 13, color: Colors.textMuted },
});
