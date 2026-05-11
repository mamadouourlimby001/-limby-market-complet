import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { BarChart3, TrendingUp, ShoppingCart, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const AdminBoutiqueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [boutiqueRes, statsRes] = await Promise.all([
        api.get(`/boutiques/${id}`),
        api.get(`/admin/boutiques/${id}/stats`)
      ]);
      setBoutique(boutiqueRes.data.boutique);
      setStats(statsRes.data);
    } catch (err) {
      alert('Erreur lors du chargement');
      console.error(err);
      navigate('/admin/boutiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!boutique || !stats) {
    return (
      <div className="page">
        <div className="empty-state"><p>Boutique non trouvée</p></div>
      </div>
    );
  }

  return (
    <div className="page">
      <button
        onClick={() => navigate('/admin/boutiques')}
        style={{
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <ArrowLeft size={16} /> Retour aux boutiques
      </button>

      <h1 className="page-title" style={{ marginBottom: 16 }}>Bilan - {boutique.nom}</h1>

      {/* Cartes de statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <ShoppingCart size={28} style={{ margin: '0 auto 12px', color: '#3b82f6' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Commandes</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalOrders}</p>
        </div>

        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <CheckCircle size={28} style={{ margin: '0 auto 12px', color: '#10b981' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Confirmées</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalConfirmed}</p>
        </div>

        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <XCircle size={28} style={{ margin: '0 auto 12px', color: '#ef4444' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Annulées</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalCancelled}</p>
        </div>

        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <TrendingUp size={28} style={{ margin: '0 auto 12px', color: '#f59e0b' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Revenu Total</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalRevenue.toLocaleString('fr-GN')} GNF</p>
        </div>
      </div>

      {/* Dernier reset */}
      <div className="card" style={{ padding: 12, marginBottom: 20, background: '#f9fafb' }}>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Dernière réinitialisation</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
          {new Date(stats.lastResetDate).toLocaleDateString('fr-GN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Retour */}
      <button
        onClick={() => navigate('/admin/boutiques')}
        style={{
          width: '100%',
          padding: 12,
          background: '#e5e7eb',
          color: '#1f2937',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Retour aux boutiques
      </button>
    </div>
  );
};

export default AdminBoutiqueDetail;
