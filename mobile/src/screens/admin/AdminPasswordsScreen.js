import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminPasswordsScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users-security');
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    Alert.alert('', `Êtes-vous sûr de réinitialiser le mot de passe de ${selectedUser.nom}?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: async () => {
        setResetting(true);
        try {
          await api.post(`/admin/users/${selectedUser._id}/reset-password`, { newPassword });
          Alert.alert('', 'Mot de passe réinitialisé avec succès');
          setNewPassword('');
          setSelectedUser(null);
          fetchUsers();
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
          setResetting(false);
        }
      }},
    ]);
  };

  if (loading) return <Loader fullScreen />;

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) || u.telephone.includes(search)
  );

  if (selectedUser) {
    return (
      <Screen>
        <Card style={{ padding: 16 }}>
          <Text style={styles.resetTitle}>{selectedUser.nom}</Text>
          <Text style={styles.meta}>☎️ {selectedUser.telephone}</Text>
          <Text style={[styles.meta, { marginBottom: 16 }]}>Réinitialiser le mot de passe</Text>
          <FormInput label="Nouveau mot de passe" placeholder="Min. 6 caractères" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <View style={styles.btnRow}>
            <Button title={resetting ? 'Réinitialisation...' : 'Réinitialiser'} block loading={resetting} onPress={handleResetPassword} style={{ flex: 1 }} />
            <Button title="Annuler" variant="secondary" onPress={() => { setSelectedUser(null); setNewPassword(''); }} style={{ flex: 1 }} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Gestion des Mots de Passe</Text>
      {error ? <AlertBanner variant="danger">{error}</AlertBanner> : null}
      <FormInput placeholder="Chercher utilisateur..." value={search} onChangeText={setSearch} />
      <Text style={styles.subTitle}>Utilisateurs ({filteredUsers.length})</Text>
      {filteredUsers.length === 0 ? (
        <EmptyState text="Aucun utilisateur trouvé" />
      ) : (
        filteredUsers.map(u => (
          <Card key={u._id} style={styles.card}>
            <View style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.nom}</Text>
                <Text style={styles.meta}>☎️ {u.telephone}</Text>
                <Text style={styles.meta}>Rôle: {u.role}</Text>
                <Text style={styles.meta} numberOfLines={2}>Question: {u.securityQuestion}</Text>
                <Text style={styles.dateText}>Créé le {new Date(u.createdAt).toLocaleDateString('fr-FR')}</Text>
              </View>
              <Button
                title="Réinitialiser"
                size="sm"
                onPress={() => setSelectedUser(u)}
                style={{ alignSelf: 'flex-start' }}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  subTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  card: { padding: 12, marginBottom: 8 },
  userRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  dateText: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  resetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
