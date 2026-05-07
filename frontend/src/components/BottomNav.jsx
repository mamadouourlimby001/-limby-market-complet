import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Accueil', icon: '🏠' },
  { path: '/occasion', label: 'Occasion', icon: '🛍️' },
  { path: '/locations', label: 'Locations', icon: '🏘️' },
  { path: '/annonces', label: 'Annonces', icon: '📋' },
  { path: '/boutiques', label: 'Boutiques', icon: '🏪' },
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
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
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
