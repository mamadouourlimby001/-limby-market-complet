import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Check, X, Trash2, Phone, Coins } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, Button, FormInput, Badge } from '../../components/ui';
import { colors } from '../../theme/theme';

const ROLE_LABELS = { acheteur: 'Acheteur', vendeur: 'Vendeur', vendeur_boutique: 'V. Boutique', admin_simple: 'Admin', admin_supreme: 'Admin Suprême' };

export default function AdminUsersScreen() {
  const { isSupremeAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditInput, setCreditInput] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = (id) => {
    Alert.alert('', 'Supprimer cet utilisateur et toutes ses publications ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await api.delete(`/admin/users/${id}`); fetchUsers(); }
        catch (err) { Alert.alert('', err.response?.data?.message || 'Erreur'); }
      }},
    ]);
  };

  const addCredits = async (id) => {
    const credits = creditInput[id];
    if (!credits || credits <= 0) return;
    try {
      await api.post(`/admin/users/${id}/add-credits`, { credits: Number(credits) });
      setCreditInput({ ...creditInput, [id]: '' });
      fetchUsers();
    } catch (err) { Alert.alert('', err.response?.data?.message || 'Erreur'); }
  };

  const removeCredits = async (id) => {
    const credits = creditInput[`remove_${id}`];
    if (!credits || credits <= 0) return;
    try {
      await api.post(`/admin/users/${id}/remove-credits`, { credits: Number(credits) });
      setCreditInput({ ...creditInput, [`remove_${id}`]: '' });
      fetchUsers();
    } catch (err) { Alert.alert('', err.response?.data?.message || 'Erreur'); }
  };

  const toggleVerified = async (id, current) => {
    try { await api.post(`/admin/users/${id}/set-verified`, { isVerified: !current }); fetchUsers(); }
    catch (err) { Alert.alert('', err.response?.data?.message || 'Erreur'); }
  };

  const toggleAdmin = async (id, role) => {
    try {
      if (role === 'admin_simple') await api.delete(`/admin/admins/${id}`);
      else await api.post('/admin/admins/add', { userId: id });
      fetchUsers();
    } catch (err) { Alert.alert('', err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <Loader fullScreen />;

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || u.telephone.includes(searchTerm)
  );

  return (
    <Screen>
      <Text style={styles.title}>Utilisateurs ({filteredUsers.length})</Text>
      <FormInput placeholder="Rechercher par nom ou téléphone..." value={searchTerm} onChangeText={setSearchTerm} />

      {filteredUsers.map(u => (
        <Card key={u._id} style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{u.nom}</Text>
                {u.isVerified && <Check size={16} color={colors.accent} />}
              </View>
              <View style={styles.phoneRow}>
                <Phone size={12} color={colors.textLight} />
                <Text style={styles.phone}>{u.telephone}</Text>
              </View>
              <View style={styles.badgeRow}>
                <Badge variant="primary">{ROLE_LABELS[u.role] || u.role}</Badge>
                <View style={styles.creditBadge}>
                  <Coins size={13} color="#fff" />
                  <Text style={styles.creditText}>{u.credits}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Button
              title={u.isVerified ? 'Retirer badge' : 'Vérifier'}
              variant="secondary"
              size="sm"
              onPress={() => toggleVerified(u._id, u.isVerified)}
            />
            <Pressable style={styles.deleteIconBtn} onPress={() => deleteUser(u._id)}>
              <Trash2 size={14} color="#fff" />
            </Pressable>
            {isSupremeAdmin && u.role !== 'admin_supreme' && (
              <Button
                title={u.role === 'admin_simple' ? 'Retirer admin' : 'Nommer admin'}
                variant={u.role === 'admin_simple' ? 'danger' : 'primary'}
                size="sm"
                onPress={() => toggleAdmin(u._id, u.role)}
              />
            )}
          </View>

          <View style={styles.creditRow}>
            <FormInput
              placeholder="Crédits à ajouter"
              keyboardType="numeric"
              value={creditInput[u._id] || ''}
              onChangeText={v => setCreditInput({ ...creditInput, [u._id]: v })}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button title="+ Crédits" variant="success" size="sm" onPress={() => addCredits(u._id)} />
          </View>

          <View style={styles.creditRow}>
            <FormInput
              placeholder="Crédits à retirer"
              keyboardType="numeric"
              value={creditInput[`remove_${u._id}`] || ''}
              onChangeText={v => setCreditInput({ ...creditInput, [`remove_${u._id}`]: v })}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button title="- Crédits" variant="danger" size="sm" onPress={() => removeCredits(u._id)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  card: { padding: 12, marginBottom: 10 },
  cardTop: { marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '600' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  phone: { fontSize: 12, color: colors.textLight },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  creditBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  creditText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' },
  deleteIconBtn: { backgroundColor: colors.danger, padding: 7, borderRadius: 8 },
  creditRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
});
