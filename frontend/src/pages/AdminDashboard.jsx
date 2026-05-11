import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, CreditCard, RefreshCw, AlertTriangle, Users, PenTool, ShoppingBag, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
  const { isSupremeAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, messagesRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/messages/admin/messages').catch(err => ({ data: { unreadCount: 0 } }))
        ]);
        setStats(statsRes.data);
        setUnreadMessagesCount(messagesRes.data.unreadCount || 0);
      }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const menuItems = [
    { path: '/admin/credits', label: 'Demandes crédits', icon: '�' },
    { path: '/admin/abonnements', label: 'Abonnements', icon: '♻️' },
    { path: '/admin/signalements', label: 'Signalements', icon: '⚠️' },
    { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: '�‍💼' },    { path: '/admin/boutiques', label: 'Boutiques', icon: '🏪' },
    { path: '/admin/reset-stats', label: 'Réinitialiser', icon: '🔄' },    { path: '/admin/send-to-users', label: 'Écrire aux utilisateurs', icon: '✎' },
    { path: '/admin/messages', label: 'Messages', icon: 'messages' }
  ];

  return (
    <div className="page">
      <h1 className="page-title">Administration</h1>

      {stats && (
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Utilisateurs</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalProducts + stats.totalLocations + stats.totalAnnouncements}</div><div className="stat-label">Publications actives</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalBoutiques}</div><div className="stat-label">Boutiques actives</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalUnlocks}</div><div className="stat-label">Contacts débloqués</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalCreditsVendus}</div><div className="stat-label">Transactions</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalRevenue?.toLocaleString('fr-GN')}</div><div className="stat-label">Revenus (GNF)</div></div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} className="card" style={{ padding: 16, textAlign: 'center', textDecoration: 'none', position: 'relative' }}>
            {item.path === '/admin/messages' && unreadMessagesCount > 0 && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 'bold'
              }}>
                {unreadMessagesCount}
              </div>
            )}
            <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>
              {item.path === '/admin/messages' && <MessageSquare size={28} />}
              {item.path === '/admin/credits' && <CreditCard size={28} />}
              {item.path === '/admin/abonnements' && <RefreshCw size={28} />}
              {item.path === '/admin/signalements' && <AlertTriangle size={28} />}
              {item.path === '/admin/utilisateurs' && <Users size={28} />}
              {item.path === '/admin/boutiques' && <ShoppingBag size={28} />}
              {item.path === '/admin/reset-stats' && <RotateCcw size={28} />}
              {item.path === '/admin/send-to-users' && <PenTool size={28} />}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1B2A6B' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {stats?.recentTransactions?.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Dernières transactions</h2>
          {stats.recentTransactions.map((t, i) => (
            <div key={i} className="card" style={{ padding: 10, marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>{t.nomCompte}</p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>{t.telephoneDepot}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1B2A6B' }}>{t.montant} GNF</p>
                  <span className={`badge ${t.statut === 'approuvé' ? 'badge-success' : t.statut === 'rejeté' ? 'badge-danger' : 'badge-warning'}`}>{t.statut}</span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
