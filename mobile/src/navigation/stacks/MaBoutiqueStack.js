import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyBoutiqueScreen from '../../screens/boutique/MyBoutiqueScreen';
import CreateBoutiqueScreen from '../../screens/boutique/CreateBoutiqueScreen';
import AddBoutiqueProductScreen from '../../screens/boutique/AddBoutiqueProductScreen';
import ProduitsCommandesScreen from '../../screens/boutique/ProduitsCommandesScreen';
import BoutiqueMessagesScreen from '../../screens/boutique/BoutiqueMessagesScreen';
import BoutiqueVisitsScreen from '../../screens/boutique/BoutiqueVisitsScreen';
import ProductBoutiqueDetailScreen from '../../screens/catalog/ProductBoutiqueDetailScreen';
import OrganiserBoutiqueScreen from '../../screens/boutique/OrganiserBoutiqueScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function MaBoutiqueStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="MyBoutique" component={MyBoutiqueScreen} />
      <Stack.Screen name="CreateBoutique" component={CreateBoutiqueScreen} />
      <Stack.Screen name="AddBoutiqueProduct" component={AddBoutiqueProductScreen} />
      <Stack.Screen name="ProduitsCommandes" component={ProduitsCommandesScreen} />
      <Stack.Screen name="BoutiqueMessages" component={BoutiqueMessagesScreen} />
      <Stack.Screen name="BoutiqueVisits" component={BoutiqueVisitsScreen} />
      <Stack.Screen name="ProductBoutiqueDetail" component={ProductBoutiqueDetailScreen} />
      <Stack.Screen name="OrganiserBoutique" component={OrganiserBoutiqueScreen} />
    </Stack.Navigator>
  );
}
