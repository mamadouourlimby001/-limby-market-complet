import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function MessagesAdminsScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages/my-messages');
      setMessages(res.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post('/messages/send-to-admins', { contenu: newMessage.trim() });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isAdmin = item.senderType === 'admin';
    const replies = item.replies || [];

    return (
      <View style={styles.messageGroup}>
        <View style={[styles.messageBubble, isAdmin ? styles.adminBubble : styles.myBubble]}>
          {isAdmin && (
            <Text style={styles.senderLabel}>Admin</Text>
          )}
          <Text style={styles.messageText}>{item.contenu}</Text>
          <Text style={styles.messageDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>

        {replies.map((reply) => (
          <View
            key={reply._id}
            style={[
              styles.messageBubble,
              reply.senderType === 'admin' ? styles.adminBubble : styles.myBubble,
            ]}
          >
            {reply.senderType === 'admin' && (
              <Text style={styles.senderLabel}>Admin</Text>
            )}
            <Text style={styles.messageText}>{reply.contenu}</Text>
            <Text style={styles.messageDate}>
              {new Date(reply.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Support Limby</Text>
          <Text style={styles.subtitle}>Contactez un administrateur</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptyDesc}>
              Écrivez un message pour contacter l'équipe Limby
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            inverted={false}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Écrivez votre message..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backText: { fontSize: 22, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 11, color: Colors.textMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyDesc: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  messageList: { padding: 12, paddingBottom: 8 },
  messageGroup: { marginBottom: 12 },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  messageDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendIcon: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
