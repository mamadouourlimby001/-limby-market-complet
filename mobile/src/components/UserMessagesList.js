import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import Loader from './ui/Loader';
import { colors } from '../theme/theme';

// Portage de frontend/src/pages/UserMessages.jsx (utilisé "embedded" dans l'onglet
// Messages de UserDashboard, comme côté web).
export default function UserMessagesList() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [boutiqueMessages, setBoutiqueMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const [adminRes, boutiqueRes] = await Promise.all([
        api.get('/messages/my-messages').catch(() => ({ data: { data: [], unreadCount: 0 } })),
        api.get('/boutique-messages/user-boutique-messages').catch(() => ({ data: { data: [], unreadCount: 0 } })),
      ]);
      setMessages(adminRes.data.data || []);
      setBoutiqueMessages(boutiqueRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [])
  );

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoutiqueMarkAsRead = async (id) => {
    try {
      await api.put(`/boutique-messages/${id}/boutique-read`);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id, isAdmin) => {
    Alert.alert('', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setIsDeletingId(id);
          try {
            await api.delete(isAdmin ? `/messages/${id}` : `/boutique-messages/${id}/boutique-delete`);
            setExpandedId(null);
            await fetchMessages();
            Alert.alert('', 'Message supprimé');
          } catch (err) {
            Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
          } finally {
            setIsDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleReply = async (id, isAdmin) => {
    if (!replyContent[id]?.trim()) {
      Alert.alert('', 'Veuillez écrire une réponse');
      return;
    }
    setReplyLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.post(isAdmin ? `/messages/${id}/reply` : `/boutique-messages/${id}/boutique-reply`, {
        contenu: replyContent[id],
      });
      setReplyContent((prev) => ({ ...prev, [id]: '' }));
      setExpandedId(null);
      await fetchMessages();
      Alert.alert('', 'Réponse envoyée avec succès');
    } catch (err) {
      Alert.alert('', err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setReplyLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <Loader />;

  const groupedMessages = {};
  messages.forEach((msg) => {
    const groupId = msg.parentMessage || msg._id;
    (groupedMessages[groupId] ||= []).push(msg);
  });
  const adminConversations = Object.values(groupedMessages).map((group) => ({
    mainMessage: group.find((m) => !m.parentMessage) || group[0],
    replies: group.filter((m) => m.parentMessage),
    type: 'admin',
  }));

  const flatBoutiqueMessages = [];
  boutiqueMessages.forEach((msg) => {
    flatBoutiqueMessages.push(msg);
    if (msg.replies?.length) flatBoutiqueMessages.push(...msg.replies);
  });
  const groupedBoutiqueMessages = {};
  flatBoutiqueMessages.forEach((msg) => {
    const groupId = msg.parentMessage || msg._id;
    (groupedBoutiqueMessages[groupId] ||= []).push(msg);
  });
  const boutiqueConversations = Object.values(groupedBoutiqueMessages).map((group) => ({
    mainMessage: group.find((m) => !m.parentMessage) || group[0],
    replies: group.filter((m) => m.parentMessage),
    type: 'boutique',
  }));

  const allConversations = [...adminConversations, ...boutiqueConversations].sort(
    (a, b) => new Date(b.mainMessage.createdAt) - new Date(a.mainMessage.createdAt)
  );

  if (allConversations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucun message</Text>
        <Pressable onPress={() => navigation.navigate('SendMessageToAdmins')}>
          <Text style={styles.emptyLink}>Écrire aux administrateurs</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {allConversations.map((conv) => {
        const msg = conv.mainMessage;
        const isAdmin = conv.type === 'admin';
        const isUnread = isAdmin ? !msg.readBy?.find((r) => r.readAt) : !msg.readBy;
        const expanded = expandedId === msg._id;

        return (
          <Card key={msg._id} style={styles.card}>
            <Pressable
              onPress={() => {
                if (isUnread) (isAdmin ? handleMarkAsRead : handleBoutiqueMarkAsRead)(msg._id);
                setExpandedId(expanded ? null : msg._id);
              }}
              style={[styles.headerRow, { borderLeftColor: isAdmin ? colors.primary : '#667eea' }]}
            >
              <View style={styles.headerText}>
                <Text style={styles.sender}>
                  {msg.sender?.nom} {msg.isGroupMessage ? '(message de groupe)' : ''}
                </Text>
                <Text style={styles.role}>
                  {isAdmin ? (msg.sender?.role === 'admin_simple' ? 'Admin' : 'Admin Suprême') : `Boutique: ${msg.boutique?.nom || 'N/A'}`}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>{msg.contenu}</Text>
                <Text style={styles.date}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</Text>
              </View>
              {isUnread ? <View style={styles.dot} /> : null}
            </Pressable>

            {expanded && (
              <View style={styles.expanded}>
                <View style={styles.bubbleMain}>
                  <Text style={styles.bubbleText}>{msg.contenu}</Text>
                </View>

                {conv.replies.map((reply) => (
                  <View
                    key={reply._id}
                    style={[
                      styles.bubbleReply,
                      { backgroundColor: isAdmin || reply.senderType === 'boutique' ? '#f0f0f0' : '#e8f5e9', borderLeftColor: isAdmin ? colors.primary : '#667eea' },
                    ]}
                  >
                    <Text style={styles.replySender}>{reply.sender?.nom}</Text>
                    <Text style={styles.replyText}>{reply.contenu}</Text>
                    <Text style={styles.date}>{new Date(reply.createdAt).toLocaleDateString('fr-FR')}</Text>
                  </View>
                ))}

                <FormInput
                  value={replyContent[msg._id] || ''}
                  onChangeText={(v) => setReplyContent((prev) => ({ ...prev, [msg._id]: v }))}
                  placeholder="Votre réponse..."
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.actionsRow}>
                  <Button
                    title={replyLoading[msg._id] ? 'Envoi...' : 'Répondre'}
                    loading={replyLoading[msg._id]}
                    style={{ flex: 1 }}
                    onPress={() => handleReply(msg._id, isAdmin)}
                  />
                  <Button
                    title={isDeletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                    variant="danger"
                    loading={isDeletingId === msg._id}
                    onPress={() => handleDelete(msg._id, isAdmin)}
                  />
                </View>
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderLeftWidth: 4, paddingLeft: 8 },
  headerText: { flex: 1 },
  sender: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  role: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  preview: { fontSize: 13, color: colors.text },
  date: { fontSize: 11, color: '#999', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc3545', marginLeft: 12 },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  bubbleMain: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 4, marginBottom: 12 },
  bubbleText: { fontSize: 13, color: colors.text },
  bubbleReply: { padding: 8, borderRadius: 4, marginBottom: 8, borderLeftWidth: 3 },
  replySender: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  replyText: { fontSize: 12, color: colors.text },
  actionsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  empty: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#666', marginBottom: 6 },
  emptyLink: { color: colors.primary, fontWeight: '600' },
});
