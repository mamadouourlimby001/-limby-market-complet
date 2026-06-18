import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, getToken, removeToken } from '../utils/storage';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch {
      await removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (telephone, motDePasse) => {
    const response = await api.post('/auth/login', { telephone, motDePasse });
    const { token: newToken, user: userData } = response.data;
    await saveToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (nom, telephone, motDePasse) => {
    const response = await api.post('/auth/register', { nom, telephone, motDePasse });
    const { token: newToken, user: userData } = response.data;
    await saveToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch {
      // silently fail
    }
  };

  const isAdmin =
    user?.role === 'admin_simple' || user?.role === 'admin_supreme';
  const isSupremeAdmin = user?.role === 'admin_supreme';
  const hasBoutique =
    user?.role === 'vendeur_boutique';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isSupremeAdmin,
        hasBoutique,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
