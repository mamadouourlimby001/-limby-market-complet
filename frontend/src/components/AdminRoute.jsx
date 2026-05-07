import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
