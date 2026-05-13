import { Link } from 'react-router-dom';
import { ShoppingBag, Building2, FileText, Store, User, Warehouse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/occasion', label: 'Occasion', icon: 'shopping', desc: 'Produits d\'occasion' },
  { path: '/locations', label: 'Locations', icon: 'building', desc: 'Immobilier' },
  { path: '/annonces', label: 'Annonces', icon: 'announce', desc: 'Offres d\'emploi' },
  { path: '/boutiques', label: 'Boutiques', icon: 'warehouse', desc: 'Boutiques en ligne' },
  { path: '/mon-compte', label: 'Mon Compte', icon: 'user', desc: 'Tableau de bord' },
  { path: '/ma-boutique', label: 'Ma Boutique', icon: 'store', desc: 'Ma boutique' },
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
          La marketplace guinéenne
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
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
              {item.icon === 'shopping' && <ShoppingBag size={32} color="#1B2A6B" />}
              {item.icon === 'building' && <Building2 size={32} color="#1B2A6B" />}
              {item.icon === 'announce' && <FileText size={32} color="#1B2A6B" />}
              {item.icon === 'warehouse' && <Warehouse size={32} color="#1B2A6B" />}
              {item.icon === 'store' && <Store size={32} color="#1B2A6B" />}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B', display: 'block' }}>{item.label}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</span>
          </Link>
        ))}
      </div>

      <div style={{ maxWidth: 400, margin: '12px auto 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12
        }}>
          {menuItems.slice(4, 6).map(item => (
            <Link key={item.path} to={item.path} style={{
              background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '18px 14px',
              textAlign: 'center', textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>
                {item.icon === 'user' && <User size={32} color="#1B2A6B" />}
                {item.icon === 'store' && <Store size={32} color="#1B2A6B" />}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B', display: 'block' }}>{item.label}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 400, margin: '20px auto 0', padding: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
          <strong>Besoin d'aide?</strong> Vous pouvez contacter les admins du site via <strong>Messages</strong> dans <strong>Mon compte</strong>, ou nous appeler/WhatsApp:
        </p>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>📱 625223418 ou 620768276</p>
      </div>
    </div>
  );
};

export default Home;
