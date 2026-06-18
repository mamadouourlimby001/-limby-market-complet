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

export default function UserBoutiqueMessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/boutique-messages/user-boutique-messages');
      setMessages(res.data.data || []);
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

  const handleReply = async (messageId) => {
    if (!replyText[messageId]?.trim()) {
      Alert.alert('Erreur', 'Écrivez une réponse');
      return;
    }
    setReplying(prev => ({ ...prev, [messageId]: true }));
    try {
      await api.post(`/boutique-messages/${messageId}/boutique-reply`, { contenu: replyText[messageId] });
      setReplyText(prev => ({ ...prev, [messageId]: '' }));
      await fetchMessages();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setReplying(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleMarkRead = async (messageId) => {
    try {
      await api.put(`/boutique-messages/${messageId}/boutique-read`);
      await fetchMessages();
    } catch { /* ignore */ }
  };

  const handleDelete = (messageId) => {
    Alert.alert('Supprimer', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          setDeletingId(messageId);
          try {
            await api.delete(`/boutique-messages/${messageId}/boutique-delete`);
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

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages des Boutiques</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun message des boutiques</Text>
          </View>
        ) : (
          messages.map(msg => {
            const isExpanded = expandedId === msg._id;
            const isUnread = !msg.readBy;

            return (
              <View key={msg._id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : msg._id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.boutiqueName}>{msg.boutique?.nom}</Text>
                      {isUnread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.preview} numberOfLines={1}>
                      {msg.contenu}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expanded}>
                    <View style={[styles.msgBubble, styles.msgBubblePrimary]}>
                      <Text style={styles.msgBubbleAuthor}>{msg.boutique?.nom}</Text>
                      <Text style={styles.msgBubbleText}>{msg.contenu}</Text>
                      <Text style={styles.msgBubbleDate}>
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>

                    {msg.replies?.length > 0 && (
                      <View style={[styles.msgBubble, styles.msgBubbleGreen]}>
                        <Text style={[styles.msgBubbleAuthor, { color: Colors.success }]}>Vos réponses:</Text>
                        {msg.replies.map((reply, idx) => (
                          <View key={idx} style={{ marginBottom: 6 }}>
                            <Text style={styles.replyDate}>
                              {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                            </Text>
                            <Text style={styles.msgBubbleText}>{reply.contenu}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TextInput
                      style={styles.replyInput}
                      value={replyText[msg._id] || ''}
                      onChangeText={v => setReplyText(prev => ({ ...prev, [msg._id]: v }))}
                      placeholder="Votre réponse..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnBlue, replying[msg._id] && styles.btnDisabled]}
                        onPress={() => handleReply(msg._id)}
                        disabled={!!replying[msg._id]}
                      >
                        <Text style={styles.btnText}>{replying[msg._id] ? 'Envoi...' : 'Répondre'}</Text>
                      </TouchableOpacity>
                      {isUnread && (
                        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => handleMarkRead(msg._id)}>
                          <Text style={styles.btnText}>Marquer lu</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.btn, styles.btnRed, deletingId === msg._id && styles.btnDisabled]}
                        onPress={() => handleDelete(msg._id)}
                        disabled={deletingId === msg._id}
                      >
                        <Text style={styles.btnText}>{deletingId === msg._id ? '...' : 'Supprimer'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
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
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    marginHorizontal: 12, marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  boutiqueName: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3b82f6' },
  preview: { fontSize: 12, color: Colors.textLight },
  dateText: { fontSize: 10, color: Colors.textMuted, marginLeft: 8 },
  expanded: { padding: 12 },
  msgBubble: { borderRadius: 8, padding: 10, marginBottom: 10, borderLeftWidth: 3 },
  msgBubblePrimary: { backgroundColor: '#f0f4ff', borderLeftColor: Colors.primary },
  msgBubbleGreen: { backgroundColor: '#f0fdf4', borderLeftColor: Colors.success },
  msgBubbleAuthor: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  msgBubbleText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  msgBubbleDate: { fontSize: 10, color: Colors.textMuted, marginTop: 6 },
  replyDate: { fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  replyInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 10, fontSize: 13, color: Colors.text,
    backgroundColor: Colors.inputBg, minHeight: 70,
    marginBottom: 10,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 9, borderRadius: 7, alignItems: 'center' },
  btnBlue: { backgroundColor: '#3b82f6' },
  btnGreen: { backgroundColor: Colors.success },
  btnRed: { backgroundColor: Colors.danger },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
});
