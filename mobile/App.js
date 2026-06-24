import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import LocationPermissionModal from './src/components/LocationPermissionModal';
import useTrackVisit from './src/hooks/useTrackVisit';
import SplashScreen from './src/screens/SplashScreen';

function AppCore() {
  useTrackVisit(navigationRef);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    (async () => {
      const asked = await AsyncStorage.getItem('locationPermissionAsked');
      if (!asked) setShowLocationModal(true);
    })();
  }, []);

  return (
    <>
      <RootNavigator />
      <LocationPermissionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2600);
    return () => clearTimeout(t);
  }, []);

  const showSplash = !splashDone || (!fontsLoaded && !fontError);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.flex}>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="dark" />
            <AppCore />
          </NavigationContainer>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
