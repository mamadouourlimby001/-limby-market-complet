import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MyBoutique = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/boutiques/my-boutique');
        setData(res.data);
      }
      catch (err) {
        console.error(err);
        navigate('/mon-compte');
      }
      finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!data) return <div className="page"><div className="empty-state"><p>Vous n'avez pas de boutique</p></div></div>;

  const { boutique, products } = data;

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#f0f0f0' }}>
          {boutique.logo && <img src={boutique.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {boutique.nom} {boutique.isVerified && <span style={{ color: '#4A90D9' }}>✔️</span>}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{boutique.description}</p>
        <p style={{ fontSize: 13, color: '#1B2A6B', fontWeight: 600 }}>☎️ {boutique.telephone}</p>
        <span className="badge badge-primary">{boutique.categorie}</span>
        <p style={{ fontSize: 12, marginTop: 8 }}>Statut: <span className={`badge ${boutique.isActive ? 'badge-success' : 'badge-danger'}`}>{boutique.isActive ? 'Active' : 'Inactive'}</span></p>
        {boutique.dateExpiration && <p style={{ fontSize: 11, color: '#6b7280' }}>Expire le {new Date(boutique.dateExpiration).toLocaleDateString('fr-FR')}</p>}
      </div>

      <Link to={`/boutiques/${boutique._id}/ajouter-produit`} className="btn btn-primary btn-block" style={{ marginBottom: 14 }}>+ Ajouter un produit</Link>
      <Link to="/credits/renouveler-abonnement" className="btn btn-secondary btn-block" style={{ marginBottom: 14 }}>Renouveler abonnement</Link>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Produits ({products.length})</h2>
      {products.length === 0 ? <div className="empty-state"><p>Aucun produit</p></div> : (
        <div className="grid-2">
          {products.map(p => (
            <div key={p._id} className="card" style={{ padding: 10, textAlign: 'center' }}>
              {p.photos && p.photos[0] && <img src={p.photos[0]} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', marginBottom: 8, borderRadius: 4 }} />}
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.titre}</p>
              <p className="price" style={{ fontSize: 14, marginBottom: 8 }}>{p.prix?.toLocaleString('fr-GN')} GNF</p>
              <Link to={`/boutiques/${boutique._id}`} className="btn btn-secondary btn-sm btn-block">Voir</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBoutique;
