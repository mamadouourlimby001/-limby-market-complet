import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from './api';
import { useAuth } from '../context/AuthContext';

// Générer un ID unique pour les visiteurs anonymes
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

export const useTrackVisit = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Ignorer les pages d'authentification et certaines routes admin
    const ignoredPaths = ['/login', '/register', '/forgot-password'];
    if (ignoredPaths.includes(location.pathname)) {
      return;
    }

    // Envoyer le tracking de page visit
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const trackData = {
          page: location.pathname,
          visitorId: visitorId
        };

        await api.post('/admin/track-page-visit', trackData).catch(err => {
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
