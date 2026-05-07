import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminSendToUsers = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('single'); // 'single' ou 'all'
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (mode === 'single') {
      fetchUsers();
    }
  }, [mode]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/messages/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contenu.trim()) {
      setMessage('Veuillez écrire un message');
      return;
    }

    if (mode === 'single' && !selectedUser) {
      setMessage('Veuillez sélectionner un utilisateur');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'single') {
        await api.post('/messages/admin/send-to-user', {
          userId: selectedUser,
          contenu
        });
      } else {
        await api.post('/messages/admin/broadcast', { contenu });
      }
      setMessage('Message envoyé avec succès');
      setContenu('');
      setSelectedUser('');
      setSearchTerm('');
      setTimeout(() => navigate('/admin/messages'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telephone.includes(searchTerm)
  );

  return (
    <div className="page">
      <h1 className="page-title">Écrire aux utilisateurs</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode('single')}
          style={{
            flex: 1,
            padding: '10px 12px',
            backgroundColor: mode === 'single' ? '#1B2A6B' : '#f0f0f0',
            color: mode === 'single' ? 'white' : '#333',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          À un utilisateur
        </button>
        <button
          onClick={() => setMode('all')}
          style={{
            flex: 1,
            padding: '10px 12px',
            backgroundColor: mode === 'all' ? '#1B2A6B' : '#f0f0f0',
            color: mode === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          À tous les utilisateurs
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'single' && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Sélectionner un utilisateur
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou téléphone..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                marginBottom: 8,
                fontSize: 13
              }}
            />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 13,
                maxHeight: 200
              }}
            >
              <option value="">-- Choisir un utilisateur --</option>
              {filteredUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.nom} ({u.telephone})
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'all' && (
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #1B2A6B',
            fontSize: 12
          }}>
            <p style={{ margin: 0, color: '#1B2A6B', fontWeight: 600 }}>
              ⓘ Ce message sera envoyé à tous les utilisateurs du site
            </p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Message
          </label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Votre message..."
            maxLength={500}
            rows={6}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 6,
              fontFamily: 'inherit',
              fontSize: 13,
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            {contenu.length}/500 caractères
          </div>
        </div>

        {message && (
          <div style={{
            padding: 12,
            backgroundColor: message.includes('succès') ? '#d4edda' : '#f8d7da',
            color: message.includes('succès') ? '#155724' : '#721c24',
            borderRadius: 6,
            fontSize: 12
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !contenu.trim() || (mode === 'single' && !selectedUser)}
          style={{
            padding: '12px 16px',
            backgroundColor: loading || !contenu.trim() || (mode === 'single' && !selectedUser) ? '#ccc' : '#1B2A6B',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: loading || !contenu.trim() || (mode === 'single' && !selectedUser) ? 'not-allowed' : 'pointer',
            fontSize: 13
          }}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/messages')}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: 6,
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Annuler
        </button>
      </form>
    </div>
  );
};

export default AdminSendToUsers;
