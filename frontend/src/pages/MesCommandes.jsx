import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ShoppingCart, Trash2, Eye } from 'lucide-react';

const MesCommandes = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande?')) return;

    try {
      setDeleting(orderId);
      await api.delete(`/orders/${orderId}`);
      alert('✅ Commande annulée');
      fetchOrders();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Erreur lors de l\'annulation'));
    } finally {
      setDeleting(null);
    }
  };

  const statusColors = {
    'en_attente': '#f59e0b',
    'confirmé': '#3b82f6',
    'expédié': '#8b5cf6',
    'livré': '#10b981',
    'annulé': '#ef4444'
  };

  const statusLabels = {
    'en_attente': 'En attente',
    'confirmé': 'Confirmée',
    'expédié': 'Expédiée',
    'livré': 'Livrée',
    'annulé': 'Annulée'
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingCart size={24} /> Mes Commandes
      </h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
          <p>Vous n'avez pas encore de commandes</p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Explorez les boutiques et commandez des produits!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div
              key={order._id}
              style={{
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                backgroundColor: expandedOrder === order._id ? '#f9fafb' : '#fff'
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: expandedOrder === order._id ? 12 : 0
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {order.produit?.titre}
                  </h3>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                    {order.boutique?.nom}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{order.quantite} × {order.prixUnitaire?.toLocaleString('fr-GN')} GNF</span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: statusColors[order.statut],
                        color: '#fff',
                        fontSize: 12
                      }}
                    >
                      {statusLabels[order.statut]}
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#d97706' }}>
                    {order.prixTotal?.toLocaleString('fr-GN')} GNF
                  </p>
                  <Eye size={18} style={{ color: '#6b7280', marginTop: 4 }} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div style={{
                  paddingTop: 12,
                  borderTop: '1px solid #e5e7eb'
                }}>
                  {/* Produit Image */}
                  {order.produit?.photos?.[0] && (
                    <div style={{
                      width: '100%',
                      height: 150,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 6,
                      overflow: 'hidden',
                      marginBottom: 12
                    }}>
                      <img
                        src={order.produit.photos[0]}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Order Details */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Quantité</p>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{order.quantite}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Prix unitaire</p>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{order.prixUnitaire?.toLocaleString('fr-GN')} GNF</p>
                      </div>
                    </div>

                    <div style={{
                      padding: 8,
                      backgroundColor: '#fef3c7',
                      borderRadius: 6,
                      borderLeft: '3px solid #f59e0b'
                    }}>
                      <p style={{ fontSize: 12, color: '#92400e' }}>
                        <strong>Total:</strong> {order.prixTotal?.toLocaleString('fr-GN')} GNF
                      </p>
                    </div>
                  </div>

                  {/* Boutique Info */}
                  <div style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    borderRadius: 6,
                    marginBottom: 12,
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Boutique</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {order.boutique?.logo && (
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#f0f0f0'
                        }}>
                          <img
                            src={order.boutique.logo}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{order.boutique?.nom}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>Propriétaire vérifié</p>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {!['livré', 'annulé'].includes(order.statut) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={deleting === order._id}
                      className="btn btn-danger btn-block"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={16} /> {deleting === order._id ? 'Annulation...' : 'Annuler la commande'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesCommandes;
