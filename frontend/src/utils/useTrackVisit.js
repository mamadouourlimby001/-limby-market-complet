import { useEffect, useRef } from 'react';
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

// Récupérer les coordonnées GPS
const getGPSCoordinates = () => {
  return new Promise((resolve) => {
    // Vérifier si les coordonnées sont déjà en cache
    const cachedCoords = localStorage.getItem('gpsCoordinates');
    if (cachedCoords) {
      resolve(JSON.parse(cachedCoords));
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          localStorage.setItem('gpsCoordinates', JSON.stringify(coords));
          resolve(coords);
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error.message);
          resolve(null);
        },
        { timeout: 5000, maximumAge: 3600000 } // 1 heure de cache
      );
    } else {
      resolve(null);
    }
  });
};

export const useTrackVisit = () => {
  const location = useLocation();
  const { user } = useAuth();
  const gpsAttempted = useRef(false);

  useEffect(() => {
    // Essayer de récupérer les coordonnées GPS une seule fois
    if (!gpsAttempted.current && !localStorage.getItem('gpsCoordinates')) {
      gpsAttempted.current = true;
      getGPSCoordinates();
    }
  }, []);

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
        const coords = await getGPSCoordinates();
        
        const trackData = {
          page: location.pathname,
          visitorId: visitorId
        };

        // Ajouter les coordonnées GPS si disponibles
        if (coords) {
          trackData.latitude = coords.latitude;
          trackData.longitude = coords.longitude;
        }

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
