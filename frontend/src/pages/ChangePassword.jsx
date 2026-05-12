import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/update-password', {
        oldPassword,
        newPassword
      });
      alert('Mot de passe modifié avec succès');
      navigate('/mon-compte');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      if (err.response?.data?.message === 'Ancien mot de passe incorrect.') {
        setError('Ancien mot de passe incorrect. Cliquez sur "Mot de passe oublié" si vous ne le souvenez pas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A6B' }}>Modifier le mot de passe</h1>
      </div>

      {error && (
        <div>
          <div className="alert alert-danger">{error}</div>
          {error.includes('oublié') && (
            <button onClick={handleForgotPassword} className="btn btn-secondary btn-block" style={{ marginBottom: 16 }}>
              Mot de passe oublié
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ancien mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="Votre mot de passe actuel"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
        </div>
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
          <label>Confirmer le nouveau mot de passe</label>
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
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
