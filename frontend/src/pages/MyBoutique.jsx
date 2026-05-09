import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, SortAsc, MapPin } from 'lucide-react';

const MyBoutique = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/boutiques/my-boutique');
      if (res.data) {
        setBoutique(res.data.boutique || res.data);
        const prods = res.data.products || [];
        setProducts(prods);
        setFilteredProducts(prods);
      }
    }
    catch (err) {
      console.error(err);
      navigate('/mon-compte');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Refetch data when page becomes visible (user returns to MyBoutique)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    let filtered = products.filter(p => 
      p.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.prix || 0) - (b.prix || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.prix || 0) - (a.prix || 0));
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || b.dateCreation) - new Date(a.createdAt || a.dateCreation));
    }

    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!boutique) return <div className="page"><div className="empty-state"><p>Vous n'avez pas de boutique</p></div></div>;

  return (
    <div className="page">
      {/* Info boutique */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#f0f0f0' }}>
          {boutique.logo && <img src={boutique.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#1B2A6B' }}>
          {boutique.nom}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{boutique.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
          <MapPin size={16} /> {boutique.quartier}, {boutique.ville}
        </div>
        <span className="badge badge-primary" style={{ marginBottom: 8 }}>{boutique.categorie}</span>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${boutique.isActive ? 'badge-success' : 'badge-danger'}`}>
            {boutique.isActive ? 'Active' : 'Inactive'}
          </span>
          <Link to="/credits/renouveler-abonnement" className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }}>Renouveler mon abonnement</Link>
        </div>
      </div>

      {/* Boutons Recherche et Tri */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Chercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            background: '#fff',
            minWidth: '120px'
          }}
        >
          <option value="recent">Plus récent</option>
          <option value="price-asc">Prix ↑</option>
          <option value="price-desc">Prix ↓</option>
        </select>
      </div>

      {/* Bouton Ajouter produit */}
      <Link to={`/boutiques/${boutique._id}/ajouter-produit`} className="btn btn-primary btn-block" style={{ marginBottom: 14 }}>
        + Ajouter un produit
      </Link>

      {/* Galerie produits */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1B2A6B' }}>
        Produits ({filteredProducts.length})
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="empty-state" style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredProducts.map(p => (
            <div key={p._id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ width: '100%', height: 150, background: '#f0f0f0', overflow: 'hidden' }}>
                {p.photos && p.photos[0] && (
                  <img src={p.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: 10 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#1B2A6B' }}>{p.titre}</h3>
                <p className="price" style={{ fontSize: 14, fontWeight: 700, color: '#4A90D9' }}>
                  {p.prix?.toLocaleString('fr-GN')} GNF
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBoutique;
