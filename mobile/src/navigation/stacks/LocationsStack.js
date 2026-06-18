import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LocationsListScreen from '../../screens/catalog/LocationsListScreen';
import LocationDetailScreen from '../../screens/catalog/LocationDetailScreen';
import AddLocationScreen from '../../screens/catalog/AddLocationScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function LocationsStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="LocationsList" component={LocationsListScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen name="AddLocation" component={AddLocationScreen} />
    </Stack.Navigator>
  );
}
