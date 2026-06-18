import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LocationCard from '../../components/LocationCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { LOCATION_CATEGORIES } from '../../constants/config';

export default function LocationsTab() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchLocations = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('categorie', selectedCategory);
      const res = await api.get(`/locations?${params}`);
      setLocations(res.data?.locations || res.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setLoading(true);
    fetchLocations().finally(() => setLoading(false));
  }, [search, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un logement..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Tout</Text>
        </TouchableOpacity>
        {LOCATION_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, selectedCategory === c.value && styles.chipActive]}
            onPress={() => setSelectedCategory(selectedCategory === c.value ? '' : c.value)}
          >
            <Text style={[styles.chipText, selectedCategory === c.value && styles.chipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bouton publier */}
      {user && (
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() => router.push('/locations/ajouter')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={styles.publishBtnText}>Publier une annonce</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <LocationCard location={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
              <Text style={styles.emptyDesc}>Essayez d'autres filtres</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    margin: 12,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.text },
  filtersRow: { maxHeight: 44 },
  filtersContent: { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingVertical: 11,
  },
  publishBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 10, paddingBottom: 24 },
  row: { gap: 8, marginBottom: 8 },
  loader: { flex: 1, marginTop: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptyDesc: { fontSize: 13, color: Colors.textMuted },
});
