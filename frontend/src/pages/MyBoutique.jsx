import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SortAsc, RotateCcw, Package } from 'lucide-react';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import { useAuth } from '../context/AuthContext';

const MyBoutique = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    fetchBoutique();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBoutique();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchBoutique = async () => {
    try {
      const res = await api.get('/boutiques/my-boutique');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page">
      <div className="loader"><div className="spinner"></div></div>
    </div>
  );

  if (!data) return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ marginBottom: 12 }}>Vous n'avez pas encore de boutique</p>
        <Link to="/boutiques/creer" className="btn btn-primary">Créer une boutique</Link>
      </div>
    </div>
  );

  const { boutique, products } = data;
  let filteredProducts = products;

  // Filtrer par recherche
  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.titre.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Trier
  if (sort === 'recent') {
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.prix - b.prix);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.prix - a.prix);
  }

  const statusColor = boutique.isActive ? '#059669' : '#dc3545';
  const statusLabel = boutique.isActive ? 'Active' : 'Inactive';

  return (
    <div className="page">
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#f0f0f0' }}>
          {boutique.logo && <img src={boutique.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{boutique.nom}</h1>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{boutique.description}</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          📍 {boutique.quartier}, {boutique.ville}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              background: statusColor,
              color: '#fff',
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {statusLabel}
          </span>
          <span className="badge badge-primary">{boutique.categorie}</span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <Link to="/credits/renouveler-abonnement" className="btn btn-primary btn-block">
          Renouveler mon abonnement
        </Link>
        <Link to="/boutique-commandes" className="btn btn-secondary btn-block">
          <Package size={16} style={{ marginRight: 6, display: 'inline' }} /> Commandes
        </Link>
        <Link to="/boutique-messages-inbox" className="btn btn-secondary btn-block">
          💬 Messages ({0})
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: 6, paddingLeft: 10 }}>
          <Search size={16} style={{ color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Chercher produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px 8px',
              fontSize: 13,
              outline: 'none'
            }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: '10px 8px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          <option value="recent">📅 Récent</option>
          <option value="price-asc">💰 Prix ↑</option>
          <option value="price-desc">💰 Prix ↓</option>
        </select>
      </div>

      {/* Bouton Ajouter produit */}
      <Link to={`/boutiques/${boutique._id}/ajouter-produit`} className="btn btn-success btn-block" style={{ marginBottom: 16 }}>
        + Ajouter un produit
      </Link>

      {/* Liste des produits */}
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
        Mes produits ({filteredProducts.length})
      </h2>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>
          <p>{search ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredProducts.map(p => (
            <Link key={p._id} to={`/boutiques/${boutique._id}/produits/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <PhotoSlider photos={p.photos} />
                <div style={{ padding: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.titre}</h3>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{p.categorie}</p>
                  <p className="price" style={{ fontSize: 14 }}>{p.prix?.toLocaleString('fr-GN')} GNF</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBoutique;
