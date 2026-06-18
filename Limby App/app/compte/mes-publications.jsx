import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export default function MesPublicationsScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [prodRes, locRes, annRes] = await Promise.all([
        api.get('/products', { params: { vendeur: user?._id } }),
        api.get('/locations'),
        api.get('/announcements'),
      ]);
      setProducts((prodRes.data || []).filter(p => p.vendeur?._id === user?._id));
      setLocations((locRes.data || []).filter(l => l.proprietaire?._id === user?._id));
      setAnnouncements((annRes.data || []).filter(a => a.auteur?._id === user?._id));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleToggle = async (type, id) => {
    setUpdatingId(id);
    try {
      await api.put(`/${type}/${id}/disponibilite`);
      await fetchAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (type, id) => {
    Alert.alert('Supprimer', 'Supprimer cette publication ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/${type}/${id}`);
            await fetchAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes publications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <PubSection
          title="Mes produits"
          icon="bag-handle-outline"
          items={products}
          type="products"
          priceKey="prix"
          updatingId={updatingId}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={() => router.push('/occasion/ajouter')}
        />

        <PubSection
          title="Mes locations"
          icon="business-outline"
          items={locations}
          type="locations"
          priceKey="prix"
          updatingId={updatingId}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={() => router.push('/locations/ajouter')}
        />

        <PubSection
          title="Mes annonces"
          icon="document-text-outline"
          items={announcements}
          type="announcements"
          priceKey="salaireMensuel"
          updatingId={updatingId}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={() => router.push('/annonces/ajouter')}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PubSection({ title, icon, items, type, priceKey, updatingId, onToggle, onDelete, onAdd }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune publication</Text>
        </View>
      ) : (
        items.map(item => (
          <View
            key={item._id}
            style={[styles.itemCard, item.disponible === false && styles.itemCardDimmed]}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.titre}</Text>
              <Text style={styles.itemPrice}>
                {item[priceKey]?.toLocaleString('fr-FR')} GNF
              </Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { backgroundColor: item.disponible !== false ? Colors.success : Colors.danger },
                  updatingId === item._id && styles.btnDisabled,
                ]}
                onPress={() => onToggle(type, item._id)}
                disabled={updatingId === item._id}
              >
                {updatingId === item._id ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={item.disponible !== false ? 'checkmark' : 'close'}
                      size={12}
                      color={Colors.white}
                    />
                    <Text style={styles.toggleBtnText}>
                      {item.disponible !== false ? 'Dispo' : 'Indispo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(type, item._id)}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  container: { flex: 1 },

  section: { marginTop: 12, paddingHorizontal: 12 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1.5, borderColor: Colors.primary,
  },
  addBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  empty: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { fontSize: 13, color: Colors.textMuted },

  itemCard: {
    backgroundColor: Colors.card, borderRadius: 10,
    padding: 12, flexDirection: 'row', alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  itemCardDimmed: { opacity: 0.6 },
  itemInfo: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  itemPrice: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6,
  },
  toggleBtnText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  deleteBtn: { padding: 4 },
});
