import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ReportButton = ({ typeContenu, contenuId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [raison, setRaison] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReport = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await api.post('/reports', { typeContenu, contenuId, raison });
      setSent(true);
      setTimeout(() => { setShowModal(false); setSent(false); setRaison(''); }, 2000);
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => { if (!user) { navigate('/login'); return; } setShowModal(true); }}
        style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, cursor: 'pointer', padding: '2px 0' }}>
        ⚠️ Signaler
      </button>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: 14, color: '#10b981' }}>✔️ Signalement envoyé. Merci !</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, marginBottom: 12, color: '#1B2A6B' }}>Signaler ce contenu</h3>
                <div className="form-group">
                  <label>Raison du signalement</label>
                  <textarea className="form-control" value={raison} onChange={e => setRaison(e.target.value)} placeholder="Décrivez la raison..." rows={3} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Annuler</button>
                  <button onClick={handleReport} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
                    {loading ? '...' : 'Envoyer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
