import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Composant interne qui peut accéder au contexte auth
function AppContent() {
  const { user } = useAuth();
  const locationAsked = useRef(false);

  useEffect(() => {
    if (user && !locationAsked.current) {
      locationAsked.current = true;
      requestLocationPermission();
    }
  }, [user]);

  const requestLocationPermission = async () => {
    try {
      const alreadyAsked = await AsyncStorage.getItem('locationPermissionAsked');
      if (alreadyAsked) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      await AsyncStorage.setItem('locationPermissionAsked', 'true');

      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        await AsyncStorage.setItem('gpsCoordinates', JSON.stringify(coords));
      }
    } catch {
      // Silently fail — GPS is optional
    }
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
