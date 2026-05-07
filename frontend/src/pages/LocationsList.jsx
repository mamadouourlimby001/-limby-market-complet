import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LocationCard from '../components/LocationCard';

const villes = ['Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', 'Nzérékoré'];

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ville: '', categorie: '', prixMin: '', prixMax: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.ville) params.ville = filters.ville;
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      const res = await api.get('/locations', { params });
      setLocations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Locations</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary btn-sm">🔍 Filtres</button>
      </div>
      {showFilters && (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div className="form-group"><label>Ville</label>
            <select className="form-control" value={filters.ville} onChange={e => setFilters({...filters, ville: e.target.value})}>
              <option value="">Toutes</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}
            </select></div>
          <div className="form-group"><label>Catégorie</label>
            <select className="form-control" value={filters.categorie} onChange={e => setFilters({...filters, categorie: e.target.value})}>
              <option value="">Toutes</option><option value="Location">Location</option><option value="Colocation">Colocation</option><option value="Vente_immobilière">Vente immobilière</option>
            </select></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}><label>Prix min</label><input type="number" className="form-control" value={filters.prixMin} onChange={e => setFilters({...filters, prixMin: e.target.value})} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Prix max</label><input type="number" className="form-control" value={filters.prixMax} onChange={e => setFilters({...filters, prixMax: e.target.value})} /></div>
          </div>
          <button onClick={() => { fetchLocations(); setShowFilters(false); }} className="btn btn-primary btn-block btn-sm">Appliquer</button>
        </div>
      )}
      {loading ? <div className="loader"><div className="spinner"></div></div> : locations.length === 0 ? <div className="empty-state"><p>Aucune location trouvée</p></div> : (
        <div className="grid-2">{locations.map(l => <LocationCard key={l._id} location={l} />)}</div>
      )}
      <button onClick={() => user ? navigate('/locations/ajouter') : navigate('/login')} className="fab">+</button>
    </div>
  );
};

export default LocationsList;
