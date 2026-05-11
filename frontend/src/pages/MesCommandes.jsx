import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Calendar, Phone, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const MesCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

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
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Annuler cette commande ?')) return;

    try {
      await api.delete(`/orders/${orderId}`);
      await fetchOrders();
      alert('Commande annulée');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Supprimer définitivement cette commande ?')) return;

    setIsDeletingId(orderId);
    try {
      await api.delete(`/orders/${orderId}/delete-permanently`);
      await fetchOrders();
      setExpandedId(null);
      alert('Commande supprimée');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setIsDeletingId(null);
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
      <h1 className="page-title">Mes Commandes</h1>

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
          <Link to="/boutiques" style={{ color: '#1B2A6B', fontWeight: 600, marginTop: 12, display: 'inline-block' }}>
            Explorer les boutiques
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredOrders.map(order => (
            <div key={order._id} className="card" style={{ padding: 12 }}>
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    {order.product?.titre || 'Produit'}
                  </h3>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 8 }}>
                    <span><strong>Boutique:</strong> {order.boutique?.nom}</span>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: getStatusColor(order.status),
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
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

              {/* Notes du vendeur */}
              {order.noteVendeur && (
                <div style={{ background: '#f3f4f6', padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12, borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> Note du vendeur
                  </div>
                  <div style={{ color: '#4b5563' }}>{order.noteVendeur}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {order.status === 'en_attente' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    style={{
                      flex: 1,
                      padding: 10,
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={() => handleDelete(order._id)}
                  disabled={isDeletingId === order._id}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: isDeletingId === order._id ? 'not-allowed' : 'pointer',
                    opacity: isDeletingId === order._id ? 0.6 : 1
                  }}
                >
                  {isDeletingId === order._id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesCommandes;
