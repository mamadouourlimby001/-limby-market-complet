import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import api from '../utils/api';

const TrafficSummaryModal = ({ onClose }) => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBilans = async () => {
      try {
        const res = await api.get('/admin/traffic-summary');
        setBilans(res.data.bilans || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du bilan');
      } finally {
        setLoading(false);
      }
    };
    fetchBilans();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <button 
        onClick={onClose}
        className="btn btn-secondary" 
        style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="page-title">Bilan du trafic par 24 heures</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {bilans.length === 0 ? (
        <div className="empty-state">
          <p>Aucun bilan disponible</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bilans.map((bilan, index) => (
            <div key={index} className="card" style={{ padding: 16, borderLeft: '4px solid #1B2A6B' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B2A6B', margin: 0, marginBottom: 8 }}>
                  {bilan.date}
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                  Période: {bilan.dateDebut} à {bilan.dateFin}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 6 }}>
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>CONNEXIONS TOTALES</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#1B2A6B', margin: 0 }}>
                    {bilan.totalConnexions}
                  </p>
                </div>

                <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 6 }}>
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>UTILISATEURS UNIQUES</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981', margin: 0 }}>
                    {bilan.utilisateursUniques}
                  </p>
                </div>
              </div>

              {/* Résumé par région */}
              {bilan.parRegion && bilan.parRegion.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10, margin: 0, marginBottom: 10 }}>
                    Connexions par région
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Région</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Connexions</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Pourcentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bilan.parRegion.map((region, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{region.nom || '-'}</td>
                            <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>{region.connexions}</td>
                            <td style={{ padding: 8, textAlign: 'center', color: '#6b7280' }}>
                              {bilan.totalConnexions > 0 ? ((region.connexions / bilan.totalConnexions) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Résumé par ville */}
              {bilan.parVille && bilan.parVille.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10, margin: 0, marginBottom: 10 }}>
                    Connexions par ville
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Ville</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Région</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Connexions</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Pourcentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bilan.parVille.map((ville, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{ville.nom || '-'}</td>
                            <td style={{ padding: 8 }}>{ville.region || '-'}</td>
                            <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>{ville.connexions}</td>
                            <td style={{ padding: 8, textAlign: 'center', color: '#6b7280' }}>
                              {bilan.totalConnexions > 0 ? ((ville.connexions / bilan.totalConnexions) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrafficSummaryModal;
