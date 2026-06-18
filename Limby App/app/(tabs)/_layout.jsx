import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import TopBar from '../../components/TopBar';

function TabIcon({ name, focused }) {
  return (
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={21}
      color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="occasion"
        options={{
          title: 'Occasion',
          tabBarIcon: ({ focused }) => (
            <Feather name="shopping-bag" size={20} color={focused ? Colors.tabBarActive : Colors.tabBarInactive} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Location',
          tabBarIcon: ({ focused }) => <TabIcon name="business" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="annonces"
        options={{
          title: 'Annonces',
          tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="boutiques"
        options={{
          title: 'Boutiques',
          tabBarIcon: ({ focused }) => (
            <Feather name="grid" size={20} color={focused ? Colors.tabBarActive : Colors.tabBarInactive} />
          ),
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: 'Mon Compte',
          tabBarIcon: ({ focused }) => (
            <Feather name="user" size={20} color={focused ? Colors.tabBarActive : Colors.tabBarInactive} />
          ),
        }}
      />
      <Tabs.Screen
        name="ma-boutique"
        options={{
          title: 'Ma Boutique',
          tabBarIcon: ({ focused }) => <TabIcon name="storefront" focused={focused} />,
        }}
      />
      <Tabs.Screen name="boutiques/[id]" options={{ href: null }} />
      <Tabs.Screen name="occasion/[id]" options={{ href: null }} />
    </Tabs>
  );
}
