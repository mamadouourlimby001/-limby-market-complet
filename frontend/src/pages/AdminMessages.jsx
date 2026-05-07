import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages/admin/messages');
      setMessages(res.data.data);
      setUnreadCount(res.data.unreadCount);
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
    try {
      await api.delete(`/messages/${messageId}`);
      fetchMessages();
    } catch (err) {
      console.error(err);
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
      fetchMessages();
      alert('Réponse envoyée avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setReplyLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const groupedMessages = {};
  messages.forEach(msg => {
    const groupId = msg.parentMessage || msg._id;
    if (!groupedMessages[groupId]) {
      groupedMessages[groupId] = [];
    }
    groupedMessages[groupId].push(msg);
  });

  const conversations = Object.values(groupedMessages).map(group => ({
    mainMessage: group.find(m => !m.parentMessage) || group[0],
    replies: group.filter(m => m.parentMessage)
  }));

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title">Messages des utilisateurs</h1>
        {unreadCount > 0 && (
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
            {unreadCount}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/send-to-users" style={{
          display: 'inline-block',
          padding: '10px 16px',
          backgroundColor: '#1B2A6B',
          color: 'white',
          textDecoration: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 13
        }}>
          ✎ Écrire aux utilisateurs
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>Aucun message</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const msg = conv.mainMessage;
          const isUnread = msg.readBy?.find(r => !r.readAt);
          
          return (
            <div key={msg._id} className="card" style={{
              padding: 12,
              marginBottom: 10,
              borderLeft: isUnread ? '4px solid #dc3545' : '4px solid transparent'
            }}>
              <div
                onClick={() => {
                  if (isUnread) handleMarkAsRead(msg._id);
                  setExpandedId(expandedId === msg._id ? null : msg._id);
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 4px 0' }}>
                    {msg.sender?.nom}
                  </p>
                  <p style={{ fontSize: 11, color: '#666', margin: 0, marginBottom: 4 }}>
                    {msg.sender?.telephone}
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
                      backgroundColor: reply.senderType === 'user' ? '#f0f0f0' : '#e8f5e9',
                      padding: 8,
                      borderRadius: 4,
                      marginBottom: 8,
                      borderLeft: `3px solid ${reply.senderType === 'user' ? '#999' : '#4CAF50'}`
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
                        onClick={() => handleReply(msg._id)}
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
                        onClick={() => handleDelete(msg._id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminMessages;
