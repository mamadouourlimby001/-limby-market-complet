import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import ChangePasswordScreen from '../../screens/auth/ChangePasswordScreen';
import UserDashboardScreen from '../../screens/auth/UserDashboardScreen';
import SendMessageToAdminsScreen from '../../screens/auth/SendMessageToAdminsScreen';
import UserBoutiqueMessagesScreen from '../../screens/auth/UserBoutiqueMessagesScreen';
import BuyCreditsScreen from '../../screens/auth/BuyCreditsScreen';
import RenewSubscriptionScreen from '../../screens/auth/RenewSubscriptionScreen';
import MesCommandesScreen from '../../screens/auth/MesCommandesScreen';
import AppHeader from '../../components/AppHeader';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function CompteStack() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Stack.Navigator
      key={user ? 'logged-in' : 'logged-out'}
      screenOptions={{ header: () => <AppHeader /> }}
      initialRouteName={user ? 'UserDashboard' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
      <Stack.Screen name="SendMessageToAdmins" component={SendMessageToAdminsScreen} />
      <Stack.Screen name="UserBoutiqueMessages" component={UserBoutiqueMessagesScreen} />
      <Stack.Screen name="BuyCredits" component={BuyCreditsScreen} />
      <Stack.Screen name="RenewSubscription" component={RenewSubscriptionScreen} />
      <Stack.Screen name="MesCommandes" component={MesCommandesScreen} />
    </Stack.Navigator>
  );
}
