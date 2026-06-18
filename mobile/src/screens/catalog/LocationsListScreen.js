import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LocationCard from '../../components/LocationCard';
import { Button, Select, FormInput, Loader, EmptyState, FAB } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const CATEGORIE_OPTIONS = [
  { label: 'Toutes', value: '' },
  { label: 'Location', value: 'Location' },
  { label: 'Colocation', value: 'Colocation' },
  { label: 'Vente immobilière', value: 'Vente_immobilière' },
];

// Portage exact de frontend/src/pages/LocationsList.jsx
export default function LocationsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ville: '', categorie: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      const res = await api.get('/locations', { params });
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  return (
    <View style={styles.flex}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Locations</Text>
              <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
            </View>

            {showFilters && (
              <View style={styles.filterCard}>
                <Select label="Ville" value={filters.ville} onChange={(v) => setFilters({ ...filters, ville: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
                <Select label="Catégorie" value={filters.categorie} onChange={(v) => setFilters({ ...filters, categorie: v })} options={CATEGORIE_OPTIONS} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <FormInput containerStyle={{ flex: 1 }} label="Prix min" keyboardType="numeric" value={filters.prixMin} onChangeText={(v) => setFilters({ ...filters, prixMin: v })} />
                  <FormInput containerStyle={{ flex: 1 }} label="Prix max" keyboardType="numeric" value={filters.prixMax} onChangeText={(v) => setFilters({ ...filters, prixMax: v })} />
                </View>
                <Button title="Appliquer" block size="sm" onPress={() => { fetchLocations(); setShowFilters(false); }} />
              </View>
            )}

            {loading && <Loader />}
            {!loading && locations.length === 0 && <EmptyState text="Aucune location trouvée" />}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <LocationCard location={item} />
          </View>
        )}
      />
      <FAB onPress={() => (user ? navigation.navigate('AddLocation') : navigation.navigate('Compte', { screen: 'Login' }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 12, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  filterCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
});
