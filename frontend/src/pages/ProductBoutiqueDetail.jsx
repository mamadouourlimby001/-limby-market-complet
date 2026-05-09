import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import ReportButton from '../components/ReportButton';
import { MapPin, ArrowLeft, ShoppingCart } from 'lucide-react';

const ProductBoutiqueDetail = () => {
  const { boutiqueId, productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/boutiques/${boutiqueId}`);
        const product = res.data.products?.find(p => p._id === productId);
        if (!product) throw new Error('Produit non trouvé');
        setData({
          product,
          boutique: res.data.boutique
        });
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [boutiqueId, productId]);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setOrdering(true);
      const response = await api.post('/orders', {
        boutiqueId,
        productId,
        quantite: quantity
      });

      if (response.data) {
        alert('✅ Commande créée avec succès!');
        navigate('/mes-commandes');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ ' + (error.response?.data?.message || 'Erreur lors de la création de la commande'));
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!data) return (
    <div className="page">
      <div style={{ marginBottom: 16 }}>
        <Link to={`/boutiques/${boutiqueId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4A90D9', fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> Retour
        </Link>
      </div>
      <div className="empty-state"><p>Produit introuvable</p></div>
    </div>
  );

  const { product, boutique } = data;

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Back button */}
      <div style={{ padding: '12px 14px 0' }}>
        <Link to={`/boutiques/${boutiqueId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4A90D9', fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> Retour à la boutique
        </Link>
      </div>

      {/* Photos */}
      <div style={{ height: 280 }}>
        <PhotoSlider photos={product.photos} />
      </div>

      {/* Content */}
      <div style={{ padding: 14 }}>
        {/* Title and Price */}
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{product.titre}</h1>
        <p className="price" style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#d97706' }}>
          {product.prix?.toLocaleString('fr-GN')} GNF
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-primary">{product.categorie}</span>
          {product.createdAt && (
            <span className="badge badge-primary" style={{ fontSize: 12 }}>
              {new Date(product.createdAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Description</h3>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{product.description}</p>
        </div>

        {/* Boutique Info */}
        <div style={{
          padding: 12,
          backgroundColor: '#f9fafb',
          borderRadius: 8,
          marginBottom: 14,
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Boutique</h3>
          
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            {boutique.logo && (
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#f0f0f0',
                flexShrink: 0
              }}>
                <img src={boutique.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {boutique.nom}
                {boutique.isVerified && <span style={{ color: '#4A90D9', marginLeft: 4 }}>✔️</span>}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                <MapPin size={14} /> {boutique.quartier}, {boutique.ville}
              </div>
              <p style={{ fontSize: 12, color: '#1B2A6B', fontWeight: 500 }}>☎️ {boutique.telephone}</p>
            </div>
          </div>

          <Link
            to={`/boutiques/${boutiqueId}`}
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: '#f0f0f0',
              color: '#1f2937',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Voir tous les produits
          </Link>
        </div>

        {/* Quantity Selector */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Quantité</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600
              }}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: 60,
                height: 36,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600
              }}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={handleOrder}
          disabled={ordering}
          className="btn btn-primary btn-block"
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            opacity: ordering ? 0.6 : 1,
            cursor: ordering ? 'not-allowed' : 'pointer'
          }}
        >
          <ShoppingCart size={18} /> {ordering ? 'Traitement...' : 'Commander'}
        </button>

        {/* Report Button */}
        <div><ReportButton typeContenu="product" contenuId={product._id} /></div>
      </div>
    </div>
  );
};

export default ProductBoutiqueDetail;
