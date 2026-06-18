import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BoutiqueCard from '../../../components/BoutiqueCard';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';

export default function BoutiquesListScreen() {
  const { user } = useAuth();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBoutiques = async () => {
    try {
      const res = await api.get('/boutiques');
      setBoutiques(res.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchBoutiques().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoutiques();
    setRefreshing(false);
  };

  const filtered = boutiques.filter(
    (b) =>
      !search ||
      b.nom?.toLowerCase().includes(search.toLowerCase()) ||
      b.categorie?.toLowerCase().includes(search.toLowerCase()) ||
      b.ville?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une boutique..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {user && user.role !== 'vendeur_boutique' && (
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/boutiques/creer')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={styles.createBtnText}>Créer une boutique</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <BoutiqueCard boutique={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>Aucune boutique trouvée</Text>
              {!search && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/boutiques/creer')}>
                  <Text style={styles.emptyBtnText}>Créer votre boutique</Text>
                </TouchableOpacity>
              )}
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
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary,
    marginHorizontal: 12, marginBottom: 8,
    borderRadius: 10, paddingVertical: 11,
  },
  createBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 10, paddingBottom: 24 },
  row: { gap: 8, marginBottom: 8 },
  loader: { flex: 1, marginTop: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 8,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
