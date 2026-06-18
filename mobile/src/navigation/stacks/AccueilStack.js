import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/catalog/HomeScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AccueilStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
