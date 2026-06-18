import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/NotFound.jsx
export default function NotFoundScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.wrap}>
      <Search size={64} color={colors.text} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.text}>La page que vous cherchez n'existe pas.</Text>
      <Button title="Retour à l'accueil" onPress={() => navigation.navigate('Tabs', { screen: 'Accueil', params: { screen: 'Home' } })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 80, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  text: { fontSize: 14, color: colors.textLight, marginBottom: 24, textAlign: 'center', paddingHorizontal: 20 },
});
