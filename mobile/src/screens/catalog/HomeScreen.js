import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Building2, FileText, Store, User, Warehouse, Wrench, Briefcase } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const menuItems = [
  { tab: 'Occasion', screen: 'ProductsList', label: 'Occasion', Icon: ShoppingBag, desc: "Produits d'occasion" },
  { tab: 'Locations', screen: 'LocationsList', label: 'Locations', Icon: Building2, desc: 'Immobilier' },
  { tab: 'Annonces', screen: 'AnnouncementsList', label: 'Annonces', Icon: FileText, desc: "Offres d'emploi" },
  { tab: 'Boutiques', screen: 'BoutiquesList', label: 'Boutiques', Icon: Warehouse, desc: 'Boutiques en ligne' },
  { tab: 'MonProfilService', screen: 'MyService', label: 'Profil Service', Icon: Briefcase, desc: 'Mon profil service' },
  { tab: 'MaBoutique', screen: 'MyBoutique', label: 'Ma Boutique', Icon: Store, desc: 'Ma boutique' },
  { tab: 'Services', screen: 'ServicesList', label: 'Services', Icon: Wrench, desc: 'Prestataires de services' },
  { tab: 'Compte', screen: 'UserDashboard', label: 'Mon Compte', Icon: User, desc: 'Tableau de bord' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const goTo = (item) => navigation.navigate(item.tab, { screen: item.screen });

  return (
    <LinearGradient colors={['#1B2A6B', '#2a3d8f', '#4A90D9']} style={styles.flex}>
      <View style={styles.content}>
        {/* En-tête logo */}
        <View style={styles.header}>
          <Logo size={44} color="#fff" />
          <Text style={styles.title}>Limby Market</Text>
          <Text style={styles.subtitle}>La marketplace guinéenne</Text>
          {user ? <Text style={styles.welcome}>Bienvenue, {user.nom} !</Text> : null}
        </View>

        {/* Grilles de navigation groupées */}
        <View>
          <View style={styles.grid}>
            {menuItems.slice(0, 4).map((item) => (
              <Pressable key={item.label} style={styles.card} onPress={() => goTo(item)}>
                <item.Icon size={28} color="#1B2A6B" />
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.grid, { marginTop: 10 }]}>
            {menuItems.slice(4, 8).map((item) => (
              <Pressable key={item.label} style={styles.card} onPress={() => goTo(item)}>
                <item.Icon size={28} color="#1B2A6B" />
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bloc aide */}
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            <Text style={{ fontWeight: '700' }}>Besoin d'aide?</Text> Contactez les admins via{' '}
            <Text style={{ fontWeight: '700' }}>Messages</Text> dans{' '}
            <Text style={{ fontWeight: '700' }}>Mon compte</Text>, ou appelez-nous sur WhatsApp:
          </Text>
          <Text style={styles.helpPhone}>625 22 34 18 / 620 76 82 76</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    padding: 14,
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  welcome: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, maxWidth: 400, alignSelf: 'center', width: '100%' },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#1B2A6B', marginTop: 6 },
  cardDesc: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  helpBox: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignItems: 'center',
  },
  helpText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, lineHeight: 17, marginBottom: 6, textAlign: 'center' },
  helpPhone: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
