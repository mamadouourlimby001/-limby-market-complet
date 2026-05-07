import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(telephone, motDePasse);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 8 }}>
          <path d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95" stroke="#1B2A6B" strokeWidth="8" strokeLinecap="round" fill="none"/>
        </svg>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A6B' }}>Connexion</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Connectez-vous à votre compte Limby</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input type="tel" className="form-control" placeholder="+224..." value={telephone} onChange={e => setTelephone(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" className="form-control" placeholder="Votre mot de passe" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
        Pas encore de compte ? <Link to="/register" style={{ color: '#1B2A6B', fontWeight: 600 }}>S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;
