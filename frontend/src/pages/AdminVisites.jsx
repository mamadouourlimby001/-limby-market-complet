import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Phone, Clock, Globe, Trash2, MapPin, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import TrafficSummaryModal from './TrafficSummary';

const AdminVisites = () => {
  const navigate = useNavigate();
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showTrafficSummary, setShowTrafficSummary] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/visites');
        setVisites(res.data.visites || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (visitId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) return;
    
    setDeleting(visitId);
    try {
      await api.delete(`/admin/visites/${visitId}`);
      setVisites(visites.filter(v => v._id !== visitId));
      alert('Visite supprimée avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (showTrafficSummary) {
    return <TrafficSummaryModal onClose={() => setShowTrafficSummary(false)} />;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Visites des 24 dernières heures</h1>
        <button
          onClick={() => setShowTrafficSummary(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            backgroundColor: '#1B2A6B',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1a2361')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1B2A6B')}
        >
          <BarChart3 size={16} /> Bilan du trafic
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Compteur total */}
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <strong>Total de visiteurs :</strong> {visites.length} personne{visites.length > 1 ? 's' : ''}
      </div>

      {visites.length === 0 ? (
        <div className="empty-state">
          <p>Aucune visite enregistrée</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: 10, textAlign: 'left', fontWeight: 600 }}>Visiteur</th>
                <th style={{ padding: 10, textAlign: 'left', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: 10, textAlign: 'left', fontWeight: 600 }}>Localisation</th>
                <th style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>Pages</th>
                <th style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>Durée</th>
                <th style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>Date</th>
                <th style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visites.map(visite => (
                <tr key={visite._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{visite.nom}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} color="#6b7280" />
                      <span style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{visite.telephone}</span>
                    </div>
                  </td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                      <MapPin size={12} />
                      <span>{visite.ville || '-'}, {visite.region || '-'}, {visite.pays || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Globe size={12} color="#6b7280" />
                      <span>{visite.nombrePages}</span>
                    </div>
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock size={12} color="#6b7280" />
                      <span>{Math.round(visite.dureeTotale / 60)}m</span>
                    </div>
                  </td>
                  <td style={{ padding: 10, textAlign: 'center', fontSize: 11, color: '#6b7280' }}>
                    {new Date(visite.dateDebut).toLocaleDateString('fr-GN')} {new Date(visite.dateDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button 
                        onClick={() => navigate(`/admin/visites/${visite._id}`)}
                        className="btn btn-sm btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '5px 8px', fontSize: 11 }}
                      >
                        <Eye size={12} /> Détails
                      </button>
                      <button 
                        onClick={() => handleDelete(visite._id)}
                        disabled={deleting === visite._id}
                        className="btn btn-sm btn-danger"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '5px 8px', fontSize: 11, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: deleting === visite._id ? 'not-allowed' : 'pointer', opacity: deleting === visite._id ? 0.6 : 1 }}
                      >
                        <Trash2 size={12} /> {deleting === visite._id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVisites;
