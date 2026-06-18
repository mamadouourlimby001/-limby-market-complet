import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { colors } from '../theme/theme';

// Portage exact de frontend/src/components/Navbar.jsx
export default function AppHeader() {
  const { user, isAdmin } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { paddingTop: insets.top, height: 44 + insets.top }]}>
      <Pressable
        style={styles.brand}
        onPress={() => navigation.navigate('Tabs', { screen: 'Accueil', params: { screen: 'Home' } })}
      >
        <Logo size={20} />
        <Text style={styles.brandText}>Limby</Text>
      </Pressable>

      <View style={styles.right}>
        {user ? (
          <>
            <Pressable
              style={styles.creditBadge}
              onPress={() => navigation.navigate('Tabs', { screen: 'Compte', params: { screen: 'UserDashboard' } })}
            >
              <CreditCard size={14} color={colors.primary} />
              <Text style={styles.creditText}>{user.credits}</Text>
            </Pressable>
            {isAdmin && (
              <Pressable style={styles.adminBtn} onPress={() => navigation.navigate('Admin')}>
                <Text style={styles.adminText}>Admin</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Pressable
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Tabs', { screen: 'Compte', params: { screen: 'Login' } })}
          >
            <Text style={styles.loginText}>Connexion</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brandText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(27,42,107,0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  creditText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  adminBtn: { backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  adminText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  loginBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  loginText: { fontSize: 12, fontWeight: '600', color: colors.primary },
});
