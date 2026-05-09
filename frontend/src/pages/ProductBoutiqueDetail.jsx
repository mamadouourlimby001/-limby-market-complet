import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Store, Send } from 'lucide-react';
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
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

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

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Veuillez écrire un message');
      return;
    }

    if (!user) {
      alert('Veuillez vous connecter');
      navigate('/login');
      return;
    }

    try {
      await api.post('/boutique-messages/send-to-boutique', {
        boutiqueId,
        contenu: messageContent
      });
      alert('Message envoyé à la boutique avec succès');
      setMessageContent('');
      setShowMessageForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
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
        <PhotoSlider photos={product.photos || []} />
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

      {/* Actions */}
      {!isOwner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

          {/* Bouton Message */}
          <button
            onClick={() => setShowMessageForm(!showMessageForm)}
            style={{
              padding: 12,
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Send size={16} /> Écrire à la boutique
          </button>

          {/* Formulaire Message */}
          {showMessageForm && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
              <textarea
                placeholder="Votre message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  marginBottom: 8,
                  minHeight: 80,
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSendMessage}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Envoyer
                </button>
                <button
                  onClick={() => {
                    setShowMessageForm(false);
                    setMessageContent('');
                  }}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
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
