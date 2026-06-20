import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LocationCard from '../../components/LocationCard';
import { Button, Select, FormInput, FAB, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const CARD_WIDTH = Dimensions.get('window').width * 0.44;

const SECTIONS = [
  { key: 'Colocation',        label: 'Colocation',        accent: '#7c3aed' },
  { key: 'Location',          label: 'Location',          accent: colors.primary },
  { key: 'Vente de maisons',  label: 'Vente de maisons',  accent: '#0891b2' },
  { key: 'Vente de terrains', label: 'Vente de terrains', accent: '#16a34a' },
];

const CATEGORIE_OPTIONS = [
  { label: 'Toutes', value: '' },
  { label: 'Colocation', value: 'Colocation' },
  { label: 'Location', value: 'Location' },
  { label: 'Vente de maisons', value: 'Vente de maisons' },
  { label: 'Vente de terrains', value: 'Vente de terrains' },
];

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

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: CARD_WIDTH, marginRight: 8 }}>
      <LocationCard location={item} />
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Locations</Text>
        <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
      </View>

      {/* Panneau filtres */}
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

      {/* Chargement */}
      {loading && <SkeletonList count={4} />}

      {/* 4 sections */}
      {!loading && (
        <View style={styles.sections}>
          {SECTIONS.map(({ key, label, accent }, index) => {
            const items = locations.filter((l) => l.categorie === key);
            const isLast = index === SECTIONS.length - 1;
            return (
              <View key={key} style={[styles.section, !isLast && styles.sectionDivider]}>
                <View style={[styles.sectionHeader, { borderLeftColor: accent }]}>
                  <Text style={[styles.sectionTitle, { color: accent }]}>{label}</Text>
                  <Text style={styles.sectionCount}>{items.length} annonce{items.length !== 1 ? 's' : ''}</Text>
                </View>
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>Aucune location dans cette catégorie</Text>
                ) : (
                  <FlatList
                    horizontal
                    data={items}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 2, paddingRight: 4 }}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      <FAB onPress={() => (user ? navigation.navigate('AddLocation') : navigation.navigate('Compte', { screen: 'Login' }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8,
  },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  filterCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    marginHorizontal: 12, marginBottom: 8,
  },
  sections: { flex: 1, paddingHorizontal: 12, paddingBottom: 72 },
  section: { flex: 1, paddingVertical: 6 },
  sectionDivider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderLeftWidth: 3, paddingLeft: 8, marginBottom: 6,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  sectionCount: { fontSize: 11, color: colors.textLight },
  emptyText: { fontSize: 12, color: colors.textLight, paddingLeft: 11, paddingTop: 4 },
});
