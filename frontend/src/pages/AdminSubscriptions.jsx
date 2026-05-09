import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminSubscriptions = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const res = await api.get('/admin/subscription-requests'); setRequests(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handle = async (id, action) => {
    try {
      await api.post(`/admin/subscription-requests/${id}/${action}`);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Demandes d'abonnement</h1>
      {requests.length === 0 ? <div className="empty-state"><p>Aucune demande en attente</p></div> :
        requests.map(r => (
          <div key={r._id} className="card" style={{ padding: 12, marginBottom: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{r.nomBoutique}</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>☎️ Dépôt: {r.telephoneDepot}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B' }}>{r.montant?.toLocaleString('fr-GN')} GNF</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Par: {r.demandeur?.nom}</p>
            <p style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleString('fr-FR')}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => handle(r._id, 'approve')} className="btn btn-success btn-sm" style={{ flex: 1 }}>✔️ Approuver</button>
              <button onClick={() => handle(r._id, 'reject')} className="btn btn-danger btn-sm" style={{ flex: 1 }}>✖️ Rejeter</button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default AdminSubscriptions;
