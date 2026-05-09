import { useState, useEffect } from 'react';
import { Package, Phone, Calendar, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const ProduitsCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [noteText, setNoteText] = useState({});

  useEffect(() => {
    fetchOrders();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/boutique-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const noteVendeur = noteText[orderId] || '';
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        noteVendeur
      });
      setNoteText(prev => ({ ...prev, [orderId]: '' }));
      fetchOrders();
      alert('Statut mis à jour');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Supprimer définitivement cette commande ?')) return;

    try {
      await api.delete(`/orders/${orderId}/delete-permanently`);
      fetchOrders();
      alert('Commande supprimée');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'confirmée': return '#3b82f6';
      case 'livrée': return '#059669';
      case 'annulée': return '#dc3545';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'En attente',
      'confirmée': 'Confirmée',
      'livrée': 'Livrée',
      'annulée': 'Annulée'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Commandes Reçues</h1>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {['all', 'en_attente', 'confirmée', 'livrée', 'annulée'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: filter === status ? '#1B2A6B' : '#e5e7eb',
              color: filter === status ? '#fff' : '#1f2937',
              whiteSpace: 'nowrap'
            }}
          >
            {status === 'all' ? 'Toutes' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Compteur */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#6b7280' }}>
        {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          <Package size={32} style={{ margin: '0 auto 12px' }} />
          <p>Aucune commande</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredOrders.map(order => (
            <div key={order._id} className="card" style={{ padding: 12 }}>
              {/* En-tête cliquable */}
              <div
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  paddingBottom: 12,
                  borderBottom: '1px solid #e5e7eb',
                  marginBottom: 12
                }}
              >
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    {order.product?.titre || 'Produit'}
                  </h3>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    <strong>Acheteur:</strong> {order.buyer?.nom}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: getStatusColor(order.status),
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'inline-block',
                      marginBottom: 8
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>
                    {expandedId === order._id ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, fontSize: 12 }}>
                <div>
                  <div style={{ color: '#6b7280', marginBottom: 4 }}>Quantité</div>
                  <div style={{ fontWeight: 600 }}>{order.quantite}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', marginBottom: 4 }}>Prix total</div>
                  <div style={{ fontWeight: 600, color: '#059669' }}>{order.prixTotal} GNF</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 11 }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', marginBottom: 4 }}>Catégorie</div>
                  <div style={{ fontSize: 11 }}>{order.product?.categorie}</div>
                </div>
              </div>

              {/* Notes de l'acheteur */}
              {order.noteAcheteur && (
                <div style={{ background: '#f3f4f6', padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12, borderLeft: '3px solid #3b82f6' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Note de l'acheteur</div>
                  <div style={{ color: '#4b5563' }}>{order.noteAcheteur}</div>
                </div>
              )}

              {/* Contact acheteur */}
              {order.buyer?.telephone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, padding: 8, background: '#f0f9ff', borderRadius: 4 }}>
                  <Phone size={14} style={{ color: '#3b82f6' }} />
                  <span>{order.buyer.telephone}</span>
                </div>
              )}

              {/* Formulaire de réponse - Affichage conditionnel */}
              {expandedId === order._id && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                  {/* Sélecteur de statut */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Mettre à jour le statut:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['en_attente', 'confirmée', 'livrée', 'annulée'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order._id, status)}
                          disabled={statusUpdating[order._id] || order.status === status}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 4,
                            border: '1px solid #e5e7eb',
                            background: order.status === status ? '#1B2A6B' : '#fff',
                            color: order.status === status ? '#fff' : '#1f2937',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: order.status === status ? 'not-allowed' : 'pointer',
                            opacity: order.status === status ? 0.6 : 1
                          }}
                        >
                          {statusUpdating[order._id] && order.status !== status ? 'Mise à jour...' : getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zone note */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Votre note au client:
                    </label>
                    <textarea
                      value={noteText[order._id] || ''}
                      onChange={(e) => setNoteText(prev => ({ ...prev, [order._id]: e.target.value }))}
                      placeholder="Optionnel: délai de livraison, conditions de livraison, etc..."
                      style={{
                        width: '100%',
                        padding: 8,
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: 'inherit',
                        minHeight: 60,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => handleDelete(order._id)}
                    style={{
                      width: '100%',
                      padding: 8,
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      marginTop: 8
                    }}
                  >
                    Supprimer cette commande
                  </button>
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
