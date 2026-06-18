import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

// Équivalent frontend/src/components/ProtectedRoute.jsx : redirige vers l'écran
// Login (dans l'onglet Compte) si non connecté.
export function withRequireAuth(ScreenComponent) {
  return function Guarded(props) {
    const { user, loading } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
      if (!loading && !user) {
        navigation.navigate('Tabs', { screen: 'Compte', params: { screen: 'Login' } });
      }
    }, [loading, user]);

    if (loading) return <Loader fullScreen />;
    if (!user) return null;
    return <ScreenComponent {...props} />;
  };
}

// Équivalent frontend/src/components/AdminRoute.jsx : redirige vers Accueil si pas admin.
export function withRequireAdmin(ScreenComponent) {
  return function Guarded(props) {
    const { user, loading, isAdmin } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
      if (!loading && (!user || !isAdmin)) {
        navigation.navigate('Tabs', { screen: 'Accueil', params: { screen: 'Home' } });
      }
    }, [loading, user, isAdmin]);

    if (loading) return <Loader fullScreen />;
    if (!user || !isAdmin) return null;
    return <ScreenComponent {...props} />;
  };
}
