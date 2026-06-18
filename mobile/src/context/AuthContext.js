import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getToken, setToken as persistToken, removeToken, setStoredUser, removeStoredUser } from '../services/storage';

// Portage fidèle de frontend/src/context/AuthContext.jsx : mêmes méthodes,
// mêmes endpoints, même logique de rôles. Seul le stockage change (SecureStore/AsyncStorage
// au lieu de localStorage).
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
        await refreshUser();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      await removeToken();
      await removeStoredUser();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (telephone, motDePasse) => {
    const res = await api.post('/auth/login', { telephone, motDePasse });
    await persistToken(res.data.token);
    await setStoredUser(res.data.user);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (nom, telephone, motDePasse) => {
    const res = await api.post('/auth/register', { nom, telephone, motDePasse });
    await persistToken(res.data.token);
    await setStoredUser(res.data.user);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await removeToken();
    await removeStoredUser();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && (user.role === 'admin_simple' || user.role === 'admin_supreme');
  const isSupremeAdmin = user && user.role === 'admin_supreme';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAdmin, isSupremeAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
