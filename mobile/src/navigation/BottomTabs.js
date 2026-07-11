import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Home, ShoppingBag, Building2, FileText, User, Store, Warehouse, Wrench, Briefcase } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

// Taille d'icône fixe (indépendante de celle fournie par le navigateur) pour que les
// 9 onglets tiennent sur une seule ligne, sans troncature, sur les largeurs d'écran courantes.
const TAB_ICON_SIZE = 17;
const TAB_LABEL_FONT_SIZE = 6.5;

const tabIcon = (Icon) => ({ color }) => <Icon color={color} size={TAB_ICON_SIZE} />;

const twoLineLabel = (line1, line2) => ({ color }) => (
  <Text style={{ color, fontSize: TAB_LABEL_FONT_SIZE, fontWeight: '700', textAlign: 'center', lineHeight: 8, marginTop: 1 }}>
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
import ServicesStack from './stacks/ServicesStack';
import MyServiceStack from './stacks/MyServiceStack';

const Tab = createBottomTabNavigator();

// Portage exact de frontend/src/components/BottomNav.jsx, complété par les onglets "Services"
// et "Mon Profil Service" ajoutés après "Ma Boutique" et "Mon Compte" (mêmes icônes lucide,
// même palette active/inactive ; tailles réduites pour que les 9 onglets restent tous
// visibles sur une seule ligne, sans défilement).
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
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarLabelStyle: { fontSize: TAB_LABEL_FONT_SIZE, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={AccueilStack}
        options={{ tabBarIcon: tabIcon(Home) }}
      />
      <Tab.Screen
        name="Occasion"
        component={OccasionStack}
        options={{ tabBarIcon: tabIcon(ShoppingBag) }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsStack}
        options={{ tabBarIcon: tabIcon(Building2) }}
      />
      <Tab.Screen
        name="Annonces"
        component={AnnoncesStack}
        options={{ tabBarIcon: tabIcon(FileText) }}
      />
      <Tab.Screen
        name="Compte"
        component={CompteStack}
        options={{ tabBarLabel: twoLineLabel('Mon', 'Compte'), tabBarIcon: tabIcon(User) }}
      />
      <Tab.Screen
        name="Boutiques"
        component={BoutiquesStack}
        options={{ tabBarIcon: tabIcon(Warehouse) }}
      />
      <Tab.Screen
        name="MaBoutique"
        component={MaBoutiqueStack}
        options={{ tabBarLabel: twoLineLabel('Ma', 'Boutique'), tabBarIcon: tabIcon(Store) }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStack}
        options={{ tabBarIcon: tabIcon(Wrench) }}
      />
      <Tab.Screen
        name="MonProfilService"
        component={MyServiceStack}
        options={{ tabBarLabel: twoLineLabel('Mon Profil', 'Service'), tabBarIcon: tabIcon(Briefcase) }}
      />
    </Tab.Navigator>
  );
}
