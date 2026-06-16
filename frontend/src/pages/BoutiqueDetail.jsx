import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import ReportButton from '../components/ReportButton';
import { MapPin } from 'lucide-react';

const BoutiqueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get(`/boutiques/${id}`); setData(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  // Enregistrer la visite si l'utilisateur n'est pas le propriétaire
  useEffect(() => {
    if (data && user && data.boutique.proprietaire._id !== user._id) {
      const recordVisit = async () => {
        try {
          const cachedCoords = localStorage.getItem('gpsCoordinates');
          let visitData = {};
          
          if (cachedCoords) {
            const { latitude, longitude } = JSON.parse(cachedCoords);
            // Faire la géolocalisation inverse avec Nominatim
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const addressData = await response.json();
            const address = addressData.address || {};
            visitData = {
              pays: address.country || null,
              region: address.state || address.province || null,
              ville: address.city || address.town || address.village || null
            };
          }
          
          await api.post(`/boutiques/${id}/visit`, visitData);
        } catch (error) {
          console.log('Visite non enregistrée:', error);
        }
      };
      recordVisit();
    }
  }, [data, user, id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!data) return <div className="page"><div className="empty-state"><p>Boutique introuvable</p></div></div>;

  const { boutique, products } = data;
  const isOwner = user && boutique.proprietaire?._id === user._id;

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#f0f0f0' }}>
          {boutique.logo && <img src={boutique.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {boutique.nom} {boutique.isVerified && <span style={{ color: '#4A90D9' }}>✔️</span>} {boutique.isCertified && <span style={{ fontSize: '12px', fontWeight: 600, background: '#0ea5e9', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginLeft: '8px' }}>Boutique Certifiée</span>}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{boutique.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
          <MapPin size={16} /> {boutique.quartier}, {boutique.ville}
        </div>
        <p style={{ fontSize: 13, color: '#1B2A6B', fontWeight: 600 }}>☎️ {boutique.telephone}</p>
        <span className="badge badge-primary">{boutique.categorie}</span>
      </div>

      {isOwner && (
        <Link to={`/boutiques/${id}/ajouter-produit`} className="btn btn-primary btn-block" style={{ marginBottom: 14 }}>+ Ajouter un produit</Link>
      )}

      {!isOwner && (
        <a
          href={`https://wa.me/${boutique.telephone?.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-block"
          style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M17.672 13.633c-.36-.18-2.127-1.052-2.456-1.172-.33-.12-.57-.18-.81.18-.24.36-1.01 1.172-1.231 1.412-.22.24-.45.27-.81.09-.36-.18-1.52-.56-2.898-1.788-.65-.58-1.088-1.3-1.214-1.66-.126-.36.014-.555.094-.734.088-.163.195-.423.293-.634.098-.211.049-.395-.024-.553-.074-.158-.81-1.952-.81-1.952-.234-.597-.612-.65-.81-.65-.21 0-.45 0-.69 0-.24 0-.63.09-.96.432-.33.342-1.26 1.231-1.26 3.003 0 1.772 1.29 3.48 1.468 3.72.179.24 2.505 3.827 6.074 5.369 2.507 1.034 3.586 1.028 4.748.912.854-.084 2.653-.734 3.025-1.443.372-.71.372-1.31.26-1.443-.112-.133-.351-.223-.79-.403z" fill="#25D366"/>
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.35 3 .97 4.29L2.05 22l6.02-1.58C9.39 21.75 10.63 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.35-3.88-.97l-.28-.15-2.89.76.77-2.81-.18-.28c-.7-1.14-1.1-2.46-1.1-3.85 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="#25D366"/>
          </svg>
          Contacter par WhatsApp
        </a>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Produits ({products.length})</h2>
      {products.length === 0 ? <div className="empty-state"><p>Aucun produit</p></div> : (
        <div className="grid-2">
          {products.map(p => (
            <Link key={p._id} to={`/boutiques/${id}/produits/${p._id}`} style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              <div className="card" style={{ opacity: p.disponible ? 1 : 0.6 }}>
                <PhotoSlider photos={p.photos} />
                <div style={{ padding: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.titre}</h3>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{p.categorie}</p>
                  <p className="price" style={{ fontSize: 14 }}>{p.prix?.toLocaleString('fr-GN')} GNF</p>
                </div>
              </div>
              {!p.disponible && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  Indisponible
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12 }}><ReportButton typeContenu="boutique" contenuId={boutique._id} /></div>
    </div>
  );
};

export default BoutiqueDetail;
