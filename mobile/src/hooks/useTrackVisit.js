import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const IGNORED_ROUTES = ['Login', 'Register', 'ForgotPassword'];

async function getOrCreateVisitorId() {
  let id = await AsyncStorage.getItem('visitorId');
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('visitorId', id);
  }
  return id;
}

async function getCachedCoords() {
  const raw = await AsyncStorage.getItem('gpsCoordinates');
  return raw ? JSON.parse(raw) : null;
}

// Portage de frontend/src/utils/useTrackVisit.js : appelé une seule fois à la racine
// (à l'intérieur du NavigationContainer), écoute les changements d'écran via navigationRef
// au lieu de useLocation().
export default function useTrackVisit(navigationRef) {
  const { user } = useAuth();
  const gpsAttempted = useRef(false);

  useEffect(() => {
    (async () => {
      if (gpsAttempted.current) return;
      gpsAttempted.current = true;
      const cached = await getCachedCoords();
      if (cached) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        await AsyncStorage.setItem(
          'gpsCoordinates',
          JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        );
      } catch (e) {
        // silencieux, comme côté web
      }
    })();
  }, []);

  useEffect(() => {
    const trackCurrentRoute = async () => {
      if (!navigationRef.isReady()) return;
      const route = navigationRef.getCurrentRoute();
      if (!route || IGNORED_ROUTES.includes(route.name)) return;

      try {
        const visitorId = await getOrCreateVisitorId();
        const coords = await getCachedCoords();
        await api.post('/admin/track-page-visit', {
          page: route.name,
          visitorId,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        });
      } catch (e) {
        // silencieux, comme côté web
      }
    };

    trackCurrentRoute();
    const unsubscribe = navigationRef.addListener('state', trackCurrentRoute);
    return unsubscribe;
  }, [user]);
}
