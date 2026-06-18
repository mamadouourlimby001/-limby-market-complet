import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

function LimbyLogo({ size = 22, color = Colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M50 5C45 5 35 15 35 25C35 35 45 40 50 50C55 60 65 65 65 75C65 85 55 95 50 95"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </Svg>
  );
}

export default function TopBar() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin_simple' || user?.role === 'admin_supreme';

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 2 }]}>
      <TouchableOpacity onPress={() => router.push('/')} style={styles.brand} activeOpacity={0.7}>
        <LimbyLogo size={22} color={Colors.primary} />
        <Text style={styles.brandText}>Limby</Text>
      </TouchableOpacity>

      <View style={styles.right}>
        {user ? (
          <>
            <TouchableOpacity
              style={styles.credits}
              onPress={() => router.push('/(tabs)/compte')}
              activeOpacity={0.7}
            >
              <Ionicons name="card-outline" size={14} color={Colors.primary} />
              <Text style={styles.creditsText}>{user.credits ?? 0}</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => router.push('/admin')}
                activeOpacity={0.7}
              >
                <Text style={styles.adminText}>Admin</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  credits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryOpacity,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  creditsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
