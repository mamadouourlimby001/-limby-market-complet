import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import UnlockButton from '../components/UnlockButton';
import ReportButton from '../components/ReportButton';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const etatLabels = { neuf: 'Neuf', occasion: 'Occasion', bon_etat: 'Bon état', use: 'Usagé' };

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get(`/products/${id}`); setProduct(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!product) return <div className="page"><div className="empty-state"><p>Produit introuvable</p></div></div>;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ height: 250 }}>
        <PhotoSlider photos={product.photos} />
      </div>
      <div style={{ padding: 14 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{product.titre}</h1>
        <p className="price" style={{ fontSize: 20, marginBottom: 10 }}>{product.prix?.toLocaleString('fr-GN')} GNF</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-primary">{product.categorie}</span>
          {product.etat && <span className="badge badge-success">{etatLabels[product.etat]}</span>}
          <span className="badge badge-primary">📍 {product.ville}, {product.quartier}</span>
        </div>
        {product.vendeur?.isVerified && <span className="badge badge-success" style={{ marginBottom: 10 }}>✓ Vendeur vérifié</span>}
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Description</h3>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{product.description}</p>
        </div>
        <UnlockButton type="product" id={product._id} contact={product.contact} />
        <div style={{ marginTop: 8 }}><ReportButton typeContenu="product" contenuId={product._id} /></div>
      </div>
    </div>
  );
};

export default ProductDetail;
