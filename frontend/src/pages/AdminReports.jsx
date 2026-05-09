import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const res = await api.get('/admin/reports'); setReports(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/reports/${id}/handle`, { action });
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const typeLabels = { product: 'Produit', location: 'Location', announcement: 'Annonce', boutique: 'Boutique' };

  return (
    <div className="page">
      <h1 className="page-title">Signalements</h1>
      {reports.length === 0 ? <div className="empty-state"><p>Aucun signalement en attente</p></div> :
        reports.map(r => (
          <div key={r._id} className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="badge badge-warning">{typeLabels[r.typeContenu]}</span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <p style={{ fontSize: 13, marginBottom: 4 }}>{r.raison || 'Aucune raison spécifiée'}</p>
            <p style={{ fontSize: 11, color: '#6b7280' }}>Par: {r.signalePar?.nom}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => handle(r._id, 'supprimer')} className="btn btn-danger btn-sm" style={{ flex: 1 }}>🗑 Supprimer contenu</button>
              <button onClick={() => handle(r._id, 'ignorer')} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Ignorer</button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default AdminReports;
