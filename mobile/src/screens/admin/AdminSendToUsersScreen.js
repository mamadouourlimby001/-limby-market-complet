import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, FormInput, AlertBanner } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminSendToUsersScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState('single');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (mode === 'single') fetchUsers();
  }, [mode]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/messages/admin/users');
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!contenu.trim()) { setMessage('Veuillez écrire un message'); return; }
    if (mode === 'single' && !selectedUser) { setMessage('Veuillez sélectionner un utilisateur'); return; }
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'single') {
        await api.post('/messages/admin/send-to-user', { userId: selectedUser, contenu });
      } else {
        await api.post('/messages/admin/broadcast', { contenu });
      }
      setMessage('Message envoyé avec succès');
      setContenu('');
      setSelectedUser('');
      setSearchTerm('');
      setTimeout(() => navigation.navigate('AdminMessages'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || u.telephone.includes(searchTerm)
  );

  const selectedUserObj = users.find(u => u._id === selectedUser);

  return (
    <Screen>
      <Text style={styles.title}>Écrire aux utilisateurs</Text>

      <View style={styles.modeRow}>
        {['single', 'all'].map(m => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'single' ? 'À un utilisateur' : 'À tous les utilisateurs'}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'single' && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Sélectionner un utilisateur</Text>
          <FormInput
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChangeText={(v) => { setSearchTerm(v); setShowUserList(true); }}
          />
          {selectedUserObj && !showUserList && (
            <View style={styles.selectedUser}>
              <Text style={styles.selectedUserText}>{selectedUserObj.nom} ({selectedUserObj.telephone})</Text>
              <Pressable onPress={() => { setSelectedUser(''); setSearchTerm(''); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            </View>
          )}
          {showUserList && filteredUsers.length > 0 && (
            <ScrollView style={styles.userList} nestedScrollEnabled>
              {filteredUsers.map(u => (
                <Pressable key={u._id} style={styles.userItem} onPress={() => {
                  setSelectedUser(u._id);
                  setSearchTerm('');
                  setShowUserList(false);
                }}>
                  <Text style={styles.userName}>{u.nom}</Text>
                  <Text style={styles.userPhone}>{u.telephone}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {mode === 'all' && (
        <AlertBanner variant="info" style={{ marginBottom: 12 }}>
          ⓘ Ce message sera envoyé à tous les utilisateurs du site
        </AlertBanner>
      )}

      <Text style={styles.label}>Message</Text>
      <TextInput
        value={contenu}
        onChangeText={setContenu}
        placeholder="Votre message..."
        maxLength={500}
        multiline
        numberOfLines={6}
        style={styles.textarea}
      />
      <Text style={styles.charCount}>{contenu.length}/500 caractères</Text>

      {message ? (
        <AlertBanner variant={message.includes('succès') ? 'success' : 'danger'}>{message}</AlertBanner>
      ) : null}

      <Button
        title={loading ? 'Envoi en cours...' : 'Envoyer'}
        block
        loading={loading}
        disabled={!contenu.trim() || (mode === 'single' && !selectedUser)}
        onPress={handleSubmit}
        style={{ marginTop: 8 }}
      />
      <Button title="Annuler" variant="secondary" block onPress={() => navigation.navigate('AdminMessages')} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modeBtn: { flex: 1, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 6, alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  modeBtnTextActive: { color: '#fff' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  selectedUser: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: 10, borderRadius: 6, marginTop: 6 },
  selectedUserText: { fontSize: 13, color: colors.primary },
  clearBtn: { fontSize: 16, color: colors.danger, fontWeight: '700' },
  userList: { maxHeight: 180, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: '#fff' },
  userItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  userName: { fontSize: 13, fontWeight: '600' },
  userPhone: { fontSize: 11, color: colors.textLight },
  textarea: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 12, fontSize: 13, minHeight: 120, textAlignVertical: 'top', marginBottom: 4 },
  charCount: { fontSize: 11, color: '#666', marginBottom: 12 },
});
