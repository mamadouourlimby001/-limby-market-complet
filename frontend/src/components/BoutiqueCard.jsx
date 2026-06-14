import { Link } from 'react-router-dom';
import { Check, Phone, MapPin } from 'lucide-react';
import ReportButton from './ReportButton';

const BoutiqueCard = ({ boutique }) => {
  return (
    <div className="card" style={{ padding: '12px' }}>
      <Link to={`/boutiques/${boutique._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0f0f0' }}>
          {boutique.logo ? (
            <img src={boutique.logo} alt={boutique.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>�</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{boutique.nom}</h3>
            {boutique.isVerified && <span title="Vérifiée" style={{ color: '#4A90D9', flexShrink: 0 }}><Check size={14} style={{ display: 'inline' }} /></span>}
          </div>
          {boutique.isCertified && (
            <div style={{ marginBottom: 2 }}>
              <span style={{ fontSize: '10px', fontWeight: 600, background: '#0ea5e9', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Boutique Certifiée</span>
            </div>
          )}
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '3px' }}><Phone size={12} /> {boutique.telephone}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {boutique.quartier}, {boutique.ville}</p>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>{boutique.categorie}</span>
        </div>
      </Link>
      <ReportButton typeContenu="boutique" contenuId={boutique._id} />
    </div>
  );
};

export default BoutiqueCard;
