import { Link } from 'react-router-dom';
import PhotoSlider from './PhotoSlider';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';

const LocationCard = ({ location }) => {
  const catLabels = { Location: 'Location', Colocation: 'Colocation', Vente_immobilière: 'Vente' };
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Link to={`/locations/${location._id}`}>
        <PhotoSlider photos={location.photos} />
      </Link>
      <div style={{ padding: '8px' }}>
        <Link to={`/locations/${location._id}`}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location.titre}</h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>📍 {location.ville}</span>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>{catLabels[location.categorie] || location.categorie}</span>
        </div>
        <p className="price" style={{ fontSize: '14px', marginBottom: 6 }}>
          {location.prix?.toLocaleString('fr-GN')} GNF
        </p>
        <UnlockButton type="location" id={location._id} contact={location.contact} />
        <ReportButton typeContenu="location" contenuId={location._id} />
      </div>
    </div>
  );
};

export default LocationCard;
