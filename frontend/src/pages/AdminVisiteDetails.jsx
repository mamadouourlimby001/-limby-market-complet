import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Globe } from 'lucide-react';
import api from '../utils/api';

const AdminVisiteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/admin/visites/${id}`);
        setVisite(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (error) {
    return (
      <div className="page">
        <button onClick={() => navigate('/admin/visites')} className="btn btn-secondary" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!visite) {
    return (
      <div className="page">
        <button onClick={() => navigate('/admin/visites')} className="btn btn-secondary" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="empty-state">
          <p>Visite introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button onClick={() => navigate('/admin/visites')} className="btn btn-secondary" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={16} /> Retour aux visites
      </button>

      <h1 className="page-title">Détails de la visite</h1>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>VISITEUR</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1B2A6B' }}>{visite.nom}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>CONTACT</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{visite.telephone}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>PAGES VISITÉES</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{visite.pagesVisitees.length}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>DATE DÉBUT</p>
            <p style={{ fontSize: 13 }}>{new Date(visite.dateDebut).toLocaleDateString('fr-GN')} à {new Date(visite.dateDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>DATE FIN</p>
            <p style={{ fontSize: 13 }}>{visite.dateFin ? new Date(visite.dateFin).toLocaleDateString('fr-GN') + ' à ' + new Date(visite.dateFin).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' }) : 'En cours'}</p>
          </div>
        </div>

        <div>
          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>DURÉE TOTALE</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
            {Math.floor(visite.dureeTotale / 3600)}h {Math.floor((visite.dureeTotale % 3600) / 60)}m {visite.dureeTotale % 60}s
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1B2A6B' }}>Pages visitées</h2>

      {visite.pagesVisitees.length === 0 ? (
        <div className="empty-state">
          <p>Aucune page visitée</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Page</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Heure d'arrivée</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Heure de départ</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Durée</th>
              </tr>
            </thead>
            <tbody>
              {visite.pagesVisitees.map((page, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Globe size={14} color="#6b7280" />
                      <span style={{ wordBreak: 'break-all' }}>{page.page}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
                    {page.tempsDebut ? new Date(page.tempsDebut).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
                    {page.tempsFin ? new Date(page.tempsFin).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock size={14} color="#6b7280" />
                      <span>{page.duree ? Math.round(page.duree) + 's' : '-'}</span>
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

export default AdminVisiteDetails;
