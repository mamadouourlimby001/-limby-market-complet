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

export default function UserMessagesScreen() {
  const [adminMessages, setAdminMessages] = useState([]);
  const [boutiqueMessages, setBoutiqueMessages] = useState([]);
  const [unreadAdmin, setUnreadAdmin] = useState(0);
  const [unreadBoutique, setUnreadBoutique] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const [adminRes, boutiqueRes] = await Promise.all([
        api.get('/messages/my-messages').catch(() => ({ data: { data: [], unreadCount: 0 } })),
        api.get('/boutique-messages/user-boutique-messages').catch(() => ({ data: { data: [], unreadCount: 0 } })),
      ]);
      setAdminMessages(adminRes.data.data || adminRes.data || []);
      setUnreadAdmin(adminRes.data.unreadCount || 0);
      setBoutiqueMessages(boutiqueRes.data.data || []);
      setUnreadBoutique(boutiqueRes.data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const handleMarkAdminRead = async (id) => {
    try { await api.put(`/messages/${id}/read`); await fetchMessages(); }
    catch { /* ignore */ }
  };

  const handleDeleteAdmin = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeletingId(id);
          try {
            await api.delete(`/messages/${id}`);
            setExpandedId(null);
            await fetchMessages();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  };

  const handleDeleteBoutique = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeletingId(id);
          try {
            await api.delete(`/boutique-messages/${id}/boutique-delete`);
            setExpandedId(null);
            await fetchMessages();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  };

  const handleMarkBoutiqueRead = async (id) => {
    try { await api.put(`/boutique-messages/${id}/boutique-read`); await fetchMessages(); }
    catch { /* ignore */ }
  };

  const handleReplyAdmin = async (parentId) => {
    if (!replyContent[parentId]?.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire une réponse');
      return;
    }
    setReplyLoading(prev => ({ ...prev, [parentId]: true }));
    try {
      await api.post(`/messages/${parentId}/reply`, { contenu: replyContent[parentId] });
      setReplyContent(prev => ({ ...prev, [parentId]: '' }));
      setExpandedId(null);
      await fetchMessages();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleReplyBoutique = async (id) => {
    if (!replyContent[id]?.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire une réponse');
      return;
    }
    setReplyLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/boutique-messages/${id}/boutique-reply`, { contenu: replyContent[id] });
      setReplyContent(prev => ({ ...prev, [id]: '' }));
      setExpandedId(null);
      await fetchMessages();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setReplyLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Build combined conversations
  const groupedAdmin = {};
  adminMessages.forEach(msg => {
    const groupId = msg.parentMessage || msg._id;
    if (!groupedAdmin[groupId]) groupedAdmin[groupId] = [];
    groupedAdmin[groupId].push(msg);
  });

  const adminConversations = Object.values(groupedAdmin).map(group => ({
    mainMessage: group.find(m => !m.parentMessage) || group[0],
    replies: group.filter(m => m.parentMessage),
    type: 'admin',
  }));

  const boutiqueConversations = boutiqueMessages.map(msg => ({
    mainMessage: msg,
    replies: msg.replies || [],
    type: 'boutique',
  }));

  const all = [...adminConversations, ...boutiqueConversations]
    .sort((a, b) => new Date(b.mainMessage.createdAt) - new Date(a.mainMessage.createdAt));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const totalUnread = unreadAdmin + unreadBoutique;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/messages/admins')}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {all.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun message</Text>
            <TouchableOpacity style={styles.writeBtn} onPress={() => router.push('/messages/admins')}>
              <Text style={styles.writeBtnText}>Écrire aux administrateurs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          all.map(conv => {
            const msg = conv.mainMessage;
            const isAdmin = conv.type === 'admin';
            const isExpanded = expandedId === msg._id;
            const accentColor = isAdmin ? Colors.primary : '#667eea';

            return (
              <TouchableOpacity
                key={msg._id}
                style={[styles.card, { borderLeftColor: accentColor }]}
                onPress={() => setExpandedId(isExpanded ? null : msg._id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.senderName, { color: accentColor }]}>
                      {isAdmin ? (msg.sender?.nom || 'Admin') : (msg.boutique?.nom || 'Boutique')}
                    </Text>
                    <Text style={styles.senderType}>
                      {isAdmin
                        ? (msg.sender?.role === 'admin_simple' ? 'Admin' : 'Admin Suprême')
                        : `Boutique: ${msg.boutique?.nom || 'N/A'}`}
                    </Text>
                    <Text style={styles.preview} numberOfLines={1}>{msg.contenu}</Text>
                    <Text style={styles.dateText}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.expanded}>
                    <View style={[styles.msgBox, { borderLeftColor: accentColor }]}>
                      <Text style={styles.msgText}>{msg.contenu}</Text>
                    </View>

                    {conv.replies.map((reply, idx) => (
                      <View key={idx} style={styles.replyBox}>
                        <Text style={styles.replyName}>{reply.sender?.nom || 'Vous'}</Text>
                        <Text style={styles.replyText}>{reply.contenu}</Text>
                        <Text style={styles.replyDate}>{new Date(reply.createdAt).toLocaleDateString('fr-FR')}</Text>
                      </View>
                    ))}

                    <TextInput
                      style={styles.replyInput}
                      value={replyContent[msg._id] || ''}
                      onChangeText={v => setReplyContent(prev => ({ ...prev, [msg._id]: v }))}
                      placeholder="Votre réponse..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: accentColor }, replyLoading[msg._id] && styles.btnDisabled]}
                        onPress={() => isAdmin ? handleReplyAdmin(msg._id) : handleReplyBoutique(msg._id)}
                        disabled={!!replyLoading[msg._id]}
                      >
                        <Text style={styles.btnText}>{replyLoading[msg._id] ? 'Envoi...' : 'Répondre'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnRed, deletingId === msg._id && styles.btnDisabled]}
                        onPress={() => isAdmin ? handleDeleteAdmin(msg._id) : handleDeleteBoutique(msg._id)}
                        disabled={deletingId === msg._id}
                      >
                        <Text style={styles.btnText}>{deletingId === msg._id ? '...' : 'Supprimer'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
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
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  badge: {
    backgroundColor: Colors.danger, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: 'bold' },
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  writeBtn: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  writeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10, padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  senderName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  senderType: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  preview: { fontSize: 13, color: Colors.textLight, marginBottom: 4 },
  dateText: { fontSize: 11, color: Colors.textMuted },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  msgBox: {
    backgroundColor: '#f3f4f6', borderRadius: 8,
    padding: 10, marginBottom: 10, borderLeftWidth: 3,
  },
  msgText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  replyBox: {
    backgroundColor: '#e8f5e9', borderRadius: 6,
    padding: 8, marginBottom: 8, borderLeftWidth: 2, borderLeftColor: Colors.success,
  },
  replyName: { fontSize: 11, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  replyText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  replyDate: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  replyInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 10, fontSize: 13, color: Colors.text,
    backgroundColor: Colors.inputBg, minHeight: 80,
    marginBottom: 10,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnRed: { backgroundColor: Colors.danger },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
