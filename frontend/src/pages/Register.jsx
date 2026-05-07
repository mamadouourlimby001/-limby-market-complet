import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (motDePasse !== confirmMdp) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (motDePasse.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await register(nom, telephone, motDePasse);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 30 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A6B' }}>Inscription</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Créez votre compte Limby Market</p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom complet</label>
          <input type="text" className="form-control" placeholder="Ex: Diallo Mamadou" value={nom} onChange={e => setNom(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input type="tel" className="form-control" placeholder="+224..." value={telephone} onChange={e => setTelephone(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" className="form-control" placeholder="Min. 6 caractères" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input type="password" className="form-control" placeholder="Confirmez..." value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
        Déjà un compte ? <Link to="/login" style={{ color: '#1B2A6B', fontWeight: 600 }}>Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;
