import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminSendToUsers() {
  const [mode, setMode] = useState('single');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (mode === 'single') fetchUsers();
  }, [mode]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/messages/admin/users');
      setUsers(res.data.data || []);
    } catch { /* ignore */ }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.telephone.includes(search)
  );

  const handleSubmit = async () => {
    if (!contenu.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire un message');
      return;
    }
    if (mode === 'single' && !selectedUser) {
      Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'single') {
        await api.post('/messages/admin/send-to-user', { userId: selectedUser._id, contenu });
      } else {
        await api.post('/messages/admin/broadcast', { contenu });
      }
      setFeedback({ success: true, text: 'Message envoyé avec succès' });
      setContenu('');
      setSelectedUser(null);
      setSearch('');
      setTimeout(() => router.push('/admin/messages'), 1500);
    } catch (err) {
      setFeedback({ success: false, text: err.response?.data?.message || 'Erreur lors de l\'envoi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Écrire aux utilisateurs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.modePicker}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'single' && styles.modeBtnActive]}
            onPress={() => setMode('single')}
          >
            <Text style={[styles.modeBtnText, mode === 'single' && styles.modeBtnTextActive]}>
              À un utilisateur
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'all' && styles.modeBtnActive]}
            onPress={() => setMode('all')}
          >
            <Text style={[styles.modeBtnText, mode === 'all' && styles.modeBtnTextActive]}>
              À tous
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'single' && (
          <View style={styles.section}>
            <Text style={styles.label}>Sélectionner un utilisateur</Text>
            <TouchableOpacity
              style={styles.userPicker}
              onPress={() => setShowUserList(!showUserList)}
            >
              <Text style={selectedUser ? styles.userPickerSelected : styles.userPickerPlaceholder}>
                {selectedUser ? `${selectedUser.nom} (${selectedUser.telephone})` : '-- Choisir un utilisateur --'}
              </Text>
              <Ionicons name={showUserList ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            {showUserList && (
              <View style={styles.userListContainer}>
                <View style={styles.searchWrap}>
                  <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Rechercher..."
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <ScrollView style={styles.userList} nestedScrollEnabled>
                  {filteredUsers.map(u => (
                    <TouchableOpacity
                      key={u._id}
                      style={[styles.userItem, selectedUser?._id === u._id && styles.userItemSelected]}
                      onPress={() => { setSelectedUser(u); setShowUserList(false); }}
                    >
                      <Text style={styles.userItemName}>{u.nom}</Text>
                      <Text style={styles.userItemPhone}>{u.telephone}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {mode === 'all' && (
          <View style={styles.broadcastInfo}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.broadcastText}>
              Ce message sera envoyé à tous les utilisateurs
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={styles.messageInput}
            value={contenu}
            onChangeText={setContenu}
            placeholder="Votre message..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{contenu.length}/500 caractères</Text>
        </View>

        {feedback && (
          <View style={[styles.feedback, feedback.success ? styles.feedbackSuccess : styles.feedbackError]}>
            <Text style={[styles.feedbackText, feedback.success ? styles.feedbackTextSuccess : styles.feedbackTextError]}>
              {feedback.text}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (loading || !contenu.trim() || (mode === 'single' && !selectedUser)) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !contenu.trim() || (mode === 'single' && !selectedUser)}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Envoyer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  container: { flex: 1 },
  modePicker: { flexDirection: 'row', margin: 12, gap: 8 },
  modeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#f0f0f0', alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  modeBtnTextActive: { color: Colors.white },
  section: { paddingHorizontal: 12, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  userPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 12, backgroundColor: Colors.card,
  },
  userPickerSelected: { fontSize: 14, color: Colors.text, flex: 1 },
  userPickerPlaceholder: { fontSize: 14, color: Colors.textMuted, flex: 1 },
  userListContainer: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    marginTop: 4, backgroundColor: Colors.card, maxHeight: 250,
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: Colors.text },
  userList: { maxHeight: 200 },
  userItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  userItemSelected: { backgroundColor: Colors.primaryOpacity },
  userItemName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  userItemPhone: { fontSize: 11, color: Colors.textMuted },
  broadcastInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 12, marginBottom: 16,
    backgroundColor: '#eff6ff', borderRadius: 8,
    padding: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  broadcastText: { fontSize: 13, color: Colors.primary, fontWeight: '600', flex: 1 },
  messageInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 12, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.card, minHeight: 140,
  },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
  feedback: { marginHorizontal: 12, marginBottom: 12, borderRadius: 8, padding: 12 },
  feedbackSuccess: { backgroundColor: '#d4edda' },
  feedbackError: { backgroundColor: '#f8d7da' },
  feedbackText: { fontSize: 13 },
  feedbackTextSuccess: { color: '#155724' },
  feedbackTextError: { color: '#721c24' },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 8,
    marginHorizontal: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  submitBtnDisabled: { backgroundColor: '#94a3b8' },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    backgroundColor: '#e5e7eb', borderRadius: 8,
    marginHorizontal: 12, paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
