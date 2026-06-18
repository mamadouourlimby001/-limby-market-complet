import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminPasswords() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users-security');
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

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.telephone.includes(search)
  );

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    Alert.alert(
      'Confirmer',
      `Réinitialiser le mot de passe de ${selectedUser.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', onPress: async () => {
            setResetting(true);
            try {
              await api.post(`/admin/users/${selectedUser._id}/reset-password`, { newPassword });
              Alert.alert('Succès', 'Mot de passe réinitialisé avec succès');
              setNewPassword('');
              setSelectedUser(null);
              await fetchUsers();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            } finally {
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (selectedUser) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedUser(null); setNewPassword(''); }}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Réinitialiser mot de passe</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.userCard}>
            <Text style={styles.selectedUserName}>{selectedUser.nom}</Text>
            <Text style={styles.selectedUserPhone}>☎️ {selectedUser.telephone}</Text>
            <Text style={styles.selectedUserLabel}>Réinitialiser le mot de passe</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 6 caractères"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnPrimary, resetting && styles.btnDisabled]}
            onPress={handleResetPassword}
            disabled={resetting}
          >
            {resetting ? <ActivityIndicator color={Colors.white} size="small" /> : (
              <Text style={styles.actionBtnText}>Réinitialiser</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnSecondary]}
            onPress={() => { setSelectedUser(null); setNewPassword(''); }}
          >
            <Text style={[styles.actionBtnText, { color: Colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mots de passe</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Chercher utilisateur..."
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
        <Text style={styles.count}>Utilisateurs ({filteredUsers.length})</Text>

        {filteredUsers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        ) : (
          filteredUsers.map(u => (
            <View key={u._id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.nom}</Text>
                <Text style={styles.userPhone}>☎️ {u.telephone}</Text>
                <Text style={styles.userRole}>Rôle: <Text style={styles.roleBadge}>{u.role}</Text></Text>
                {u.securityQuestion && (
                  <Text style={styles.userQuestion}>Question: {u.securityQuestion}</Text>
                )}
                <Text style={styles.userDate}>
                  Créé le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setSelectedUser(u)}
              >
                <Ionicons name="lock-closed-outline" size={14} color={Colors.white} />
                <Text style={styles.resetBtnText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  count: { fontSize: 13, fontWeight: '700', color: Colors.text, paddingHorizontal: 12, marginBottom: 8 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginBottom: 8, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  userName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  userPhone: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  userRole: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  roleBadge: { fontWeight: '700', color: Colors.primary },
  userQuestion: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 2 },
  userDate: { fontSize: 10, color: Colors.textMuted },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginLeft: 8,
  },
  resetBtnText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  userCard: {
    backgroundColor: Colors.card, borderRadius: 12,
    margin: 12, padding: 14,
  },
  selectedUserName: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  selectedUserPhone: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  selectedUserLabel: { fontSize: 13, color: Colors.textLight },
  inputSection: { paddingHorizontal: 12, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    backgroundColor: Colors.card,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: Colors.text },
  eyeBtn: { padding: 12 },
  actionBtn: {
    borderRadius: 8, marginHorizontal: 12,
    paddingVertical: 13, alignItems: 'center', marginBottom: 10,
  },
  actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: '#e5e7eb' },
  btnDisabled: { opacity: 0.5 },
});
