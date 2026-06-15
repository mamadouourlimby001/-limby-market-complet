import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Store } from 'lucide-react';
import api from '../utils/api';
import PhotoSlider from '../components/PhotoSlider';
import { useAuth } from '../context/AuthContext';

const ProductBoutiqueDetail = () => {
  const { boutiqueId, productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchProduct();
  }, [boutiqueId, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/boutiques/${boutiqueId}`);
      const { boutique: boutiqueData, products } = res.data;
      
      setBoutique(boutiqueData);
      const prod = products.find(p => p._id === productId);
      if (!prod) {
        setError('Produit non trouvé');
      } else {
        setProduct(prod);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      alert('Veuillez vous connecter');
      navigate('/login');
      return;
    }

    // Empêcher le propriétaire de commande sa propre boutique
    if (user._id === boutique.proprietaire._id || user._id === boutique.proprietaire) {
      alert('Vous ne pouvez pas commander vos propres produits');
      return;
    }

    setOrderLoading(true);
    try {
      await api.post('/orders', {
        productId,
        quantite
      });
      alert('Commande créée avec succès !');
      navigate('/mes-commandes');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error || !product || !boutique) {
    return (
      <div className="page">
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: 16 }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ textAlign: 'center', color: '#dc3545' }}>{error || 'Produit non trouvé'}</div>
      </div>
    );
  }

  const isOwner = user && (user._id === boutique.proprietaire._id || user._id === boutique.proprietaire);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: 12 }}>
          <ArrowLeft size={18} /> Retour
        </button>
      </div>

      {/* Photos */}
      <div style={{ marginBottom: 20 }}>
        <PhotoSlider photos={product.photos || []} height="400px" />
      </div>

      {/* Titre et Prix */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1B2A6B', marginBottom: 4 }}>
          {product.titre}
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          {product.categorie}
        </p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#059669', marginBottom: 12 }}>
          {product.prix} GNF
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Description</h3>
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
          {product.description}
        </p>
      </div>

      {/* Info Boutique */}
      <div className="card" style={{ padding: 12, marginBottom: 20, borderLeft: '4px solid #1B2A6B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {boutique.logo && (
            <img 
              src={boutique.logo} 
              alt={boutique.nom} 
              style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              <Store size={16} style={{ marginRight: 6, display: 'inline' }} />
              {boutique.nom}
            </h4>
            {boutique.isVerified && (
              <p style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Vérifié</p>
            )}
          </div>
        </div>

        {/* Détails boutique */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          {boutique.telephone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} style={{ color: '#6b7280' }} />
              <span>{boutique.telephone}</span>
            </div>
          )}
          {boutique.quartier && boutique.ville && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} style={{ color: '#6b7280' }} />
              <span>{boutique.quartier}, {boutique.ville}</span>
            </div>
          )}
          {boutique.categorie && (
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              <strong>Catégorie:</strong> {boutique.categorie}
            </div>
          )}
        </div>
      </div>

      {/* État de disponibilité */}
      <div style={{ 
        padding: 12, 
        background: product.disponible ? '#dcfce7' : '#fee2e2', 
        border: `2px solid ${product.disponible ? '#22c55e' : '#ef4444'}`,
        borderRadius: 6, 
        marginBottom: 20, 
        textAlign: 'center' 
      }}>
        <p style={{ 
          fontSize: 14, 
          fontWeight: 700, 
          color: product.disponible ? '#22c55e' : '#ef4444' 
        }}>
          {product.disponible ? '✓ Produit disponible' : '✗ Produit indisponible'}
        </p>
      </div>

      {/* Actions */}
      {!isOwner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {product.disponible && (
            <>
              {/* Quantité */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, minWidth: 80 }}>Quantité:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 4, width: 100 }}>
                  <button
                    onClick={() => setQuantite(Math.max(1, quantite - 1))}
                    style={{ flex: 1, padding: 6, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    −
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
                    {quantite}
                  </span>
                  <button
                    onClick={() => setQuantite(quantite + 1)}
                    style={{ flex: 1, padding: 6, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bouton Commander */}
              <button
                onClick={handleOrder}
                disabled={orderLoading}
                style={{
                  padding: 12,
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: orderLoading ? 'not-allowed' : 'pointer',
                  opacity: orderLoading ? 0.6 : 1
                }}
              >
                {orderLoading ? 'Traitement...' : 'Commander maintenant'}
              </button>
            </>
          )}

          {/* Toast Message */}
          {toast.show && (
            <div style={{
              background: '#059669',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              animation: 'slideDown 0.3s ease'
            }}>
              {toast.message}
            </div>
          )}

          {/* Bouton WhatsApp */}
          <a
            href={`https://wa.me/${boutique.telephone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 12,
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M17.672 13.633c-.36-.18-2.127-1.052-2.456-1.172-.33-.12-.57-.18-.81.18-.24.36-1.01 1.172-1.231 1.412-.22.24-.45.27-.81.09-.36-.18-1.52-.56-2.898-1.788-.65-.58-1.088-1.3-1.214-1.66-.126-.36.014-.555.094-.734.088-.163.195-.423.293-.634.098-.211.049-.395-.024-.553-.074-.158-.81-1.952-.81-1.952-.234-.597-.612-.65-.81-.65-.21 0-.45 0-.69 0-.24 0-.63.09-.96.432-.33.342-1.26 1.231-1.26 3.003 0 1.772 1.29 3.48 1.468 3.72.179.24 2.505 3.827 6.074 5.369 2.507 1.034 3.586 1.028 4.748.912.854-.084 2.653-.734 3.025-1.443.372-.71.372-1.31.26-1.443-.112-.133-.351-.223-.79-.403z" fill="#fff"/>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.35 3 .97 4.29L2.05 22l6.02-1.58C9.39 21.75 10.63 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.35-3.88-.97l-.28-.15-2.89.76.77-2.81-.18-.28c-.7-1.14-1.1-2.46-1.1-3.85 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="#fff"/>
            </svg>
            Contacter par WhatsApp
          </a>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 20, background: '#f3f4f6', borderRadius: 6 }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>C'est votre produit</p>
          <Link to={`/boutiques/${boutiqueId}/ajouter-produit`} className="btn btn-primary" style={{ marginTop: 12 }}>
            Modifier
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductBoutiqueDetail;
