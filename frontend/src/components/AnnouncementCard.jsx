import { Link } from 'react-router-dom';
import PhotoSlider from './PhotoSlider';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Link to={`/annonces/${announcement._id}`}>
        <PhotoSlider photos={announcement.photos} />
      </Link>
      <div style={{ padding: '8px' }}>
        <Link to={`/annonces/${announcement._id}`}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{announcement.titre}</h3>
        </Link>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: 2 }}>📍 {announcement.villeDeTravail}</div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: 4 }}>
          🏢 {announcement.entreprise}
        </div>
        <p className="price" style={{ fontSize: '14px', marginBottom: 2 }}>
          {announcement.salaireMensuel?.toLocaleString('fr-GN')} GNF/mois
        </p>
        <div style={{ fontSize: '10px', color: '#f59e0b', marginBottom: 6 }}>
          ⏳ Limite: {new Date(announcement.dateLimite).toLocaleDateString('fr-FR')}
        </div>
        <UnlockButton type="announcement" id={announcement._id} contact={announcement.contact} />
        <ReportButton typeContenu="announcement" contenuId={announcement._id} />
      </div>
    </div>
  );
};

export default AnnouncementCard;
