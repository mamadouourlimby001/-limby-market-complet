import { useState, useEffect } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import api from '../utils/api';

const BoutiqueMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});

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
      const res = await api.get('/boutique-messages/boutique-inbox');
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText[messageId]?.trim()) {
      alert('Écrivez une réponse');
      return;
    }

    setReplying(prev => ({ ...prev, [messageId]: true }));
    try {
      await api.post(`/boutique-messages/${messageId}/boutique-reply`, {
        contenu: replyText[messageId]
      });
      setReplyText(prev => ({ ...prev, [messageId]: '' }));
      fetchMessages();
      alert('Réponse envoyée');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setReplying(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleMarkRead = async (messageId) => {
    try {
      await api.put(`/boutique-messages/${messageId}/boutique-read`);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      const response = await api.delete(`/boutique-messages/${messageId}/boutique-delete`);
      console.log('Message deleted:', response.data);
      setExpandedId(null);
      fetchMessages();
      alert('Message supprimé avec succès');
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      alert(err.response?.data?.message || `Erreur: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Messages Reçus</h1>

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          <MessageCircle size={32} style={{ margin: '0 auto 12px' }} />
          <p>Aucun message</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(msg => (
            <div key={msg._id} className="card" style={{ padding: 12 }}>
              {/* En-tête du message */}
              <div
                onClick={() => setExpandedId(expandedId === msg._id ? null : msg._id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  paddingBottom: 12,
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <User size={14} />
                    <strong style={{ fontSize: 13 }}>{msg.sender?.nom}</strong>
                    {!msg.readBy && (
                      <span style={{
                        padding: '2px 6px',
                        background: '#3b82f6',
                        color: '#fff',
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        Non lu
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                    {msg.contenu.substring(0, 60)}...
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: '#9ca3af' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Détails étendus */}
              {expandedId === msg._id && (
                <div style={{ paddingTop: 12 }}>
                  {/* Message original */}
                  <div style={{ marginBottom: 12, padding: 10, background: '#f3f4f6', borderRadius: 6, borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} /> {msg.sender?.nom} ({msg.sender?.telephone})
                    </div>
                    <p style={{ fontSize: 13, color: '#1f2937', margin: 0, lineHeight: 1.5 }}>
                      {msg.contenu}
                    </p>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 8 }}>
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Répliques */}
                  {msg.replies && msg.replies.length > 0 && (
                    <div style={{ marginBottom: 12, padding: 10, background: '#f9fafb', borderRadius: 6, borderLeft: '3px solid #059669' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#059669' }}>
                        Vos réponses:
                      </div>
                      {msg.replies.map((reply, idx) => (
                        <div key={idx} style={{ marginBottom: 8, fontSize: 12 }}>
                          <div style={{ color: '#6b7280', marginBottom: 2 }}>
                            {new Date(reply.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <p style={{ margin: 0, color: '#1f2937', lineHeight: 1.5 }}>
                            {reply.contenu}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire de réponse */}
                  <div style={{ marginBottom: 12 }}>
                    <textarea
                      placeholder="Votre réponse..."
                      value={replyText[msg._id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [msg._id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: 'inherit',
                        minHeight: 60,
                        resize: 'vertical',
                        marginBottom: 8
                      }}
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleReply(msg._id)}
                      disabled={replying[msg._id]}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: replying[msg._id] ? 'not-allowed' : 'pointer',
                        opacity: replying[msg._id] ? 0.6 : 1
                      }}
                    >
                      {replying[msg._id] ? 'Envoi...' : 'Répondre'}
                    </button>
                    {!msg.readBy && (
                      <button
                        onClick={() => handleMarkRead(msg._id)}
                        style={{
                          flex: 1,
                          padding: 8,
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg._id)}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiqueMessages;
