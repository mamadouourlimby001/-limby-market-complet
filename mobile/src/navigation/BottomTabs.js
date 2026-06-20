import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Home, ShoppingBag, Building2, FileText, User, Store, Warehouse } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

const twoLineLabel = (line1, line2) => ({ color }) => (
  <Text style={{ color, fontSize: 8, fontWeight: '700', textAlign: 'center', lineHeight: 11, marginTop: 1 }}>
    {line1}{'\n'}{line2}
  </Text>
);

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
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 8, fontWeight: '700' },
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
        options={{ tabBarLabel: twoLineLabel('Mon', 'Compte'), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MaBoutique"
        component={MaBoutiqueStack}
        options={{ tabBarLabel: twoLineLabel('Ma', 'Boutique'), tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Boutiques"
        component={BoutiquesStack}
        options={{ tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
