import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ServicesListScreen from '../../screens/services/ServicesListScreen';
import ServiceDetailScreen from '../../screens/services/ServiceDetailScreen';
import ServicePostDetailScreen from '../../screens/services/ServicePostDetailScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="ServicesList" component={ServicesListScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ServicePostDetail" component={ServicePostDetailScreen} />
    </Stack.Navigator>
  );
}
