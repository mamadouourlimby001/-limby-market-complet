import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import UnlockButton from '../components/UnlockButton';
import ReportButton from '../components/ReportButton';

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhotoIndex, setExpandedPhotoIndex] = useState(null);
  const catLabels = { Location: 'Location', Colocation: 'Colocation', Vente_immobilière: 'Vente immobilière' };

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get(`/locations/${id}`); setLocation(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!location) return <div className="page"><div className="empty-state"><p>Location introuvable</p></div></div>;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ height: 250 }}><PhotoSlider photos={location.photos} onPhotoClick={setExpandedPhotoIndex} /></div>
      {expandedPhotoIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.8)' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{expandedPhotoIndex + 1} / {location.photos.length}</span>
            <button onClick={() => setExpandedPhotoIndex(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', padding: 0 }}>×</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={location.photos[expandedPhotoIndex]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            {location.photos.length > 1 && (
              <>
                <button onClick={() => setExpandedPhotoIndex(i => i > 0 ? i - 1 : location.photos.length - 1)} 
                  style={{ position: 'absolute', left: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={() => setExpandedPhotoIndex(i => i < location.photos.length - 1 ? i + 1 : 0)} 
                  style={{ position: 'absolute', right: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </>
            )}
          </div>
        </div>
      )}
      <div style={{ padding: 14 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{location.titre}</h1>
        <p className="price" style={{ fontSize: 20, marginBottom: 10 }}>{location.prix?.toLocaleString('fr-GN')} GNF</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-primary">{catLabels[location.categorie]}</span>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {location.ville}, {location.quartier === 'hidden' ? 'Quartier masqué' : location.quartier}</span>
        </div>
        {location.description && <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 12, lineHeight: 1.5 }}>{location.description}</p>}
        <UnlockButton type="location" id={location._id} contact={location.contact} quartier={location.quartier} />
        <div style={{ marginTop: 8 }}><ReportButton typeContenu="location" contenuId={location._id} /></div>
      </div>
    </div>
  );
};

export default LocationDetail;
