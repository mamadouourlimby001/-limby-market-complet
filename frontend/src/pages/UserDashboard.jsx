import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import UserMessages from './UserMessages';

const UserDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [boutique, setBoutique] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(null);
  const [tab, setTab] = useState('profil');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      await refreshUser();
      const [prodRes, locRes, annRes, boutRes, notifRes, histRes, messagesRes] = await Promise.all([
        api.get('/products', { params: { vendeur: user?._id } }),
        api.get('/locations'),
        api.get('/announcements'),
        api.get('/boutiques/my-boutique').catch(() => ({ data: null })),
        api.get('/notifications'),
        api.get('/credits/my-history'),
        api.get('/messages/my-messages').catch(err => ({ data: { unreadCount: 0 } }))
      ]);
      setProducts(prodRes.data.filter(p => p.vendeur?._id === user?._id));
      setLocations(locRes.data.filter(l => l.proprietaire?._id === user?._id));
      setAnnouncements(annRes.data.filter(a => a.auteur?._id === user?._id));
      setBoutique(boutRes.data || null);
      setNotifications(notifRes.data);
      setHistory(histRes.data);
      setUnreadMessagesCount(messagesRes.data.unreadCount || 0);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Supprimer ?')) return;
    try {
      await api.delete(`/${type}/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const roleLabels = { acheteur: 'Acheteur', vendeur: 'Vendeur', vendeur_boutique: 'Vendeur Boutique', admin_simple: 'Admin', admin_supreme: 'Admin Suprême' };

  return (
    <div className="page">
      <h1 className="page-title">Mon Compte</h1>
      <div className="tabs">
        {['profil', 'publications', 'crédits', 'notifications', 'messages'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'messages' ? (
              <span>
                Messages {unreadMessagesCount > 0 && <span style={{ marginLeft: 6, backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: 11, fontWeight: 'bold' }}>{unreadMessagesCount}</span>}
              </span>
            ) : (
              t.charAt(0).toUpperCase() + t.slice(1)
            )}
          </button>
        ))}
      </div>

      {tab === 'profil' && (
        <div>
          <div className="card" style={{ padding: 14, marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{user?.nom}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>📞 {user?.telephone}</p>
            <p style={{ fontSize: 13, marginBottom: 4 }}><span className="badge badge-primary">{roleLabels[user?.role]}</span> {user?.isVerified && <span className="badge badge-success">✓ Vérifié</span>}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B', marginTop: 8 }}>💰 {user?.credits} crédits</p>
            {user?.creditExpiry && <p style={{ fontSize: 11, color: '#6b7280' }}>Expire le {new Date(user.creditExpiry).toLocaleDateString('fr-FR')}</p>}
          </div>
          <Link to="/credits/acheter" className="btn btn-primary btn-block" style={{ marginBottom: 8 }}>💰 Acheter des crédits</Link>
          {boutique && (
            <div className="card" style={{ padding: 14, marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>🏪 Ma Boutique: {boutique.nom}</h3>
              <p style={{ fontSize: 12 }}>Statut: <span className={`badge ${boutique.isActive ? 'badge-success' : 'badge-danger'}`}>{boutique.isActive ? 'Active' : 'Inactive'}</span></p>
              {boutique.dateExpiration && <p style={{ fontSize: 11, color: '#6b7280' }}>Expire le {new Date(boutique.dateExpiration).toLocaleDateString('fr-FR')}</p>}
              <Link to="/credits/renouveler-abonnement" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>Renouveler abonnement</Link>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-danger btn-block">Déconnexion</button>
        </div>
      )}

      {tab === 'publications' && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Mes produits ({products.length})</h3>
          {products.map(p => (
            <div key={p._id} className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ fontSize: 13, fontWeight: 600 }}>{p.titre}</p><p style={{ fontSize: 11, color: '#6b7280' }}>{p.prix?.toLocaleString('fr-GN')} GNF</p></div>
              <button onClick={() => handleDelete('products', p._id)} className="btn btn-danger btn-sm">🗑️</button>
            </div>
          ))}
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 16 }}>Mes locations ({locations.length})</h3>
          {locations.map(l => (
            <div key={l._id} className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ fontSize: 13, fontWeight: 600 }}>{l.titre}</p><p style={{ fontSize: 11, color: '#6b7280' }}>{l.prix?.toLocaleString('fr-GN')} GNF</p></div>
              <button onClick={() => handleDelete('locations', l._id)} className="btn btn-danger btn-sm">🗑️</button>
            </div>
          ))}
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 16 }}>Mes annonces ({announcements.length})</h3>
          {announcements.map(a => (
            <div key={a._id} className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ fontSize: 13, fontWeight: 600 }}>{a.titre}</p><p style={{ fontSize: 11, color: '#6b7280' }}>{a.salaireMensuel?.toLocaleString('fr-GN')} GNF</p></div>
              <button onClick={() => handleDelete('announcements', a._id)} className="btn btn-danger btn-sm">🗑️</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'crédits' && (
        <div>
          <div className="card" style={{ padding: 14, marginBottom: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#1B2A6B' }}>{user?.credits}</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>crédits disponibles</p>
          </div>
          <Link to="/credits/acheter" className="btn btn-primary btn-block" style={{ marginBottom: 14 }}>Acheter des crédits</Link>
          {history && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Demandes de crédits</h3>
              {history.requests.map((r, i) => (
                <div key={i} className="card" style={{ padding: 10, marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>{r.montant} GNF</span>
                    <span className={`badge ${r.statut === 'approuvé' ? 'badge-success' : r.statut === 'rejeté' ? 'badge-danger' : 'badge-warning'}`}>{r.statut}</span>
                  </div>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 14 }}>Contacts débloqués</h3>
              {history.unlocks.map((u, i) => (
                <div key={i} className="card" style={{ padding: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12 }}>{u.typeContenu} - {u.creditsDepenses} crédit</span>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <div>
          {notifications.length === 0 ? <div className="empty-state"><p>Aucune notification</p></div> :
            notifications.map(n => (
              <div key={n._id} className="card" style={{ padding: 10, marginBottom: 6, opacity: n.lu ? 0.6 : 1, borderLeft: n.lu ? 'none' : '3px solid #1B2A6B' }}>
                <p style={{ fontSize: 13 }}>{n.message}</p>
                <p style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'messages' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Link to="/send-message-to-admins" className="btn btn-primary" style={{ flex: 1 }}>✎ Écrire aux administrateurs</Link>
            <button onClick={fetchAll} className="btn btn-secondary">🔄</button>
          </div>
          <UserMessages embedded={true} />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
