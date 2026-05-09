import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import UnlockButton from '../components/UnlockButton';
import ReportButton from '../components/ReportButton';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get(`/announcements/${id}`); setAnn(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!ann) return <div className="page"><div className="empty-state"><p>Annonce introuvable</p></div></div>;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ height: 250 }}><PhotoSlider photos={ann.photos} /></div>
      <div style={{ padding: 14 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{ann.titre}</h1>
        <p className="price" style={{ fontSize: 20, marginBottom: 6 }}>{ann.salaireMensuel?.toLocaleString('fr-GN')} GNF/mois</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className="badge badge-primary">📍 {ann.villeDeTravail}, {ann.quartier}</span>
          <span className="badge badge-primary">🏢 {ann.entreprise}</span>
        </div>
        <div className="badge badge-warning" style={{ marginBottom: 12 }}>⏳ Limite: {new Date(ann.dateLimite).toLocaleDateString('fr-FR')}</div>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Description</h3>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{ann.description}</p>
        </div>
        <UnlockButton type="announcement" id={ann._id} contact={ann.contact} />
        <div style={{ marginTop: 8 }}><ReportButton typeContenu="announcement" contenuId={ann._id} /></div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
