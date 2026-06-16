import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Eye } from 'lucide-react';
import api from '../utils/api';

const BoutiqueVisits = ({ boutiqueId, onClose }) => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await api.get(`/boutiques/${boutiqueId}/visits`);
        setBilans(res.data.bilans || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des visites');
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [boutiqueId]);

  const handleSelectForDelete = (date) => {
    const newSet = new Set(selectedForDelete);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    setSelectedForDelete(newSet);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les bilans de visite ?')) return;
    
    setDeleting('all');
    try {
      for (const bilan of bilans) {
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilan.date });
      }
      setBilans([]);
      alert('Tous les bilans de visite ont été supprimés');
      setShowDeleteModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) {
      alert('Sélectionnez au moins un bilan');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedForDelete.size} bilan(s) ?`)) return;
    
    setDeleting('selected');
    try {
      for (const date of selectedForDelete) {
        await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date });
      }
      setBilans(bilans.filter(b => !selectedForDelete.has(b.date)));
      setSelectedForDelete(new Set());
      alert('Bilans supprimés avec succès');
      setShowDeleteModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteBilan = async (bilanDate) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?')) return;
    
    setDeleting(bilanDate);
    try {
      await api.post(`/boutiques/${boutiqueId}/visits/delete`, { date: bilanDate });
      setBilans(bilans.filter(b => b.date !== bilanDate));
      alert('Bilan supprimé avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Visite de la boutique</h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={16} /> Supprimer
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Modal Supprimer */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1B2A6B' }}>Supprimer les bilans de visite</h2>
            <div style={{ marginBottom: 20 }}>
              <button onClick={handleDeleteAll} disabled={deleting === 'all'} style={{ width: '100%', padding: 10, marginBottom: 10, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting === 'all' ? 'Suppression...' : 'Supprimer tous les bilans'}
              </button>
              <p style={{ color: '#6b7280', marginBottom: 12 }}>OU sélectionnez les bilans à supprimer:</p>
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
                {bilans.map(bilan => (
                  <label key={bilan.date} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}>
                    <input type="checkbox" checked={selectedForDelete.has(bilan.date)} onChange={() => handleSelectForDelete(bilan.date)} style={{ cursor: 'pointer' }} />
                    <span>{bilan.date} - {bilan.totalVisites} visite(s)</span>
                  </label>
                ))}
              </div>
              <button onClick={handleDeleteSelected} disabled={deleting === 'selected' || selectedForDelete.size === 0} style={{ width: '100%', marginTop: 12, padding: 10, backgroundColor: selectedForDelete.size === 0 ? '#d1d5db' : '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: selectedForDelete.size === 0 ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting === 'selected' ? 'Suppression...' : `Supprimer les ${selectedForDelete.size} bilan(s) sélectionné(s)`}
              </button>
            </div>
            <button onClick={() => { setShowDeleteModal(false); setSelectedForDelete(new Set()); }} style={{ width: '100%', padding: 10, backgroundColor: '#e5e7eb', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {bilans.length === 0 ? (
        <div className="empty-state">
          <p>Aucune visite enregistrée</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bilans.map((bilan, index) => (
            <div key={index} className="card" style={{ padding: 16, borderLeft: '4px solid #1B2A6B' }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B2A6B', margin: 0, marginBottom: 8 }}>
                    {bilan.date}
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                    Période: {bilan.dateDebut} à {bilan.dateFin}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBilan(bilan.date)}
                  disabled={deleting === bilan.date}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: deleting === bilan.date ? 'not-allowed' : 'pointer',
                    opacity: deleting === bilan.date ? 0.6 : 1,
                  }}
                  title="Supprimer le bilan"
                >
                  <Trash2 size={14} /> {deleting === bilan.date ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 6 }}>
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>NOMBRE DE VISITES</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#1B2A6B', margin: 0 }}>
                    {bilan.totalVisites}
                  </p>
                </div>

                <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 6 }}>
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>VISITEURS UNIQUES</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981', margin: 0 }}>
                    {bilan.visitantsUniques}
                  </p>
                </div>
              </div>

              {bilan.parRegion && bilan.parRegion.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10 }}>
                    Visites par région
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Région</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Visites</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Pourcentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bilan.parRegion.map((region, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{region.nom || '-'}</td>
                            <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>{region.visites}</td>
                            <td style={{ padding: 8, textAlign: 'center', color: '#6b7280' }}>
                              {bilan.totalVisites > 0 ? ((region.visites / bilan.totalVisites) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bilan.parVille && bilan.parVille.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10 }}>
                    Visites par ville
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Ville</th>
                          <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Région</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Visites</th>
                          <th style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>Pourcentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bilan.parVille.map((ville, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 8 }}>{ville.nom || '-'}</td>
                            <td style={{ padding: 8 }}>{ville.region || '-'}</td>
                            <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>{ville.visites}</td>
                            <td style={{ padding: 8, textAlign: 'center', color: '#6b7280' }}>
                              {bilan.totalVisites > 0 ? ((ville.visites / bilan.totalVisites) * 100).toFixed(1) : 0}%
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

export default BoutiqueVisits;
