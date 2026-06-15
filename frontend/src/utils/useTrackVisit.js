import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from './api';
import { useAuth } from '../context/AuthContext';

export const useTrackVisit = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Ne tracker que si l'utilisateur est connecté
    if (!user || !user._id) {
      return;
    }

    // Ignorer les pages d'authentification et certaines routes admin
    const ignoredPaths = ['/login', '/register', '/forgot-password'];
    if (ignoredPaths.includes(location.pathname)) {
      return;
    }

    // Envoyer le tracking de page visit
    const trackVisit = async () => {
      try {
        await api.post('/admin/track-page-visit', { page: location.pathname }).catch(err => {
          // Ne pas bloquer l'expérience utilisateur si le tracking échoue
          console.error('Erreur tracking:', err);
        });
      } catch (error) {
        console.error('Erreur track visit:', error);
      }
    };

    trackVisit();
  }, [location.pathname, user]);
};

export default useTrackVisit;
