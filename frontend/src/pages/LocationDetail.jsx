import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import UnlockButton from '../components/UnlockButton';
import ReportButton from '../components/ReportButton';

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div style={{ height: 250 }}><PhotoSlider photos={location.photos} /></div>
      <div style={{ padding: 14 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{location.titre}</h1>
        <p className="price" style={{ fontSize: 20, marginBottom: 10 }}>{location.prix?.toLocaleString('fr-GN')} GNF</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-primary">{catLabels[location.categorie]}</span>
          <span className="badge badge-primary">📍 {location.ville}, {location.quartier}</span>
        </div>
        <UnlockButton type="location" id={location._id} contact={location.contact} />
        <div style={{ marginTop: 8 }}><ReportButton typeContenu="location" contenuId={location._id} /></div>
      </div>
    </div>
  );
};

export default LocationDetail;
