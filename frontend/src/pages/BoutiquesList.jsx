import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BoutiqueCard from '../components/BoutiqueCard';

const BoutiquesList = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/boutiques'); setBoutiques(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Boutiques</h1>
      {user && user.role !== 'vendeur_boutique' && (
        <Link to="/boutiques/creer" className="btn btn-primary btn-block" style={{ marginBottom: 14 }}>🏪 Créer ma boutique</Link>
      )}
      {loading ? <div className="loader"><div className="spinner"></div></div> : boutiques.length === 0 ? <div className="empty-state"><p>Aucune boutique active</p></div> : (
        <div className="grid-1">{boutiques.map(b => <BoutiqueCard key={b._id} boutique={b} />)}</div>
      )}
    </div>
  );
};

export default BoutiquesList;
