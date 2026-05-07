import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/occasion', label: 'Occasion', icon: '🛍️', desc: 'Produits d\'occasion' },
  { path: '/locations', label: 'Locations', icon: '🏘️', desc: 'Immobilier' },
  { path: '/annonces', label: 'Annonces', icon: '📋', desc: 'Offres d\'emploi' },
  { path: '/boutiques', label: 'Boutiques', icon: '🏪', desc: 'Boutiques en ligne' },
  { path: '/mon-compte', label: 'Mon Compte', icon: '👤', desc: 'Tableau de bord' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: 'calc(100vh - 108px)',
      background: 'linear-gradient(135deg, #1B2A6B 0%, #2a3d8f 50%, #4A90D9 100%)',
      padding: '20px 16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 20 }}>
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 8 }}>
          <path d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M50 5C45 5 35 15 35 25C35 35 45 40 50 50C55 60 65 65 65 75C65 85 55 95 50 95" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Limby Market</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          La marketplace guinéenne 🇬🇳
        </p>
        {user && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 }}>Bienvenue, {user.nom} !</p>}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        maxWidth: 400, margin: '0 auto'
      }}>
        {menuItems.slice(0, 4).map(item => (
          <Link key={item.path} to={item.path} style={{
            background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '20px 14px',
            textAlign: 'center', textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{item.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B', display: 'block' }}>{item.label}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</span>
          </Link>
        ))}
      </div>

      <div style={{ maxWidth: 400, margin: '12px auto 0' }}>
        <Link to={menuItems[4].path} style={{
          background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '18px 14px',
          textAlign: 'center', display: 'block', textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>{menuItems[4].icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B', display: 'block' }}>{menuItems[4].label}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{menuItems[4].desc}</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
