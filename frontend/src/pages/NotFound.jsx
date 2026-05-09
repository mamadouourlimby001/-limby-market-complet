import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Search size={64} style={{ display: 'block', marginBottom: 16 }} />
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B2A6B', marginBottom: 8 }}>Page introuvable</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>La page que vous cherchez n'existe pas.</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  );
};

export default NotFound;
