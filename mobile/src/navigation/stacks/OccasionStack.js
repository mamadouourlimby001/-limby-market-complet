import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsListScreen from '../../screens/catalog/ProductsListScreen';
import ProductDetailScreen from '../../screens/catalog/ProductDetailScreen';
import AddProductScreen from '../../screens/catalog/AddProductScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function OccasionStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="ProductsList" component={ProductsListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
}
