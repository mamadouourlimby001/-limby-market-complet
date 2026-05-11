import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { BarChart3, TrendingUp, ShoppingCart, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const BoutiqueBilan = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/boutiques/stats/bilan');
      setStats(res.data);
    } catch (err) {
      alert('Erreur lors de la récupération du bilan');
      console.error(err);
      navigate('/my-boutique');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Êtes-vous sûr ? Cette action réinitialisera tous les compteurs.')) {
      return;
    }

    setResetting(true);
    try {
      const res = await api.put('/boutiques/stats/reset');
      setStats(res.data.data);
      alert('Statistiques réinitialisées');
    } catch (err) {
      alert('Erreur lors de la réinitialisation');
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page">
        <div className="empty-state"><p>Impossible de charger le bilan</p></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 24 }}>📊 Bilan de la boutique</h1>

      {/* Cartes de statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Total Commandes */}
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <ShoppingCart size={28} style={{ margin: '0 auto 12px', color: '#3b82f6' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Commandes</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalOrders}</p>
        </div>

        {/* Total Confirmées */}
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <CheckCircle size={28} style={{ margin: '0 auto 12px', color: '#10b981' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Confirmées</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalConfirmed}</p>
        </div>

        {/* Total Annulées */}
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <XCircle size={28} style={{ margin: '0 auto 12px', color: '#ef4444' }} />
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Annulées</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.totalCancelled}</p>
        </div>

        {/* Revenu Total */}
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

      {/* Bouton Réinitialiser */}
      <button
        onClick={handleReset}
        disabled={resetting}
        style={{
          width: '100%',
          padding: 14,
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: resetting ? 'not-allowed' : 'pointer',
          opacity: resetting ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <RotateCcw size={16} />
        {resetting ? 'Réinitialisation...' : 'Réinitialiser les compteurs'}
      </button>

      {/* Retour */}
      <button
        onClick={() => navigate('/my-boutique')}
        style={{
          width: '100%',
          padding: 12,
          background: '#e5e7eb',
          color: '#1f2937',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 8
        }}
      >
        Retour à ma boutique
      </button>
    </div>
  );
};

export default BoutiqueBilan;
