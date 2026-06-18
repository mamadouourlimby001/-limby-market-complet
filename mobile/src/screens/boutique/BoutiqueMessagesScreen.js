import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, User, Clock } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, EmptyState, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function BoutiqueMessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/boutique-messages/boutique-inbox');
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMessages(); }, []));

  const handleReply = async (messageId) => {
    if (!replyText[messageId]?.trim()) {
      Alert.alert('', 'Écrivez une réponse');
      return;
    }
    setReplying(prev => ({ ...prev, [messageId]: true }));
    try {
      await api.post(`/boutique-messages/${messageId}/boutique-reply`, { contenu: replyText[messageId] });
      setReplyText(prev => ({ ...prev, [messageId]: '' }));
      await fetchMessages();
      Alert.alert('', 'Réponse envoyée');
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur');
    } finally {
      setReplying(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleMarkRead = async (messageId) => {
    try {
      await api.put(`/boutique-messages/${messageId}/boutique-read`);
      await fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (messageId) => {
    Alert.alert('', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setIsDeletingId(messageId);
        try {
          await api.delete(`/boutique-messages/${messageId}/boutique-delete`);
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

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <Text style={styles.title}>Messages Reçus</Text>

      {messages.length === 0 ? (
        <EmptyState icon={<MessageCircle size={32} color={colors.textLight} />} text="Aucun message" />
      ) : (
        messages.map(msg => (
          <Card key={msg._id} style={styles.card}>
            <Pressable
              onPress={() => setExpandedId(expandedId === msg._id ? null : msg._id)}
              style={styles.cardHeader}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.senderRow}>
                  <User size={14} color={colors.text} />
                  <Text style={styles.senderName}>{msg.sender?.nom}</Text>
                  {!msg.readBy && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>Non lu</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.preview} numberOfLines={2}>{msg.contenu}</Text>
              </View>
              <View style={styles.dateSide}>
                <Clock size={12} color="#9ca3af" />
                <Text style={styles.dateText}>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</Text>
              </View>
            </Pressable>

            {expandedId === msg._id && (
              <View style={styles.expanded}>
                <View style={styles.originalMsg}>
                  <View style={styles.senderRow}>
                    <User size={14} color={colors.text} />
                    <Text style={styles.senderName}>{msg.sender?.nom} ({msg.sender?.telephone})</Text>
                  </View>
                  <Text style={styles.originalText}>{msg.contenu}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {msg.replies?.length > 0 && (
                  <View style={styles.repliesBox}>
                    <Text style={styles.repliesTitle}>Vos réponses:</Text>
                    {msg.replies.map((reply, idx) => (
                      <View key={idx} style={styles.replyItem}>
                        <Text style={styles.replyDate}>
                          {new Date(reply.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={styles.replyText}>{reply.contenu}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TextInput
                  value={replyText[msg._id] || ''}
                  onChangeText={v => setReplyText(prev => ({ ...prev, [msg._id]: v }))}
                  placeholder="Votre réponse..."
                  multiline
                  numberOfLines={3}
                  style={styles.replyInput}
                />

                <View style={styles.actionRow}>
                  <Button
                    title={replying[msg._id] ? 'Envoi...' : 'Répondre'}
                    style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                    loading={replying[msg._id]}
                    onPress={() => handleReply(msg._id)}
                  />
                  {!msg.readBy && (
                    <Button
                      title="Marquer lu"
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleMarkRead(msg._id)}
                    />
                  )}
                  <Button
                    title={isDeletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                    variant="danger"
                    style={styles.actionBtn}
                    loading={isDeletingId === msg._id}
                    onPress={() => handleDelete(msg._id)}
                  />
                </View>
              </View>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  card: { padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  senderName: { fontSize: 13, fontWeight: '600' },
  unreadBadge: { backgroundColor: '#3b82f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  preview: { fontSize: 12, color: colors.textLight },
  dateSide: { alignItems: 'center', gap: 2, marginLeft: 8 },
  dateText: { fontSize: 10, color: '#9ca3af' },
  expanded: { paddingTop: 12 },
  originalMsg: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#3b82f6', marginBottom: 12 },
  originalText: { fontSize: 13, color: '#1f2937', lineHeight: 20, marginTop: 4 },
  timestamp: { fontSize: 10, color: '#9ca3af', marginTop: 8 },
  repliesBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: colors.success, marginBottom: 12 },
  repliesTitle: { fontSize: 12, fontWeight: '600', color: colors.success, marginBottom: 8 },
  replyItem: { marginBottom: 8 },
  replyDate: { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  replyText: { fontSize: 12, color: '#1f2937' },
  replyInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 10, fontSize: 12, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1 },
});
