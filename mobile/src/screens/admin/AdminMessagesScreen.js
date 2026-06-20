import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminMessagesScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages/admin/messages');
      setMessages(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkAsRead = async (messageId) => {
    try { await api.put(`/messages/${messageId}/read`); await fetchMessages(); }
    catch (err) { console.error(err); }
  };

  const handleDelete = (messageId) => {
    Alert.alert('', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setIsDeletingId(messageId);
        try {
          await api.delete(`/messages/${messageId}`);
          await fetchMessages();
          setExpandedId(null);
          Alert.alert('', 'Message supprimé avec succès');
        } catch (err) {
          Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
          setIsDeletingId(null);
        }
      }},
    ]);
  };

  const handleReply = async (parentId) => {
    if (!replyContent[parentId]?.trim()) { Alert.alert('', 'Veuillez écrire une réponse'); return; }
    setReplyLoading(prev => ({ ...prev, [parentId]: true }));
    try {
      await api.post(`/messages/${parentId}/reply`, { contenu: replyContent[parentId] });
      setReplyContent(prev => ({ ...prev, [parentId]: '' }));
      setExpandedId(null);
      await fetchMessages();
      Alert.alert('', 'Réponse envoyée avec succès');
    } catch (err) {
      Alert.alert('', err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  if (loading) return <Loader fullScreen />;

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

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Messages des utilisateurs</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <Button
        title="Écrire aux utilisateurs"
        block
        onPress={() => navigation.navigate('AdminSendToUsers')}
        style={{ marginBottom: 16 }}
      />

      {conversations.length === 0 ? (
        <Text style={styles.empty}>Aucun message</Text>
      ) : (
        conversations.map(conv => {
          const msg = conv.mainMessage;
          const isUnread = msg.readBy?.find(r => !r.readAt);
          return (
            <Card key={msg._id} style={[styles.card, isUnread && styles.cardUnread]}>
              <Pressable
                onPress={() => {
                  if (isUnread) handleMarkAsRead(msg._id);
                  setExpandedId(expandedId === msg._id ? null : msg._id);
                }}
                style={styles.cardHeader}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.sender}>{msg.sender?.nom}</Text>
                  <Text style={styles.senderPhone}>{msg.sender?.telephone}</Text>
                  <Text style={styles.preview} numberOfLines={1}>{msg.contenu}</Text>
                  <Text style={styles.date}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</Text>
                </View>
                {isUnread && <View style={styles.dot} />}
              </Pressable>

              {expandedId === msg._id && (
                <View style={styles.expanded}>
                  <View style={styles.msgBox}>
                    <Text style={styles.msgText}>{msg.contenu}</Text>
                  </View>

                  {conv.replies.map(reply => (
                    <View key={reply._id} style={[styles.replyBox, { borderLeftColor: reply.senderType === 'user' ? '#999' : '#4CAF50', backgroundColor: reply.senderType === 'user' ? '#f0f0f0' : '#e8f5e9' }]}>
                      <Text style={styles.replyName}>{reply.sender?.nom}</Text>
                      <Text style={styles.replyText}>{reply.contenu}</Text>
                      <Text style={styles.replyDate}>{new Date(reply.createdAt).toLocaleDateString('fr-FR')}</Text>
                    </View>
                  ))}

                  <TextInput
                    value={replyContent[msg._id] || ''}
                    onChangeText={v => setReplyContent(prev => ({ ...prev, [msg._id]: v }))}
                    placeholder="Votre réponse..."
                    maxLength={500}
                    multiline
                    numberOfLines={3}
                    style={styles.replyInput}
                  />

                  <View style={styles.actionRow}>
                    <Button
                      title={replyLoading[msg._id] ? 'Envoi...' : 'Répondre'}
                      style={{ flex: 1 }}
                      loading={replyLoading[msg._id]}
                      onPress={() => handleReply(msg._id)}
                    />
                    <Button
                      title={isDeletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                      variant="danger"
                      loading={isDeletingId === msg._id}
                      onPress={() => handleDelete(msg._id)}
                    />
                  </View>
                </View>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  unreadBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dc3545', alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', padding: 20, color: '#666' },
  card: { padding: 12, marginBottom: 10 },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: '#dc3545' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sender: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  senderPhone: { fontSize: 11, color: '#666', marginBottom: 4 },
  preview: { fontSize: 13, color: '#333', marginBottom: 4 },
  date: { fontSize: 11, color: '#999' },
  dot: { width: 8, height: 8, backgroundColor: '#dc3545', borderRadius: 4, marginTop: 4 },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  msgBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 4, marginBottom: 12 },
  msgText: { fontSize: 13, color: '#333', lineHeight: 18 },
  replyBox: { padding: 8, borderRadius: 4, marginBottom: 8, borderLeftWidth: 3 },
  replyName: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  replyText: { fontSize: 12, lineHeight: 18 },
  replyDate: { fontSize: 10, color: '#999', marginTop: 4 },
  replyInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, fontSize: 12, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 6 },
});
