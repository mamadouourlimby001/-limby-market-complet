import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../utils/api';

const TrafficSummaryModal = ({ onClose }) => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

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

  const handleDeleteBilan = async (bilanDate) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?')) return;
    
    setDeleting(bilanDate);
    try {
      await api.post(`/admin/traffic-summary/delete`, { date: bilanDate });
      setBilans(bilans.filter(b => b.date !== bilanDate));
      alert('Bilan supprimé avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const generatePDF = (bilan) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // En-tête
      doc.setFontSize(18);
      doc.setTextColor(27, 42, 107);
      doc.text('Bilan du Trafic', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${bilan.date}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.text(`Période: ${bilan.dateDebut} à ${bilan.dateFin}`, pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;

      // Statistiques principales
      doc.setFontSize(12);
      doc.setTextColor(27, 42, 107);
      doc.text('Statistiques Principales', 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Connexions totales: ${bilan.totalConnexions}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Utilisateurs uniques: ${bilan.utilisateursUniques}`, 25, yPosition);

      yPosition += 12;

      // Tableau par région
      if (bilan.parRegion && bilan.parRegion.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(27, 42, 107);
        doc.text('Connexions par Région', 20, yPosition);
        yPosition += 8;

        const regionData = bilan.parRegion.map((region) => [
          region.nom || '-',
          region.connexions.toString(),
          ((region.connexions / bilan.totalConnexions) * 100).toFixed(1) + '%'
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Région', 'Connexions', 'Pourcentage']],
          body: regionData,
          theme: 'grid',
          headStyles: { fillColor: [27, 42, 107], textColor: [255, 255, 255] },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      }

      // Tableau par ville
      if (bilan.parVille && bilan.parVille.length > 0) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(27, 42, 107);
        doc.text('Connexions par Ville', 20, yPosition);
        yPosition += 8;

        const villeData = bilan.parVille.map((ville) => [
          ville.nom || '-',
          ville.region || '-',
          ville.connexions.toString(),
          ((ville.connexions / bilan.totalConnexions) * 100).toFixed(1) + '%'
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Ville', 'Région', 'Connexions', 'Pourcentage']],
          body: villeData,
          theme: 'grid',
          headStyles: { fillColor: [27, 42, 107], textColor: [255, 255, 255] },
          margin: { left: 20, right: 20 }
        });
      }

      // Télécharger le PDF
      doc.save(`bilan_trafic_${bilan.date.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      alert('Erreur lors de la génération du PDF');
      console.error('Erreur PDF:', err);
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
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B2A6B', margin: 0, marginBottom: 8 }}>
                    {bilan.date}
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                    Période: {bilan.dateDebut} à {bilan.dateFin}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => generatePDF(bilan)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
                    title="Télécharger en PDF"
                  >
                    <FileText size={14} /> PDF
                  </button>
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
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => deleting !== bilan.date && (e.target.style.backgroundColor = '#dc2626')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#ef4444')}
                    title="Supprimer le bilan"
                  >
                    <Trash2 size={14} /> {deleting === bilan.date ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
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
