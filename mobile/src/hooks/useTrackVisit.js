import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
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

function askLocationConsent() {
  return new Promise((resolve) => {
    Alert.alert(
      'Activer la localisation',
      'Pour mieux enregistrer les statistiques de visite, souhaitez-vous activer votre localisation ?',
      [
        { text: 'Non', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Oui', onPress: () => resolve(true) },
      ],
      { cancelable: false }
    );
  });
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

      // Si coords déjà en cache, pas besoin de demander
      const cached = await getCachedCoords();
      if (cached) return;

      // Si l'utilisateur a déjà refusé, ne pas redemander
      const alreadyDeclined = await AsyncStorage.getItem('locationDeclined');
      if (alreadyDeclined) return;

      // Demander le consentement à l'utilisateur avant la permission OS
      const consented = await askLocationConsent();
      if (!consented) {
        await AsyncStorage.setItem('locationDeclined', '1');
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        await AsyncStorage.setItem(
          'gpsCoordinates',
          JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        );
      } catch (e) {
        // silencieux
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
