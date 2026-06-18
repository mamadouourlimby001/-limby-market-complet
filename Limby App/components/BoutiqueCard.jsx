import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function BoutiqueCard({ boutique }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 120, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/boutiques/${boutique._id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* Zone logo / image */}
        <View style={styles.logoZone}>
          {boutique.logo ? (
            <Image source={{ uri: boutique.logo }} style={styles.logo} resizeMode="cover" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoLetter}>
                {boutique.nom?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {boutique.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.primaryAccent} />
            </View>
          )}
          {boutique.isCertified && (
            <View style={styles.certBadge}>
              <Ionicons name="checkmark" size={9} color={Colors.white} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{boutique.nom}</Text>
          <Text style={styles.category} numberOfLines={1}>{boutique.categorie}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={10} color={Colors.textLight} />
            <Text style={styles.location} numberOfLines={1}>{boutique.ville}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: { flex: 1 },
  logoZone: {
    width: '100%', height: 120,
    position: 'relative',
  },
  logo: { width: '100%', height: '100%' },
  logoPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoLetter: { color: Colors.white, fontSize: 42, fontWeight: 'bold' },
  verifiedBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.white,
    borderRadius: 10, padding: 2,
  },
  certBadge: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: Colors.warning,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  info: { padding: 8 },
  name: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  category: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 10, color: Colors.textLight, flex: 1 },
});
