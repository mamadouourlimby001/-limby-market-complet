import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Phone, Clock, Globe } from 'lucide-react';
import api from '../utils/api';

const AdminVisites = () => {
  const navigate = useNavigate();
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/visites');
        setVisites(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Visites des 24 dernières heures</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {visites.length === 0 ? (
        <div className="empty-state">
          <p>Aucune visite enregistrée</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Visiteur</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Pages</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Durée</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Date</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visites.map(visite => (
                <tr key={visite._id} style={{ borderBottom: '1px solid #e5e7eb', hover: { backgroundColor: '#f9fafb' } }}>
                  <td style={{ padding: 12 }}>{visite.nom}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={14} color="#6b7280" />
                      <span style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{visite.telephone}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Globe size={14} color="#6b7280" />
                      <span>{visite.nombrePages}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock size={14} color="#6b7280" />
                      <span>{Math.round(visite.dureeTotale / 60)}m</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
                    {new Date(visite.dateDebut).toLocaleDateString('fr-GN')} {new Date(visite.dateDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button 
                      onClick={() => navigate(`/admin/visites/${visite._id}`)}
                      className="btn btn-sm btn-primary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 10px' }}
                    >
                      <Eye size={14} /> Détails
                    </button>
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
