import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyServiceScreen from '../../screens/services/MyServiceScreen';
import CreateServiceScreen from '../../screens/services/CreateServiceScreen';
import AddServicePostScreen from '../../screens/services/AddServicePostScreen';
import RenewServiceSubscriptionScreen from '../../screens/services/RenewServiceSubscriptionScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function MyServiceStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="CreateService" component={CreateServiceScreen} />
      <Stack.Screen name="AddServicePost" component={AddServicePostScreen} />
      <Stack.Screen name="RenewServiceSubscription" component={RenewServiceSubscriptionScreen} />
    </Stack.Navigator>
  );
}
