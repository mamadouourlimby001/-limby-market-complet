import { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const MENU = [
  {
    path: '/occasion',
    label: 'Occasion',
    desc: "Produits d'occasion",
    icon: 'bag-handle',
  },
  {
    path: '/locations',
    label: 'Locations',
    desc: 'Immobilier',
    icon: 'business',
  },
  {
    path: '/annonces',
    label: 'Annonces',
    desc: "Offres d'emploi",
    icon: 'document-text',
  },
  {
    path: '/boutiques',
    label: 'Boutiques',
    desc: 'Boutiques en ligne',
    icon: 'bag',
  },
  {
    path: '/compte',
    label: 'Mon Compte',
    desc: 'Tableau de bord',
    icon: 'person',
  },
  {
    path: '/ma-boutique',
    label: 'Ma Boutique',
    desc: 'Ma boutique',
    icon: 'storefront',
  },
];

function LimbyLogoWhite({ size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 5C55 5 65 15 65 25C65 35 55 40 50 50C45 60 35 65 35 75C35 85 45 95 50 95"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M50 5C45 5 35 15 35 25C35 35 45 40 50 50C55 60 65 65 65 75C65 85 55 95 50 95"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </Svg>
  );
}

function AnimatedCard({ item, index }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 70,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.92, 1],
            }),
          },
        ],
        width: '48%',
      }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(item.path)}
        activeOpacity={0.85}
      >
        <View style={styles.cardIconWrap}>
          <Ionicons name={item.icon} size={32} color={Colors.primary} />
        </View>
        <Text style={styles.cardLabel}>{item.label}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LimbyLogoWhite size={52} />
          <Text style={styles.title}>Limby Market</Text>
          <Text style={styles.subtitle}>La marketplace guinéenne</Text>
          {user && (
            <Text style={styles.welcome}>Bienvenue, {user.nom?.split(' ')[0]} !</Text>
          )}
        </Animated.View>

        {/* 6 cartes */}
        <View style={styles.grid}>
          {MENU.map((item, index) => (
            <AnimatedCard key={item.path} item={item} index={index} />
          ))}
        </View>

        {/* Boutons connexion si non connecté */}
        {!user && (
          <Animated.View style={[styles.authBox, { opacity: headerAnim }]}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>S'inscrire</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnSecondaryText}>Se connecter</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Aide */}
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            <Text style={{ fontWeight: '700' }}>Besoin d'aide ? </Text>
            Contactez-nous via Messages dans Mon Compte, ou appelez/WhatsApp :
          </Text>
          <View style={styles.helpPhones}>
            <Ionicons name="phone-portrait-outline" size={14} color={Colors.white} />
            <Text style={styles.helpPhone}>625 223 418 · 620 768 276</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 28,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  welcome: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 110,
    justifyContent: 'center',
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryOpacity,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  authBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  helpBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  helpText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  helpPhones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpPhone: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
