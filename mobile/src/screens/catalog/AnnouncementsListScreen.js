import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AnnouncementCard from '../../components/AnnouncementCard';
import { Button, Select, FormInput, EmptyState, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/AnnouncementsList.jsx
export default function AnnouncementsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ villeDeTravail: '', entreprise: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAnnouncements = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (filters.villeDeTravail) params.villeDeTravail = filters.villeDeTravail;
      if (filters.entreprise) params.entreprise = filters.entreprise;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1 }}>
      <AnnouncementCard announcement={item} />
    </View>
  ), []);

  return (
    <View style={styles.flex}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAnnouncements(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Annonces</Text>
              <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
            </View>
            <Button title="+ Nouvelle publication" block style={{ backgroundColor: '#111', marginBottom: 8 }} onPress={() => (user ? navigation.navigate('AddAnnouncement') : navigation.navigate('Compte', { screen: 'Login' }))} />

            {showFilters && (
              <View style={styles.filterCard}>
                <Select label="Ville de travail" value={filters.villeDeTravail} onChange={(v) => setFilters({ ...filters, villeDeTravail: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
                <FormInput label="Entreprise" value={filters.entreprise} onChangeText={(v) => setFilters({ ...filters, entreprise: v })} />
                <Button title="Appliquer" block size="sm" onPress={() => { fetchAnnouncements(); setShowFilters(false); }} />
              </View>
            )}

            {loading && <SkeletonList count={6} />}
            {!loading && announcements.length === 0 && <EmptyState text="Aucune annonce trouvée" />}
          </View>
        }
        renderItem={renderItem}
      />
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
