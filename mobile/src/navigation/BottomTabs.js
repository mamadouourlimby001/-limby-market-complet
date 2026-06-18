import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, Building2, FileText, User, Store, Warehouse } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

import AccueilStack from './stacks/AccueilStack';
import OccasionStack from './stacks/OccasionStack';
import LocationsStack from './stacks/LocationsStack';
import AnnoncesStack from './stacks/AnnoncesStack';
import CompteStack from './stacks/CompteStack';
import MaBoutiqueStack from './stacks/MaBoutiqueStack';
import BoutiquesStack from './stacks/BoutiquesStack';

const Tab = createBottomTabNavigator();

// Portage exact de frontend/src/components/BottomNav.jsx (mêmes 7 onglets, même ordre,
// mêmes icônes lucide, même palette active/inactive).
export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={AccueilStack}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Occasion"
        component={OccasionStack}
        options={{ tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsStack}
        options={{ tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Annonces"
        component={AnnoncesStack}
        options={{ tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Compte"
        component={CompteStack}
        options={{ tabBarLabel: 'Mon Compte', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MaBoutique"
        component={MaBoutiqueStack}
        options={{ tabBarLabel: 'Ma Boutique', tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Boutiques"
        component={BoutiquesStack}
        options={{ tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
