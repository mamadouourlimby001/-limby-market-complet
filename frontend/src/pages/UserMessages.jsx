import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const UserMessages = ({ embedded = false }) => {
  const [messages, setMessages] = useState([]);
  const [boutiquMessages, setBoutiqueMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadBoutiqueCount, setUnreadBoutiqueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    fetchMessages();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchMessages = async () => {
    try {
      const [adminRes, boutiqueRes] = await Promise.all([
        api.get('/messages/my-messages').catch(err => ({ data: { data: [], unreadCount: 0 } })),
        api.get('/boutique-messages/user-boutique-messages').catch(err => ({ data: { data: [], unreadCount: 0 } }))
      ]);
      setMessages(adminRes.data.data || []);
      setUnreadCount(adminRes.data.unreadCount || 0);
      setBoutiqueMessages(boutiqueRes.data.data || []);
      setUnreadBoutiqueCount(boutiqueRes.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    
    setIsDeletingId(messageId);
    try {
      await api.delete(`/messages/${messageId}`);
      setExpandedId(null);
      await fetchMessages();
      alert('Message supprimé');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleBoutiqueMarkAsRead = async (messageId) => {
    try {
      await api.put(`/boutique-messages/${messageId}/boutique-read`);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoutiqueDelete = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    
    setIsDeletingId(messageId);
    try {
      await api.delete(`/boutique-messages/${messageId}/boutique-delete`);
      setExpandedId(null);
      await fetchMessages();
      alert('Message supprimé');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleBoutiqueReply = async (messageId) => {
    if (!replyContent[messageId]?.trim()) {
      alert('Veuillez écrire une réponse');
      return;
    }

    setReplyLoading(prev => ({ ...prev, [messageId]: true }));
    try {
      await api.post(`/boutique-messages/${messageId}/boutique-reply`, {
        contenu: replyContent[messageId]
      });
      setReplyContent(prev => ({ ...prev, [messageId]: '' }));
      setExpandedId(null);
      await fetchMessages();
      alert('Réponse envoyée avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setReplyLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent[parentId]?.trim()) {
      alert('Veuillez écrire une réponse');
      return;
    }

    setReplyLoading(prev => ({ ...prev, [parentId]: true }));
    try {
      await api.post(`/messages/${parentId}/reply`, {
        contenu: replyContent[parentId]
      });
      setReplyContent(prev => ({ ...prev, [parentId]: '' }));
      setExpandedId(null);
      await fetchMessages();
      alert('Réponse envoyée avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  // Grouper les messages admin
  const groupedMessages = {};
  messages.forEach(msg => {
    const groupId = msg.parentMessage || msg._id;
    if (!groupedMessages[groupId]) {
      groupedMessages[groupId] = [];
    }
    groupedMessages[groupId].push(msg);
  });

  const adminConversations = Object.values(groupedMessages).map(group => ({
    mainMessage: group.find(m => !m.parentMessage) || group[0],
    replies: group.filter(m => m.parentMessage),
    type: 'admin'
  }));

  // Grouper les messages boutique
  const groupedBoutiqueMessages = {};
  boutiquMessages.forEach(msg => {
    const groupId = msg.parentMessage || msg._id;
    if (!groupedBoutiqueMessages[groupId]) {
      groupedBoutiqueMessages[groupId] = [];
    }
    groupedBoutiqueMessages[groupId].push(msg);
  });

  const boutiqueConversations = Object.values(groupedBoutiqueMessages).map(group => ({
    mainMessage: group.find(m => !m.parentMessage) || group[0],
    replies: group.filter(m => m.parentMessage),
    type: 'boutique'
  }));

  // Combiner et trier par date
  const allConversations = [...adminConversations, ...boutiqueConversations].sort((a, b) => 
    new Date(b.mainMessage.createdAt) - new Date(a.mainMessage.createdAt)
  );

  const content = (
    <>
      {allConversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>Aucun message</p>
          {embedded && (
            <Link to="/send-message-to-admins" style={{ color: '#1B2A6B', fontWeight: 600 }}>
              Écrire aux administrateurs
            </Link>
          )}
        </div>
      ) : (
        allConversations.map((conv) => {
          const msg = conv.mainMessage;
          const isAdmin = conv.type === 'admin';
          const isUnread = isAdmin ? msg.readBy?.find(r => r.user === msg.recipients[0] || !r.readAt) : !msg.readBy;
          
          return (
            <div key={msg._id} className="card" style={{ padding: 12, marginBottom: 10 }}>
              <div
                onClick={() => {
                  if (isAdmin && !isUnread?.readAt) handleMarkAsRead(msg._id);
                  if (!isAdmin && !isUnread) handleBoutiqueMarkAsRead(msg._id);
                  setExpandedId(expandedId === msg._id ? null : msg._id);
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderLeft: `4px solid ${isAdmin ? '#1B2A6B' : '#667eea'}`
                }}
              >
                <div style={{ flex: 1, paddingLeft: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 4px 0' }}>
                    {msg.sender?.nom} {msg.isGroupMessage ? '(message de groupe)' : ''}
                  </p>
                  <p style={{ fontSize: 12, color: '#666', margin: 0, marginBottom: 4 }}>
                    {isAdmin ? (msg.sender?.role === 'admin_simple' ? 'Admin' : 'Admin Suprême') : `Boutique: ${msg.boutique?.nom || 'N/A'}`}
                  </p>
                  <p style={{
                    fontSize: 13,
                    margin: 0,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {msg.contenu}
                  </p>
                  <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0 0' }}>
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{ marginLeft: 12, textAlign: 'right' }}>
                  {isUnread && (
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      backgroundColor: '#dc3545',
                      borderRadius: '50%',
                      marginBottom: 4
                    }} />
                  )}
                </div>
              </div>

              {expandedId === msg._id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                  <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: 10,
                    borderRadius: 4,
                    marginBottom: 12,
                    fontSize: 13
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.contenu}
                    </p>
                  </div>

                  {conv.replies.map(reply => (
                    <div key={reply._id} style={{
                      backgroundColor: isAdmin || reply.senderType === 'boutique' ? '#f0f0f0' : '#e8f5e9',
                      padding: 8,
                      borderRadius: 4,
                      marginBottom: 8,
                      borderLeft: `3px solid ${isAdmin ? '#1B2A6B' : '#667eea'}`
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 4px 0' }}>
                        {reply.sender?.nom}
                      </p>
                      <p style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {reply.contenu}
                      </p>
                      <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0 0' }}>
                        {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}

                  <div style={{ marginTop: 12 }}>
                    <textarea
                      value={replyContent[msg._id] || ''}
                      onChange={(e) => setReplyContent(prev => ({ ...prev, [msg._id]: e.target.value }))}
                      placeholder="Votre réponse..."
                      maxLength={500}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontFamily: 'inherit',
                        fontSize: 12,
                        marginBottom: 8,
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => isAdmin ? handleReply(msg._id) : handleBoutiqueReply(msg._id)}
                        disabled={replyLoading[msg._id]}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          backgroundColor: replyLoading[msg._id] ? '#ccc' : '#1B2A6B',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: replyLoading[msg._id] ? 'not-allowed' : 'pointer',
                          fontSize: 12
                        }}
                      >
                        {replyLoading[msg._id] ? 'Envoi...' : 'Répondre'}
                      </button>
                      <button
                        onClick={() => isAdmin ? handleDelete(msg._id) : handleBoutiqueDelete(msg._id)}
                        disabled={isDeletingId === msg._id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: isDeletingId === msg._id ? 'not-allowed' : 'pointer',
                          opacity: isDeletingId === msg._id ? 0.6 : 1,
                          fontSize: 12
                        }}
                      >
                        {isDeletingId === msg._id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title">Messages</h1>
        {(unreadCount + unreadBoutiqueCount) > 0 && (
          <div style={{
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 14
          }}>
            {unreadCount + unreadBoutiqueCount}
          </div>
        )}
      </div>
      {content}
    </div>
  );
};

export default UserMessages;
