import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building2, Users, Home, Map } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LocationCard from '../../components/LocationCard';
import { Button, Select, FormInput, EmptyState, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const TABS = [
  { key: 'Location',          label: 'Location',          Icon: Building2 },
  { key: 'Collocation',       label: 'Collocation',       Icon: Users },
  { key: 'Vente de maisons',  label: 'Vente de maisons',  Icon: Home },
  { key: 'Vente de terrains', label: 'Vente de terrains', Icon: Map },
];

export default function LocationsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState('Location');
  const [filters, setFilters] = useState({ ville: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLocations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      const res = await api.get('/locations', { params });
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const displayed = locations.filter((l) => l.categorie === selectedCategorie);

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1 }}>
      <LocationCard location={item} />
    </View>
  ), []);

  return (
    <View style={styles.flex}>
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Locations</Text>
          <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
        </View>
        <Button title="+ Nouvelle publication" block style={{ backgroundColor: '#111', marginBottom: 8 }} onPress={() => (user ? navigation.navigate('AddLocation') : navigation.navigate('Compte', { screen: 'Login' }))} />
        <View style={styles.tabsRow}>
          {TABS.map(({ key, label, Icon }) => {
            const active = selectedCategorie === key;
            const iconColor = active ? '#fff' : colors.primary;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedCategorie(key)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Icon size={13} color={iconColor} />
                <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={2}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        {showFilters && (
          <View style={styles.filterCard}>
            <Select label="Ville" value={filters.ville} onChange={(v) => setFilters({ ...filters, ville: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <FormInput containerStyle={{ flex: 1 }} label="Prix min" keyboardType="numeric" value={filters.prixMin} onChangeText={(v) => setFilters({ ...filters, prixMin: v })} />
              <FormInput containerStyle={{ flex: 1 }} label="Prix max" keyboardType="numeric" value={filters.prixMax} onChangeText={(v) => setFilters({ ...filters, prixMax: v })} />
            </View>
            <Button title="Appliquer" block size="sm" onPress={() => { fetchLocations(); setShowFilters(false); }} />
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
            onRefresh={() => fetchLocations(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {loading && <SkeletonList count={6} />}
            {!loading && displayed.length === 0 && <EmptyState text="Aucune location trouvée" />}
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
  tabsRow: { flexDirection: 'row', gap: 4, paddingBottom: 6 },
  tab: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: { fontSize: 10, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  tabTextActive: { color: '#fff' },
});
