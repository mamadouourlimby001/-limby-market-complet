import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BoutiquesListScreen from '../../screens/catalog/BoutiquesListScreen';
import BoutiqueDetailScreen from '../../screens/catalog/BoutiqueDetailScreen';
import ProductBoutiqueDetailScreen from '../../screens/catalog/ProductBoutiqueDetailScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function BoutiquesStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="BoutiquesList" component={BoutiquesListScreen} />
      <Stack.Screen name="BoutiqueDetail" component={BoutiqueDetailScreen} />
      <Stack.Screen name="ProductBoutiqueDetail" component={ProductBoutiqueDetailScreen} />
    </Stack.Navigator>
  );
}
