import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AnnouncementCard from '../components/AnnouncementCard';

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ villeDeTravail: '', entreprise: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.villeDeTravail) params.villeDeTravail = filters.villeDeTravail;
      if (filters.entreprise) params.entreprise = filters.entreprise;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Annonces</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary btn-sm">🔍 Filtres</button>
      </div>
      {showFilters && (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div className="form-group"><label>Ville de travail</label><input className="form-control" value={filters.villeDeTravail} onChange={e => setFilters({...filters, villeDeTravail: e.target.value})} /></div>
          <div className="form-group"><label>Entreprise</label><input className="form-control" value={filters.entreprise} onChange={e => setFilters({...filters, entreprise: e.target.value})} /></div>
          <button onClick={() => { fetchAnnouncements(); setShowFilters(false); }} className="btn btn-primary btn-block btn-sm">Appliquer</button>
        </div>
      )}
      {loading ? <div className="loader"><div className="spinner"></div></div> : announcements.length === 0 ? <div className="empty-state"><p>Aucune annonce trouvée</p></div> : (
        <div className="grid-2">{announcements.map(a => <AnnouncementCard key={a._id} announcement={a} />)}</div>
      )}
      <button onClick={() => user ? navigate('/annonces/ajouter') : navigate('/login')} className="fab">+</button>
    </div>
  );
};

export default AnnouncementsList;
