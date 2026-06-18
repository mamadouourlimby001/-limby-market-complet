import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnnouncementsListScreen from '../../screens/catalog/AnnouncementsListScreen';
import AnnouncementDetailScreen from '../../screens/catalog/AnnouncementDetailScreen';
import AddAnnouncementScreen from '../../screens/catalog/AddAnnouncementScreen';
import AppHeader from '../../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AnnoncesStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
      <Stack.Screen name="AnnouncementsList" component={AnnouncementsListScreen} />
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      <Stack.Screen name="AddAnnouncement" component={AddAnnouncementScreen} />
    </Stack.Navigator>
  );
}
