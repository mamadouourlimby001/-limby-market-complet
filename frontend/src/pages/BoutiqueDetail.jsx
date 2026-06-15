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
          💬 Contacter par WhatsApp
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
