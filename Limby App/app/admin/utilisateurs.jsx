import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

const ROLE_LABELS = {
  acheteur: 'Acheteur',
  vendeur: 'Vendeur',
  vendeur_boutique: 'V. Boutique',
  admin_simple: 'Admin',
  admin_supreme: 'Admin Suprême',
};

export default function AdminUtilisateurs() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [creditInput, setCreditInput] = useState({});
  const [removeMode, setRemoveMode] = useState({});

  const isSuperAdmin =
    (user?.telephone === '+224629043181' && user?.nom?.toLowerCase() === 'diallo mamadou oury') ||
    (user?.telephone === '+224625223418' && user?.nom?.toLowerCase() === 'barry fatoumata binta');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const deleteUser = (id, nom) => {
    Alert.alert('Confirmer', `Supprimer ${nom} et toutes ses publications ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/admin/users/${id}`);
            await fetchUsers();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          }
        }
      }
    ]);
  };

  const addCredits = async (id) => {
    const credits = creditInput[id];
    if (!credits || Number(credits) <= 0) return;
    try {
      await api.post(`/admin/users/${id}/add-credits`, { credits: Number(credits) });
      setCreditInput(prev => ({ ...prev, [id]: '' }));
      await fetchUsers();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  };

  const removeCredits = async (id) => {
    const credits = creditInput[id];
    if (!credits || Number(credits) <= 0) return;
    try {
      await api.post(`/admin/users/${id}/remove-credits`, { credits: Number(credits) });
      setCreditInput(prev => ({ ...prev, [id]: '' }));
      setRemoveMode(prev => ({ ...prev, [id]: false }));
      await fetchUsers();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  };

  const toggleVerified = async (id, current) => {
    try {
      await api.post(`/admin/users/${id}/set-verified`, { isVerified: !current });
      await fetchUsers();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  };

  const toggleAdmin = async (id, role) => {
    try {
      if (role === 'admin_simple') {
        await api.delete(`/admin/admins/${id}`);
      } else {
        await api.post('/admin/admins/add', { userId: id });
      }
      await fetchUsers();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  };

  const filtered = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.telephone.includes(search)
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Utilisateurs ({filtered.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher par nom ou téléphone..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {filtered.map(u => (
          <View key={u._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{u.nom}</Text>
                  {u.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.info} />}
                </View>
                <Text style={styles.userPhone}>
                  <Ionicons name="call-outline" size={12} color={Colors.textMuted} /> {u.telephone}
                </Text>
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{ROLE_LABELS[u.role] || u.role}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Ionicons name="wallet-outline" size={12} color={Colors.success} />
                    <Text style={[styles.badgeText, { color: Colors.success }]}> {u.credits}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnSecondary]}
                onPress={() => toggleVerified(u._id, u.isVerified)}
              >
                <Ionicons name={u.isVerified ? 'close-outline' : 'checkmark-outline'} size={14} color={Colors.text} />
                <Text style={styles.actionBtnText}>{u.isVerified ? 'Retirer badge' : 'Vérifier'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnDanger]}
                onPress={() => deleteUser(u._id, u.nom)}
              >
                <Ionicons name="trash-outline" size={14} color={Colors.white} />
              </TouchableOpacity>
              {isSuperAdmin && u.role !== 'admin_supreme' && (
                <TouchableOpacity
                  style={[styles.actionBtn, u.role === 'admin_simple' ? styles.btnDanger : styles.btnPrimary]}
                  onPress={() => toggleAdmin(u._id, u.role)}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.white }]}>
                    {u.role === 'admin_simple' ? 'Retirer admin' : 'Nommer admin'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.creditRow}>
              <TextInput
                style={styles.creditInput}
                placeholder="Crédits"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={creditInput[u._id] || ''}
                onChangeText={v => setCreditInput(prev => ({ ...prev, [u._id]: v }))}
              />
              <TouchableOpacity style={[styles.actionBtn, styles.btnSuccess]} onPress={() => addCredits(u._id)}>
                <Text style={[styles.actionBtnText, { color: Colors.white }]}>+ Crédits</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.creditRow}>
              <TextInput
                style={styles.creditInput}
                placeholder="Crédits à retirer"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={removeMode[u._id] ? (creditInput[u._id] || '') : ''}
                onChangeText={v => setCreditInput(prev => ({ ...prev, [u._id]: v }))}
                editable={!!removeMode[u._id]}
              />
              {!removeMode[u._id] ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnDanger]}
                  onPress={() => setRemoveMode(prev => ({ ...prev, [u._id]: true }))}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.white }]}>- Crédits</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnDanger]} onPress={() => removeCredits(u._id)}>
                    <Text style={[styles.actionBtnText, { color: Colors.white }]}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnSecondary]}
                    onPress={() => {
                      setRemoveMode(prev => ({ ...prev, [u._id]: false }));
                      setCreditInput(prev => ({ ...prev, [u._id]: '' }));
                    }}
                  >
                    <Text style={styles.actionBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, margin: 12, gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.text },
  container: { flex: 1 },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginBottom: 10, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  userPhone: { fontSize: 12, color: Colors.textLight, marginBottom: 6 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: Colors.primaryOpacity, borderRadius: 6,
    flexDirection: 'row', alignItems: 'center',
  },
  badgeGreen: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  actionBtn: {
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: '#e5e7eb' },
  btnDanger: { backgroundColor: Colors.danger },
  btnSuccess: { backgroundColor: Colors.success },
  creditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  creditInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 13, color: Colors.text, backgroundColor: Colors.inputBg,
  },
});
