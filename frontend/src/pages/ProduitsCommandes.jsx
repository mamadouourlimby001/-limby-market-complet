import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Package, CheckCircle, Truck, MapPin } from 'lucide-react';

const ProduitsCommandes = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-boutique-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await api.patch(`/orders/${orderId}/status`, { statut: newStatus });
      alert('✅ Statut mis à jour');
      fetchOrders();
      setSelectedStatus({});
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Erreur lors de la mise à jour'));
    } finally {
      setUpdatingStatus(null);
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

  const nextStatuses = {
    'en_attente': ['confirmé', 'annulé'],
    'confirmé': ['expédié', 'annulé'],
    'expédié': ['livré'],
    'livré': [],
    'annulé': []
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  // Compter les commandes par statut
  const stats = {
    total: orders.length,
    en_attente: orders.filter(o => o.statut === 'en_attente').length,
    confirmé: orders.filter(o => o.statut === 'confirmé').length,
    expédié: orders.filter(o => o.statut === 'expédié').length,
    livré: orders.filter(o => o.statut === 'livré').length
  };

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={24} /> Commandes reçues
      </h1>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.total}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>Total</p>
        </div>
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{stats.en_attente}</p>
          <p style={{ fontSize: 12, color: '#92400e' }}>En attente</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
          <p>Aucune commande reçue</p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Les commandes apparaîtront ici</p>
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
                backgroundColor: expandedOrder === order._id ? '#f9fafb' : '#fff',
                borderLeft: `3px solid ${statusColors[order.statut]}`
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
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
                    <strong>Acheteur:</strong> {order.acheteur?.nom}
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
                      height: 120,
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

                  {/* Buyer Info */}
                  <div style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    borderRadius: 6,
                    marginBottom: 12,
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Informations de l'acheteur</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#6b7280' }}>Nom</p>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{order.acheteur?.nom}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#6b7280' }}>Téléphone</p>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{order.acheteur?.telephone || 'Non renseigné'}</p>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: 11, color: '#6b7280' }}>Email</p>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{order.acheteur?.email || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>

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
                        <strong>Montant total:</strong> {order.prixTotal?.toLocaleString('fr-GN')} GNF
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  {nextStatuses[order.statut]?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        Mettre à jour le statut
                      </label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {nextStatuses[order.statut].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(order._id, status)}
                            disabled={updatingStatus === order._id}
                            className="btn"
                            style={{
                              backgroundColor: statusColors[status],
                              color: '#fff',
                              fontSize: 12,
                              padding: '6px 10px',
                              opacity: updatingStatus === order._id ? 0.6 : 1
                            }}
                          >
                            {status === 'confirmé' && <CheckCircle size={14} style={{ marginRight: 4 }} />}
                            {status === 'expédié' && <Truck size={14} style={{ marginRight: 4 }} />}
                            {statusLabels[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
                    Commande du {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProduitsCommandes;
