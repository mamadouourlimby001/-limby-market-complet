import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LayoutGrid, Zap, Shirt, Package, Car, Smartphone, Laptop, Plug, Dumbbell, MoreHorizontal } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { Button, Select, FormInput, EmptyState, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const TABS = [
  { key: '',               label: 'Tous',           Icon: LayoutGrid },
  { key: 'Électronique',   label: 'Électronique',   Icon: Zap },
  { key: 'Vêtements',      label: 'Vêtements',      Icon: Shirt },
  { key: 'Meubles',        label: 'Meubles',        Icon: Package },
  { key: 'Véhicules',      label: 'Véhicules',      Icon: Car },
  { key: 'Téléphones',     label: 'Téléphones',     Icon: Smartphone },
  { key: 'Informatique',   label: 'Informatique',   Icon: Laptop },
  { key: 'Électroménager', label: 'Électroménager', Icon: Plug },
  { key: 'Sport',          label: 'Sport',          Icon: Dumbbell },
  { key: 'Autres',         label: 'Autres',         Icon: MoreHorizontal },
];

const CATEGORIES_OPTIONS = TABS.filter(t => t.key !== '').map(t => ({ label: t.label, value: t.key }));

export default function ProductsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [filters, setFilters] = useState({ ville: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
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

  const displayed = selectedCategorie ? products.filter(p => p.categorie === selectedCategorie) : products;

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ gap: 4 }}>
          {TABS.map(({ key, label, Icon }) => {
            const active = selectedCategorie === key;
            const iconColor = active ? '#fff' : colors.primary;
            return (
              <Pressable key={key} onPress={() => setSelectedCategorie(key)} style={[styles.tab, active && styles.tabActive]}>
                <Icon size={11} color={iconColor} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {showFilters && (
          <View style={styles.filterCard}>
            <Select label="Ville" value={filters.ville} onChange={(v) => setFilters({ ...filters, ville: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <FormInput containerStyle={{ flex: 1 }} label="Prix min" placeholder="GNF" keyboardType="numeric" value={filters.prixMin} onChangeText={(v) => setFilters({ ...filters, prixMin: v })} />
              <FormInput containerStyle={{ flex: 1 }} label="Prix max" placeholder="GNF" keyboardType="numeric" value={filters.prixMax} onChangeText={(v) => setFilters({ ...filters, prixMax: v })} />
            </View>
            <Button title="Appliquer" block size="sm" onPress={applyFilters} />
          </View>
        )}
      </View>
      <FlatList
        data={displayed}
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
            {!loading && displayed.length === 0 && <EmptyState text="Aucun produit trouvé" />}
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
  tabsRow: { marginBottom: 4 },
  tab: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 6,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 9, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  tabTextActive: { color: '#fff' },
});
