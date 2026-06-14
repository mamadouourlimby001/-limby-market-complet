import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

const AdminBoutiques = () => {
  const navigate = useNavigate();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      const res = await api.get('/admin/boutiques');
      setBoutiques(res.data);
    } catch (err) {
      alert('Erreur lors de la récupération des boutiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return;
    }

    setActionId(id);
    try {
      await api.delete(`/admin/boutiques/${id}`);
      setBoutiques(boutiques.filter(b => b._id !== id));
      alert('Boutique supprimée');
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleActivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/activate`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      alert('Boutique activée pour 30 jours');
    } catch (err) {
      alert('Erreur lors de l\'activation');
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/deactivate`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      alert('Boutique désactivée');
    } catch (err) {
      alert('Erreur lors de la désactivation');
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleCertify = async (id) => {
    setActionId(id);
    try {
      const res = await api.put(`/admin/boutiques/${id}/certify`);
      setBoutiques(boutiques.map(b => b._id === id ? res.data.boutique : b));
      alert('Boutique certifiée');
    } catch (err) {
      alert('Erreur lors de la certification');
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 16 }}>Boutiques ({boutiques.length})</h1>

      {boutiques.length === 0 ? (
        <div className="empty-state">
          <p>Aucune boutique</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {boutiques.map(boutique => (
            <div key={boutique._id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {boutique.logo && (
                  <img
                    src={boutique.logo}
                    alt=""
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 6,
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{boutique.nom}</h3>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    {boutique.description}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                    📍 {boutique.quartier}, {boutique.ville}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>
                    👤 {boutique.proprietaire?.nom} ({boutique.proprietaire?.telephone})
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: boutique.isActive ? '#dcfce7' : '#fee2e2',
                        color: boutique.isActive ? '#166534' : '#991b1b'
                      }}
                    >
                      {boutique.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                    {boutique.isVerified && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        ✓ Vérifiée
                      </span>
                    )}
                    {boutique.isCertified && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        ✓ Boutique Certifiée
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => navigate(`/admin/boutique/${boutique._id}/bilan`)}
                  disabled={actionId === boutique._id}
                  style={{
                    padding: 8,
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: actionId === boutique._id ? 'not-allowed' : 'pointer',
                    opacity: actionId === boutique._id ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <BarChart3 size={14} /> Bilan
                </button>

                <button
                  onClick={() => handleCertify(boutique._id)}
                  disabled={actionId === boutique._id || boutique.isCertified}
                  style={{
                    padding: 8,
                    background: boutique.isCertified ? '#cbd5e1' : '#06b6d4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: actionId === boutique._id || boutique.isCertified ? 'not-allowed' : 'pointer',
                    opacity: actionId === boutique._id || boutique.isCertified ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {boutique.isCertified ? '✓ Certifiée' : '⭐ Certifier'}
                </button>

                {boutique.isActive ? (
                  <button
                    onClick={() => handleDeactivate(boutique._id)}
                    disabled={actionId === boutique._id}
                    style={{
                      padding: 8,
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: actionId === boutique._id ? 'not-allowed' : 'pointer',
                      opacity: actionId === boutique._id ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <XCircle size={14} /> Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(boutique._id)}
                    disabled={actionId === boutique._id}
                    style={{
                      padding: 8,
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: actionId === boutique._id ? 'not-allowed' : 'pointer',
                      opacity: actionId === boutique._id ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <CheckCircle size={14} /> Activer (30j)
                  </button>
                )}

                <button
                  onClick={() => handleDelete(boutique._id)}
                  disabled={actionId === boutique._id}
                  style={{
                    padding: 8,
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: actionId === boutique._id ? 'not-allowed' : 'pointer',
                    opacity: actionId === boutique._id ? 0.6 : 1,
                    gridColumn: '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBoutiques;
