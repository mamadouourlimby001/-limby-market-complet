import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminBoutiquesScreen from '../screens/admin/AdminBoutiquesScreen';
import AdminBoutiqueDetailScreen from '../screens/admin/AdminBoutiqueDetailScreen';
import AdminCreditRequestsScreen from '../screens/admin/AdminCreditRequestsScreen';
import AdminSubscriptionsScreen from '../screens/admin/AdminSubscriptionsScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminSendToUsersScreen from '../screens/admin/AdminSendToUsersScreen';
import AdminPasswordsScreen from '../screens/admin/AdminPasswordsScreen';
import AdminMessagesScreen from '../screens/admin/AdminMessagesScreen';
import AdminVisitesScreen from '../screens/admin/AdminVisitesScreen';
import AdminVisiteDetailsScreen from '../screens/admin/AdminVisiteDetailsScreen';
import AdminResetStatsScreen from '../screens/admin/AdminResetStatsScreen';
import AppHeader from '../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminBoutiques" component={AdminBoutiquesScreen} />
      <Stack.Screen name="AdminBoutiqueDetail" component={AdminBoutiqueDetailScreen} />
      <Stack.Screen name="AdminCredits" component={AdminCreditRequestsScreen} />
      <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminSendToUsers" component={AdminSendToUsersScreen} />
      <Stack.Screen name="AdminPasswords" component={AdminPasswordsScreen} />
      <Stack.Screen name="AdminMessages" component={AdminMessagesScreen} />
      <Stack.Screen name="AdminVisites" component={AdminVisitesScreen} />
      <Stack.Screen name="AdminVisiteDetails" component={AdminVisiteDetailsScreen} />
      <Stack.Screen name="AdminResetStats" component={AdminResetStatsScreen} />
    </Stack.Navigator>
  );
}
