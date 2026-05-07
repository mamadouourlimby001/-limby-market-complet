import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SendMessageToAdmins = () => {
  const navigate = useNavigate();
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contenu.trim()) {
      setMessage('Veuillez écrire un message');
      return;
    }

    setLoading(true);
    try {
      await api.post('/messages/send-to-admins', { contenu });
      setMessage('Message envoyé avec succès');
      setContenu('');
      setTimeout(() => navigate('/account?tab=messages'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Écrire aux administrateurs</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            borderRadius: 8,
            fontFamily: 'inherit',
            fontSize: 14,
            resize: 'vertical'
          }}
        />
        
        <div style={{ fontSize: 12, color: '#666' }}>
          {contenu.length}/500 caractères
        </div>

        {message && (
          <div style={{
            padding: 12,
            backgroundColor: message.includes('succès') ? '#d4edda' : '#f8d7da',
            color: message.includes('succès') ? '#155724' : '#721c24',
            borderRadius: 6,
            fontSize: 13
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !contenu.trim()}
          style={{
            padding: '12px 16px',
            backgroundColor: loading || !contenu.trim() ? '#ccc' : '#1B2A6B',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: loading || !contenu.trim() ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/account?tab=messages')}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: 6,
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Annuler
        </button>
      </form>
    </div>
  );
};

export default SendMessageToAdmins;
