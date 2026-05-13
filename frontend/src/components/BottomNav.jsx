import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, ShoppingBag, Building2, FileText, Warehouse, Store, User } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Accueil', icon: 'home' },
  { path: '/occasion', label: 'Occasion', icon: 'shopping' },
  { path: '/locations', label: 'Locations', icon: 'building' },
  { path: '/annonces', label: 'Annonces', icon: 'announce' },
  { path: '/mon-compte', label: 'Mon Compte', icon: 'user' },
  { path: '/ma-boutique', label: 'Ma Boutique', icon: 'store' },
  { path: '/boutiques', label: 'Boutiques', icon: 'warehouse' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
      background: '#fff', borderTop: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 100, boxShadow: '0 -1px 6px rgba(0,0,0,0.05)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path ||
          (tab.path !== '/' && location.pathname.startsWith(tab.path));
        return (
          <Link key={tab.path} to={tab.path} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px', textDecoration: 'none', flex: 1,
            color: isActive ? '#1B2A6B' : '#9ca3af',
            transition: 'color 0.2s'
          }}>
            <span style={{ fontSize: '20px' }}>
              {tab.icon === 'home' && <HomeIcon size={20} />}
              {tab.icon === 'shopping' && <ShoppingBag size={20} />}
              {tab.icon === 'building' && <Building2 size={20} />}
              {tab.icon === 'announce' && <FileText size={20} />}
              {tab.icon === 'user' && <User size={20} />}
              {tab.icon === 'store' && <Store size={20} />}
              {tab.icon === 'warehouse' && <Warehouse size={20} />}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#1B2A6B' : '#9ca3af'
            }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
