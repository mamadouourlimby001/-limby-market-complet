import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '44px',
      background: '#fff', borderBottom: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 12px', zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
          <path d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95" stroke="#1B2A6B" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M50 5C45 5 35 15 35 25C35 35 45 40 50 50C55 60 65 65 65 75C65 85 55 95 50 95" stroke="#1B2A6B" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.4"/>
        </svg>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B2A6B' }}>Limby</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <Link to="/mon-compte" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(27,42,107,0.08)', padding: '4px 10px',
              borderRadius: '16px', fontSize: '12px', fontWeight: 600, color: '#1B2A6B'
            }}>
              � {user.credits}
            </Link>
            {(user.role === 'admin_simple' || user.role === 'admin_supreme') && (
              <Link to="/admin" style={{
                fontSize: '11px', fontWeight: 600, color: '#fff',
                background: '#1B2A6B', padding: '4px 8px', borderRadius: '12px'
              }}>Admin</Link>
            )}
          </>
        ) : (
          <Link to="/login" style={{
            fontSize: '12px', fontWeight: 600, color: '#1B2A6B',
            padding: '4px 12px', border: '1.5px solid #1B2A6B', borderRadius: '16px'
          }}>Connexion</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
