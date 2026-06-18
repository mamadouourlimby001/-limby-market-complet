import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnnouncementCard from '../../components/AnnouncementCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AnnoncesTab() {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAnnonces = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/announcements?${params}`);
      setAnnonces(res.data?.announcements || res.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setLoading(true);
    fetchAnnonces().finally(() => setLoading(false));
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnonces();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un emploi..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {user && (
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() => router.push('/annonces/ajouter')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={styles.publishBtnText}>Publier une offre</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={annonces}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>Aucune offre trouvée</Text>
              <Text style={styles.emptyDesc}>Revenez plus tard</Text>
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
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
    marginBottom: 8,
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
