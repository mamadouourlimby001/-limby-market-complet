import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const token = localStorage.getItem('resetToken');
    if (!token) {
      setError('Session expirée. Veuillez recommencer.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mot de passe réinitialisé avec succès');
      localStorage.removeItem('resetToken');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A6B' }}>Définir un nouveau mot de passe</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="Min. 6 caractères"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirmez..."
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
