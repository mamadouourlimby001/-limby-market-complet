import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { Colors } from '../../../constants/colors';

const roleLabels = {
  acheteur: 'Acheteur',
  vendeur: 'Vendeur',
  vendeur_boutique: 'Propriétaire de boutique',
  admin_simple: 'Administrateur',
  admin_supreme: 'Super Admin',
};

export default function CompteScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.notLoggedIn}>
        <Ionicons name="person-circle-outline" size={80} color={Colors.border} />
        <Text style={styles.notLoggedInTitle}>Non connecté</Text>
        <Text style={styles.notLoggedInDesc}>
          Connectez-vous pour accéder à votre compte
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* Carte profil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user.nom?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.nom}</Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.profilePhone}>{user.telephone}</Text>
          </View>
          <Text style={styles.profileRole}>{roleLabels[user.role] || user.role}</Text>
        </View>
        {user.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
            <Text style={styles.verifiedText}>Vérifié</Text>
          </View>
        )}
      </View>

      {/* Carte crédits */}
      <TouchableOpacity
        style={styles.creditsCard}
        onPress={() => router.push('/credits/historique')}
        activeOpacity={0.85}
      >
        <View style={styles.creditsLeft}>
          <Ionicons name="card-outline" size={20} color={Colors.primary} />
          <View>
            <Text style={styles.creditsCount}>{user.credits ?? 0}</Text>
            <Text style={styles.creditsLabel}>crédits disponibles</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.buyCreditsBtn} onPress={() => router.push('/credits/acheter')} activeOpacity={0.85}>
          <Text style={styles.buyCreditsBtnText}>Acheter</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Mes publications */}
      <MenuSection title="Mes publications">
        <MenuItem icon="layers-outline" label="Toutes mes publications" onPress={() => router.push('/compte/mes-publications')} />
        <MenuItem icon="bag-handle-outline" label="Ajouter un produit" onPress={() => router.push('/occasion/ajouter')} />
        <MenuItem icon="business-outline" label="Ajouter une location" onPress={() => router.push('/locations/ajouter')} />
        <MenuItem icon="document-text-outline" label="Ajouter une annonce" onPress={() => router.push('/annonces/ajouter')} />
      </MenuSection>

      {/* Commandes */}
      <MenuSection title="Commandes">
        <MenuItem icon="cart-outline" label="Mes commandes" onPress={() => router.push('/commandes/mes-commandes')} />
        {user.role === 'vendeur_boutique' && (
          <MenuItem icon="receipt-outline" label="Commandes reçues" onPress={() => router.push('/commandes/boutique-commandes')} />
        )}
      </MenuSection>

      {/* Ma boutique */}
      {user.role === 'vendeur_boutique' && (
        <MenuSection title="Ma boutique">
          <MenuItem icon="storefront-outline" label="Tableau de bord boutique" onPress={() => router.push('/ma-boutique')} />
          <MenuItem icon="bar-chart-outline" label="Statistiques" onPress={() => router.push('/ma-boutique/bilan')} />
          <MenuItem icon="refresh-circle-outline" label="Renouveler l'abonnement" onPress={() => router.push('/credits/renouveler')} />
        </MenuSection>
      )}

      {/* Messages */}
      <MenuSection title="Messages & Notifications">
        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        <MenuItem icon="chatbubbles-outline" label="Tous mes messages" onPress={() => router.push('/messages/user-messages')} />
        <MenuItem icon="chatbubble-outline" label="Écrire à l'admin" onPress={() => router.push('/messages/admins')} />
        {user.role === 'vendeur_boutique' && (
          <MenuItem icon="mail-outline" label="Messages de ma boutique" onPress={() => router.push('/messages/boutique-messages')} />
        )}
      </MenuSection>

      {/* Administration */}
      {(user.role === 'admin_simple' || user.role === 'admin_supreme') && (
        <MenuSection title="Administration">
          <MenuItem icon="shield-outline" label="Tableau de bord admin" onPress={() => router.push('/admin')} />
        </MenuSection>
      )}

      {/* Sécurité */}
      <MenuSection title="Sécurité">
        <MenuItem icon="lock-closed-outline" label="Changer le mot de passe" onPress={() => router.push('/mon-compte/changer-mot-de-passe')} />
      </MenuSection>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function MenuSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={19} color={Colors.primary} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 14, paddingBottom: 32 },

  notLoggedIn: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, gap: 12, backgroundColor: Colors.background,
  },
  notLoggedInTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  notLoggedInDesc: { fontSize: 14, color: Colors.textLight, textAlign: 'center' },
  loginBtn: {
    width: '100%', backgroundColor: Colors.primary,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  loginBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 15 },
  registerBtn: {
    width: '100%', backgroundColor: Colors.card,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  registerBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 15 },

  profileCard: {
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  avatar: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { color: Colors.white, fontSize: 26, fontWeight: 'bold' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profilePhone: { fontSize: 13, color: Colors.textLight },
  profileRole: {
    fontSize: 11, color: Colors.primary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#d1fae5', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
  },
  verifiedText: { color: Colors.success, fontSize: 11, fontWeight: '600' },

  creditsCard: {
    backgroundColor: Colors.primaryOpacity, borderRadius: 12,
    padding: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: Colors.primary,
  },
  creditsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  creditsCount: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  creditsLabel: { fontSize: 11, color: Colors.textLight },
  buyCreditsBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
  },
  buyCreditsBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingLeft: 4,
  },
  sectionContent: {
    backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIcon: { marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fee2e2', borderRadius: 12,
    paddingVertical: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  logoutText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
});
