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

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages/admin/messages');
      setMessages(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
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

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      await fetchMessages();
    } catch { /* ignore */ }
  };

  const handleDelete = (id) => {
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

  const handleReply = async (parentId) => {
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

  const groupedMessages = {};
  messages.forEach(msg => {
    const groupId = msg.parentMessage || msg._id;
    if (!groupedMessages[groupId]) groupedMessages[groupId] = [];
    groupedMessages[groupId].push(msg);
  });

  const conversations = Object.values(groupedMessages).map(group => ({
    mainMessage: group.find(m => !m.parentMessage) || group[0],
    replies: group.filter(m => m.parentMessage),
  }));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Messages utilisateurs</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/admin/send-to-users')}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun message</Text>
          </View>
        ) : (
          conversations.map(conv => {
            const msg = conv.mainMessage;
            const isUnread = msg.readBy?.find(r => !r.readAt);
            const isExpanded = expandedId === msg._id;

            return (
              <TouchableOpacity
                key={msg._id}
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => {
                  if (isUnread) handleMarkAsRead(msg._id);
                  setExpandedId(isExpanded ? null : msg._id);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.senderName}>{msg.sender?.nom}</Text>
                    <Text style={styles.senderPhone}>{msg.sender?.telephone}</Text>
                    <Text style={styles.preview} numberOfLines={isExpanded ? undefined : 1}>
                      {msg.contenu}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  {isUnread && <View style={styles.dot} />}
                </View>

                {isExpanded && (
                  <View style={styles.expanded}>
                    <View style={styles.msgBox}>
                      <Text style={styles.msgText}>{msg.contenu}</Text>
                    </View>

                    {conv.replies.map(reply => (
                      <View
                        key={reply._id}
                        style={[styles.replyBox, reply.senderType === 'user' ? styles.replyUser : styles.replyAdmin]}
                      >
                        <Text style={styles.replyName}>{reply.sender?.nom}</Text>
                        <Text style={styles.replyText}>{reply.contenu}</Text>
                        <Text style={styles.replyDate}>
                          {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
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
                    />
                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, replyLoading[msg._id] && styles.btnDisabled]}
                        onPress={() => handleReply(msg._id)}
                        disabled={replyLoading[msg._id]}
                      >
                        <Text style={styles.btnText}>
                          {replyLoading[msg._id] ? 'Envoi...' : 'Répondre'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnDanger, deletingId === msg._id && styles.btnDisabled]}
                        onPress={() => handleDelete(msg._id)}
                        disabled={deletingId === msg._id}
                      >
                        <Text style={styles.btnText}>
                          {deletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                        </Text>
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
  title: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  unreadBadge: {
    backgroundColor: Colors.danger, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: 'bold' },
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10, padding: 12,
    borderLeftWidth: 4, borderLeftColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardUnread: { borderLeftColor: Colors.danger },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  senderName: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 1 },
  senderPhone: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  preview: { fontSize: 13, color: Colors.textLight, marginBottom: 4 },
  dateText: { fontSize: 11, color: Colors.textMuted },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginLeft: 8, marginTop: 4 },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  msgBox: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 10, marginBottom: 10 },
  msgText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  replyBox: { borderRadius: 6, padding: 8, marginBottom: 6, borderLeftWidth: 3 },
  replyUser: { backgroundColor: '#f0f0f0', borderLeftColor: '#9ca3af' },
  replyAdmin: { backgroundColor: '#e8f5e9', borderLeftColor: Colors.success },
  replyName: { fontSize: 11, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  replyText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  replyDate: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  replyInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 10, fontSize: 13, color: Colors.text,
    backgroundColor: Colors.inputBg, minHeight: 80,
    textAlignVertical: 'top', marginBottom: 8,
  },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnDanger: { backgroundColor: Colors.danger },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
