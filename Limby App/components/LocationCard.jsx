import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const CATEGORY_ICONS = {
  Location: 'home',
  Colocation: 'people',
  Vente_immobilière: 'business',
};

export default function LocationCard({ location }) {
  const scale = useRef(new Animated.Value(1)).current;
  const photo = location.photos?.[0];
  const isUnavailable = location.disponible === false;
  const iconName = CATEGORY_ICONS[location.categorie] || 'home';

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 120, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, isUnavailable && styles.wrapperUnavailable]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/locations/${location._id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="home-outline" size={32} color={Colors.textMuted} />
          </View>
        )}

        {isUnavailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Indisponible</Text>
          </View>
        )}

        <View style={styles.categoryTag}>
          <Ionicons name={iconName} size={10} color={Colors.white} />
          <Text style={styles.categoryText}>{location.categorie?.replace('_', ' ')}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{location.titre}</Text>
          <Text style={styles.price}>
            {location.prix?.toLocaleString('fr-FR')} GNF
            <Text style={styles.priceUnit}>/mois</Text>
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={10} color={Colors.textLight} />
            <Text style={styles.location} numberOfLines={1}>{location.ville}</Text>
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
  wrapperUnavailable: { opacity: 0.6 },
  card: { flex: 1 },
  image: { width: '100%', height: 140 },
  imagePlaceholder: {
    width: '100%', height: 140,
    backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
  },
  unavailableText: { color: Colors.white, fontSize: 10, fontWeight: '600' },
  categoryTag: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(27,42,107,0.85)',
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
  },
  categoryText: { color: Colors.white, fontSize: 9, fontWeight: '600' },
  info: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  priceUnit: { fontSize: 10, fontWeight: 'normal', color: Colors.textLight },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 10, color: Colors.textLight, flex: 1 },
});
