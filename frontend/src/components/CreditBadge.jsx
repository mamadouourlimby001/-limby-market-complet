import { useAuth } from '../context/AuthContext';

const CreditBadge = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(27,42,107,0.08)', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600, color: '#1B2A6B' }}>
      � {user.credits} crédits
    </span>
  );
};

export default CreditBadge;
