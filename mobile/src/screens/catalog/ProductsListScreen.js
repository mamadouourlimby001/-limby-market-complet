import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { Button, Select, FormInput, EmptyState, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const CATEGORIES = ['Électronique', 'Vêtements', 'Meubles', 'Véhicules', 'Téléphones', 'Informatique', 'Électroménager', 'Sport', 'Autres'];
const CATEGORIES_OPTIONS = CATEGORIES.map((c) => ({ label: c, value: c }));

// Portage exact de frontend/src/pages/ProductsList.jsx
export default function ProductsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ ville: '', categorie: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const applyFilters = () => {
    fetchProducts();
    setShowFilters(false);
  };

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1 }}>
      <ProductCard product={item} />
    </View>
  ), []);

  return (
    <View style={styles.flex}>
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Occasion</Text>
          <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
        </View>
        <Button title="+ Nouvelle publication" size="sm" block style={{ backgroundColor: '#111', marginBottom: 8 }} onPress={() => (user ? navigation.navigate('AddProduct') : navigation.navigate('Compte', { screen: 'Login' }))} />
        {showFilters && (
          <View style={styles.filterCard}>
            <Select label="Ville" value={filters.ville} onChange={(v) => setFilters({ ...filters, ville: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
            <Select label="Catégorie" value={filters.categorie} onChange={(v) => setFilters({ ...filters, categorie: v })} options={[{ label: 'Toutes', value: '' }, ...CATEGORIES_OPTIONS]} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <FormInput containerStyle={{ flex: 1 }} label="Prix min" placeholder="GNF" keyboardType="numeric" value={filters.prixMin} onChangeText={(v) => setFilters({ ...filters, prixMin: v })} />
              <FormInput containerStyle={{ flex: 1 }} label="Prix max" placeholder="GNF" keyboardType="numeric" value={filters.prixMax} onChangeText={(v) => setFilters({ ...filters, prixMax: v })} />
            </View>
            <Button title="Appliquer" block size="sm" onPress={applyFilters} />
          </View>
        )}
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {loading && <SkeletonList count={6} />}
            {!loading && products.length === 0 && <EmptyState text="Aucun produit trouvé" />}
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  fixedHeader: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 12 },
  list: { padding: 12, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  filterCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
});
