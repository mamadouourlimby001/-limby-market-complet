import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, User, Clock } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Button, FormInput, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/UserBoutiqueMessages.jsx
export default function UserBoutiqueMessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/boutique-messages/user-boutique-messages');
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMessages(); }, []));

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) {
      Alert.alert('', 'Écrivez une réponse');
      return;
    }
    setReplying((prev) => ({ ...prev, [id]: true }));
    try {
      await api.post(`/boutique-messages/${id}/boutique-reply`, { contenu: replyText[id] });
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      await fetchMessages();
      Alert.alert('', 'Réponse envoyée');
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur');
    } finally {
      setReplying((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/boutique-messages/${id}/boutique-read`);
      await fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setIsDeletingId(id);
          try {
            await api.delete(`/boutique-messages/${id}/boutique-delete`);
            await fetchMessages();
            setExpandedId(null);
            Alert.alert('', 'Message supprimé avec succès');
          } catch (err) {
            Alert.alert('', err.response?.data?.message || 'Erreur lors de la suppression');
          } finally {
            setIsDeletingId(null);
          }
        },
      },
    ]);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Messages des Boutiques</Text>

      {messages.length === 0 ? (
        <EmptyState icon={<MessageCircle size={32} color={colors.textLight} />} text="Aucun message des boutiques" />
      ) : (
        messages.map((msg) => {
          const expanded = expandedId === msg._id;
          return (
            <Card key={msg._id} style={styles.card}>
              <Pressable
                style={styles.headerRow}
                onPress={() => setExpandedId(expanded ? null : msg._id)}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{msg.boutique?.nom}</Text>
                    {!msg.readBy && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>Non lu</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.preview}>{msg.contenu.substring(0, 60)}...</Text>
                </View>
                <View style={styles.dateRow}>
                  <Clock size={12} color="#9ca3af" />
                  <Text style={styles.date}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</Text>
                </View>
              </Pressable>

              {expanded && (
                <View style={styles.expanded}>
                  <View style={styles.bubbleMain}>
                    <View style={styles.bubbleHeader}>
                      <User size={14} color={colors.text} />
                      <Text style={styles.bubbleHeaderText}>{msg.boutique?.nom}</Text>
                    </View>
                    <Text style={styles.bubbleText}>{msg.contenu}</Text>
                    <Text style={styles.bubbleDate}>
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {msg.replies?.length > 0 && (
                    <View style={styles.bubbleReplies}>
                      <Text style={styles.repliesTitle}>Vos réponses:</Text>
                      {msg.replies.map((reply, idx) => (
                        <View key={idx} style={{ marginBottom: 8 }}>
                          <Text style={styles.replyDate}>
                            {new Date(reply.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.replyText}>{reply.contenu}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <FormInput
                    placeholder="Votre réponse..."
                    value={replyText[msg._id] || ''}
                    onChangeText={(v) => setReplyText((prev) => ({ ...prev, [msg._id]: v }))}
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.actionsRow}>
                    <Button
                      title={replying[msg._id] ? 'Envoi...' : 'Répondre'}
                      loading={replying[msg._id]}
                      style={{ flex: 1 }}
                      onPress={() => handleReply(msg._id)}
                    />
                    {!msg.readBy && (
                      <Button title="Marquer lu" variant="success" style={{ flex: 1 }} onPress={() => handleMarkRead(msg._id)} />
                    )}
                    <Button
                      title={isDeletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                      variant="danger"
                      style={{ flex: 1 }}
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
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  card: { padding: 12, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '700', color: colors.primary },
  unreadBadge: { paddingVertical: 2, paddingHorizontal: 6, backgroundColor: '#3b82f6', borderRadius: 3 },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  preview: { fontSize: 12, color: colors.textLight },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 10, color: '#9ca3af' },
  expanded: { paddingTop: 12 },
  bubbleMain: { marginBottom: 12, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.primary },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  bubbleHeaderText: { fontSize: 12, fontWeight: '600' },
  bubbleText: { fontSize: 13, color: '#1f2937', lineHeight: 19 },
  bubbleDate: { fontSize: 10, color: '#9ca3af', marginTop: 8 },
  bubbleReplies: { marginBottom: 12, padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.success },
  repliesTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, color: colors.success },
  replyDate: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  replyText: { fontSize: 12, color: '#1f2937', lineHeight: 18 },
  actionsRow: { flexDirection: 'row', gap: 8 },
});
