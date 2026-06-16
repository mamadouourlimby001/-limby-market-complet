import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const TrafficSummaryModal = ({ onClose }) => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStep, setExportStep] = useState(1);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());
  const [selectedForExport, setSelectedForExport] = useState(new Set());
  const [exportFormat, setExportFormat] = useState(null);
  const [exportDataType, setExportDataType] = useState(null);
  const [exportMode, setExportMode] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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

  const handleSelectForDelete = (date) => {
    const newSet = new Set(selectedForDelete);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    setSelectedForDelete(newSet);
  };

  const handleSelectForExport = (date) => {
    const newSet = new Set(selectedForExport);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    setSelectedForExport(newSet);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les bilans ?')) return;
    
    setDeleting('all');
    try {
      for (const bilan of bilans) {
        await api.post(`/admin/traffic-summary/delete`, { date: bilan.date });
      }
      setBilans([]);
      alert('Tous les bilans ont été supprimés');
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
        await api.post(`/admin/traffic-summary/delete`, { date });
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

  const getFilteredBilans = () => {
    if (exportMode === 'date' && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return bilans.filter(b => {
        const [day, month, year] = b.date.split('/');
        const bilanDate = new Date(year, month - 1, day);
        return bilanDate >= start && bilanDate <= end;
      });
    } else if (exportMode === 'select') {
      return bilans.filter(b => selectedForExport.has(b.date));
    }
    return [];
  };

  const generateExportPDF = () => {
    try {
      const filteredBilans = getFilteredBilans();
      if (filteredBilans.length === 0) {
        alert('Aucun bilan sélectionné');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      doc.setFontSize(16);
      doc.setTextColor(27, 42, 107);
      doc.text('Rapport d\'Analyse du Trafic', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;

      // Fusionner toutes les données
      let totalConnexions = 0;
      const regionMap = new Map();
      const villeMap = new Map();

      filteredBilans.forEach((bilan) => {
        totalConnexions += bilan.totalConnexions;
        if (bilan.parRegion) {
          bilan.parRegion.forEach((region) => {
            const existing = regionMap.get(region.nom);
            regionMap.set(region.nom, (existing || 0) + region.connexions);
          });
        }
        if (bilan.parVille) {
          bilan.parVille.forEach((ville) => {
            const key = `${ville.nom}|${ville.region}`;
            const existing = villeMap.get(key);
            villeMap.set(key, {
              nom: ville.nom,
              region: ville.region,
              connexions: (existing?.connexions || 0) + ville.connexions
            });
          });
        }
      });

      // Afficher les statistiques globales
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Connexions totales: ${totalConnexions}`, 25, yPosition);
      yPosition += 4;
      doc.text(`Nombre de bilans: ${filteredBilans.length}`, 25, yPosition);
      yPosition += 8;

      // Afficher les données par région
      if (exportDataType === 'region' || exportDataType === 'both') {
        if (regionMap.size > 0) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(12);
          doc.setTextColor(27, 42, 107);
          doc.text('Connexions par Région', 20, yPosition);
          yPosition += 8;

          const sortedRegions = Array.from(regionMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map((entry) => [
              entry[0],
              entry[1].toString(),
              ((entry[1] / totalConnexions) * 100).toFixed(1) + '%'
            ]);

          doc.autoTable({
            startY: yPosition,
            head: [['Région', 'Connexions', '%']],
            body: sortedRegions,
            theme: 'grid',
            headStyles: { fillColor: [27, 42, 107], textColor: [255, 255, 255], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 20, right: 20 }
          });
          yPosition = doc.lastAutoTable.finalY + 10;
        }
      }

      // Afficher les données par ville
      if (exportDataType === 'city' || exportDataType === 'both') {
        if (villeMap.size > 0) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(12);
          doc.setTextColor(27, 42, 107);
          doc.text('Connexions par Ville', 20, yPosition);
          yPosition += 8;

          const sortedVilles = Array.from(villeMap.values())
            .sort((a, b) => b.connexions - a.connexions)
            .map((ville) => [
              ville.nom,
              ville.region,
              ville.connexions.toString(),
              ((ville.connexions / totalConnexions) * 100).toFixed(1) + '%'
            ]);

          doc.autoTable({
            startY: yPosition,
            head: [['Ville', 'Région', 'Connexions', '%']],
            body: sortedVilles,
            theme: 'grid',
            headStyles: { fillColor: [27, 42, 107], textColor: [255, 255, 255], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 20, right: 20 }
          });
        }
      }

      doc.save('analyse_trafic.pdf');
      resetExportModal();
    } catch (err) {
      alert('Erreur lors de la génération du PDF');
      console.error('Erreur PDF:', err);
    }
  };

  const generateExportXLSX = () => {
    try {
      const filteredBilans = getFilteredBilans();
      if (filteredBilans.length === 0) {
        alert('Aucun bilan sélectionné');
        return;
      }

      const wb = XLSX.utils.book_new();

      // Fusionner toutes les données
      let totalConnexions = 0;
      const regionMap = new Map();
      const villeMap = new Map();

      filteredBilans.forEach((bilan) => {
        totalConnexions += bilan.totalConnexions;
        if (bilan.parRegion) {
          bilan.parRegion.forEach((region) => {
            const existing = regionMap.get(region.nom);
            regionMap.set(region.nom, (existing || 0) + region.connexions);
          });
        }
        if (bilan.parVille) {
          bilan.parVille.forEach((ville) => {
            const key = `${ville.nom}|${ville.region}`;
            const existing = villeMap.get(key);
            villeMap.set(key, {
              nom: ville.nom,
              region: ville.region,
              connexions: (existing?.connexions || 0) + ville.connexions
            });
          });
        }
      });

      if (exportDataType === 'region' || exportDataType === 'both') {
        const regionData = Array.from(regionMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([region, connexions]) => ({
            'Région': region,
            'Connexions': connexions,
            'Pourcentage': ((connexions / totalConnexions) * 100).toFixed(1) + '%',
            'Total Connexions': totalConnexions
          }));

        if (regionData.length > 0) {
          const wsRegion = XLSX.utils.json_to_sheet(regionData);
          XLSX.utils.book_append_sheet(wb, wsRegion, 'Par Région');
        }
      }

      if (exportDataType === 'city' || exportDataType === 'both') {
        const cityData = Array.from(villeMap.values())
          .sort((a, b) => b.connexions - a.connexions)
          .map((ville) => ({
            'Ville': ville.nom,
            'Région': ville.region,
            'Connexions': ville.connexions,
            'Pourcentage': ((ville.connexions / totalConnexions) * 100).toFixed(1) + '%',
            'Total Connexions': totalConnexions
          }));

        if (cityData.length > 0) {
          const wsCity = XLSX.utils.json_to_sheet(cityData);
          XLSX.utils.book_append_sheet(wb, wsCity, 'Par Ville');
        }
      }

      XLSX.writeFile(wb, 'analyse_trafic.xlsx');
      resetExportModal();
    } catch (err) {
      alert('Erreur lors de la génération du fichier Excel');
      console.error('Erreur XLSX:', err);
    }
  };

  const handleExportConfirm = () => {
    const filtered = getFilteredBilans();
    if (filtered.length === 0) {
      alert('Aucun bilan sélectionné pour l\'export');
      return;
    }

    if (exportFormat === 'pdf') {
      generateExportPDF();
    } else if (exportFormat === 'xlsx') {
      generateExportXLSX();
    }
  };

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
      let yPosition = 20;

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

      if (bilan.parVille && bilan.parVille.length > 0) {
        if (yPosition > 250) {
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

      doc.save(`bilan_trafic_${bilan.date.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      alert('Erreur lors de la génération du PDF');
      console.error('Erreur PDF:', err);
    }
  };

  const resetExportModal = () => {
    setShowExportModal(false);
    setExportStep(1);
    setExportFormat(null);
    setExportDataType(null);
    setExportMode(null);
    setDateRange({ start: '', end: '' });
    setSelectedForExport(new Set());
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
        <h1 className="page-title" style={{ margin: 0 }}>Bilan du trafic par 24 heures</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setShowExportModal(true); setExportStep(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <Download size={16} /> Extraire pour analyser
          </button>
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
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Modal Supprimer */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1B2A6B' }}>Supprimer les bilans</h2>
            <div style={{ marginBottom: 20 }}>
              <button onClick={handleDeleteAll} disabled={deleting === 'all'} style={{ width: '100%', padding: 10, marginBottom: 10, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting === 'all' ? 'Suppression...' : 'Supprimer tous les bilans'}
              </button>
              <p style={{ color: '#6b7280', marginBottom: 12 }}>OU sélectionnez les bilans à supprimer:</p>
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
                {bilans.map(bilan => (
                  <label key={bilan.date} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}>
                    <input type="checkbox" checked={selectedForDelete.has(bilan.date)} onChange={() => handleSelectForDelete(bilan.date)} style={{ cursor: 'pointer' }} />
                    <span>{bilan.date} - {bilan.totalConnexions} connexions</span>
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

      {/* Modal Extraire */}
      {showExportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 600, width: '90%', margin: '20px auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1B2A6B' }}>Extraire pour analyser</h2>

            {exportStep === 1 && (
              <div>
                <p style={{ marginBottom: 16, color: '#6b7280' }}>Étape 1: Choisir le format d'export</p>
                <button onClick={() => { setExportFormat('pdf'); setExportStep(2); }} style={{ width: '100%', padding: 12, marginBottom: 10, backgroundColor: '#1B2A6B', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  📄 PDF
                </button>
                <button onClick={() => { setExportFormat('xlsx'); setExportStep(2); }} style={{ width: '100%', padding: 12, marginBottom: 20, backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  📊 XLSX
                </button>
              </div>
            )}

            {exportStep === 2 && (
              <div>
                <p style={{ marginBottom: 16, color: '#6b7280' }}>Étape 2: Choisir le type de données</p>
                <button onClick={() => { setExportDataType('region'); setExportStep(3); }} style={{ width: '100%', padding: 12, marginBottom: 10, backgroundColor: '#1B2A6B', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Par régions
                </button>
                <button onClick={() => { setExportDataType('city'); setExportStep(3); }} style={{ width: '100%', padding: 12, marginBottom: 10, backgroundColor: '#1B2A6B', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Par villes
                </button>
                <button onClick={() => { setExportDataType('both'); setExportStep(3); }} style={{ width: '100%', padding: 12, marginBottom: 20, backgroundColor: '#1B2A6B', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Les deux
                </button>
                <button onClick={() => setExportStep(1)} style={{ width: '100%', padding: 10, backgroundColor: '#e5e7eb', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Retour
                </button>
              </div>
            )}

            {exportStep === 3 && (
              <div>
                <p style={{ marginBottom: 16, color: '#6b7280' }}>Étape 3: Choisir l'intervalle</p>
                <button onClick={() => setExportMode('date')} style={{ width: '100%', padding: 12, marginBottom: 20, backgroundColor: exportMode === 'date' ? '#059669' : '#10b981', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Par intervalle de dates
                </button>

                {exportMode === 'date' && (
                  <div style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 6, marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 10 }}>
                      <p style={{ fontSize: 12, marginBottom: 4, color: '#6b7280' }}>Date de début</p>
                      <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }} />
                    </label>
                    <label style={{ display: 'block' }}>
                      <p style={{ fontSize: 12, marginBottom: 4, color: '#6b7280' }}>Date de fin</p>
                      <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }} />
                    </label>
                  </div>
                )}

                <button onClick={() => setExportMode('select')} style={{ width: '100%', padding: 12, marginBottom: 20, backgroundColor: exportMode === 'select' ? '#059669' : '#10b981', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Cocher les bilans à extraire
                </button>

                {exportMode === 'select' && (
                  <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, marginBottom: 20 }}>
                    {bilans.map(bilan => (
                      <label key={bilan.date} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}>
                        <input type="checkbox" checked={selectedForExport.has(bilan.date)} onChange={() => handleSelectForExport(bilan.date)} style={{ cursor: 'pointer' }} />
                        <span>{bilan.date} - {bilan.totalConnexions} connexions</span>
                      </label>
                    ))}
                  </div>
                )}

                <button onClick={handleExportConfirm} disabled={exportMode === 'date' ? !dateRange.start || !dateRange.end : selectedForExport.size === 0} style={{ width: '100%', padding: 12, marginBottom: 10, backgroundColor: (exportMode === 'date' ? !dateRange.start || !dateRange.end : selectedForExport.size === 0) ? '#d1d5db' : '#10b981', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Exporter
                </button>
                <button onClick={() => setExportStep(2)} style={{ width: '100%', padding: 10, backgroundColor: '#e5e7eb', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
                  Retour
                </button>
                <button onClick={resetExportModal} style={{ width: '100%', padding: 10, backgroundColor: '#e5e7eb', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {bilans.length === 0 ? (
        <div className="empty-state">
          <p>Aucun bilan disponible</p>
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
                    }}
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
                    }}
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

              {bilan.parRegion && bilan.parRegion.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10 }}>
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

              {bilan.parVille && bilan.parVille.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B2A6B', marginBottom: 10 }}>
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
