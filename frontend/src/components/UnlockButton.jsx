import { useState } from 'react';
import { Unlock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UnlockButton = ({ type, id, contact }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState(contact !== 'hidden' ? contact : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'product' ? `/products/${id}/unlock-contact` : type === 'location' ? `/locations/${id}/unlock-contact` : `/announcements/${id}/unlock-contact`;
      const res = await api.post(endpoint);
      setUnlockedContact(res.data.contact);
      setShowConfirm(false);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (unlockedContact) {
    return (
      <div style={{ background: 'rgba(16,185,129,0.1)', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 4, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Phone size={14} /> {unlockedContact}
      </div>
    );
  }

  return (
    <>
      <button onClick={() => { if (!user) { navigate('/login'); return; } setShowConfirm(true); }}
        className="btn btn-primary btn-sm btn-block" style={{ marginBottom: 4, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Unlock size={14} /> Débloquer contact (1 crédit)
      </button>
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: '#1B2A6B' }}>Débloquer ce contact ?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              Cela vous coûtera <strong>1 crédit (200 GNF)</strong>.<br />
              Votre solde actuel : <strong>{user?.credits || 0} crédits</strong>
            </p>
            {error && <div className="alert alert-danger">{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleUnlock} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UnlockButton;
