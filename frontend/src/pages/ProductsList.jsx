import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const categories = ['Électronique', 'Vêtements', 'Meubles', 'Véhicules', 'Téléphones', 'Informatique', 'Électroménager', 'Sport', 'Autres'];
const villes = ['Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', 'Nzérékoré'];

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ville: '', categorie: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const applyFilters = () => { fetchProducts(); setShowFilters(false); };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Occasion</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary btn-sm">🔍 Filtres</button>
      </div>

      {showFilters && (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div className="form-group">
            <label>Ville</label>
            <select className="form-control" value={filters.ville} onChange={e => setFilters({...filters, ville: e.target.value})}>
              <option value="">Toutes</option>
              {villes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <select className="form-control" value={filters.categorie} onChange={e => setFilters({...filters, categorie: e.target.value})}>
              <option value="">Toutes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prix min</label>
              <input type="number" className="form-control" placeholder="GNF" value={filters.prixMin} onChange={e => setFilters({...filters, prixMin: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prix max</label>
              <input type="number" className="form-control" placeholder="GNF" value={filters.prixMax} onChange={e => setFilters({...filters, prixMax: e.target.value})} />
            </div>
          </div>
          <button onClick={applyFilters} className="btn btn-primary btn-block btn-sm">Appliquer</button>
        </div>
      )}

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="empty-state"><p>Aucun produit trouvé</p></div>
      ) : (
        <div className="grid-2">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      <button onClick={() => user ? navigate('/occasion/ajouter') : navigate('/login')} className="fab">+</button>
    </div>
  );
};

export default ProductsList;
