import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

const AdminResetStats = () => {
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('⚠️ Êtes-vous absolument sûr ?\n\nCeci va réinitialiser:\n- Contacts débloqués\n- Transactions\n- Revenus (GNF)\n\nCette action est irréversible !')) {
      return;
    }

    setResetting(true);
    try {
      await api.post('/admin/reset-stats');
      alert('Statistiques réinitialisées avec succès');
      navigate('/admin');
    } catch (err) {
      alert('Erreur lors de la réinitialisation');
      console.error(err);
      setResetting(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 24 }}>⚠️ Réinitialiser les statistiques</h1>

      <div className="card" style={{ padding: 20, marginBottom: 24, background: '#fef2f2', borderLeft: '4px solid #dc2626' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <AlertCircle size={28} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>
              Action irréversible
            </h2>
            <p style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.6 }}>
              Cette opération va réinitialiser les statistiques suivantes du tableau de bord:
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <div style={{
            padding: 12,
            background: '#fee2e2',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            color: '#991b1b'
          }}>
            ❌ Contacts débloqués: Seront remis à 0
          </div>
          <div style={{
            padding: 12,
            background: '#fee2e2',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            color: '#991b1b'
          }}>
            ❌ Transactions: Seront remises à 0
          </div>
          <div style={{
            padding: 12,
            background: '#fee2e2',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            color: '#991b1b'
          }}>
            ❌ Revenus (GNF): Seront remis à 0
          </div>
        </div>

        <div style={{
          padding: 12,
          background: '#dbeafe',
          borderRadius: 6,
          fontSize: 13,
          color: '#1e40af',
          marginTop: 16,
          fontStyle: 'italic'
        }}>
          ℹ️ Les sections "Utilisateurs" et "Publications actives" ne seront pas affectées
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={handleReset}
          disabled={resetting}
          style={{
            padding: 14,
            background: '#dc2626',
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
          {resetting ? 'Réinitialisation en cours...' : 'Réinitialiser les statistiques'}
        </button>

        <button
          onClick={() => navigate('/admin')}
          disabled={resetting}
          style={{
            padding: 12,
            background: '#e5e7eb',
            color: '#1f2937',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: resetting ? 'not-allowed' : 'pointer'
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default AdminResetStats;
