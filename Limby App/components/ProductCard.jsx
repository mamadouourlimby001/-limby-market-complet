import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const stateLabels = { neuf: 'Neuf', bon_etat: 'Bon état', occasion: 'Occasion', use: 'Usé' };
const stateColors = {
  neuf: { backgroundColor: '#d1fae5' },
  bon_etat: { backgroundColor: '#dbeafe' },
  occasion: { backgroundColor: '#fef3c7' },
  use: { backgroundColor: '#fce7f3' },
};

export default function ProductCard({ product }) {
  const scale = useRef(new Animated.Value(1)).current;
  const photo = product.photos?.[0];
  const isUnavailable = product.disponible === false;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 120, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, isUnavailable && styles.wrapperUnavailable]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/occasion/${product._id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="bag-handle-outline" size={32} color={Colors.textMuted} />
          </View>
        )}

        {isUnavailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Indisponible</Text>
          </View>
        )}

        {product.etat && (
          <View style={[styles.stateBadge, stateColors[product.etat]]}>
            <Text style={styles.stateText}>{stateLabels[product.etat]}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{product.titre}</Text>
          <Text style={styles.price}>{product.prix?.toLocaleString('fr-FR')} GNF</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={10} color={Colors.textLight} />
            <Text style={styles.location} numberOfLines={1}>{product.ville}</Text>
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
  stateBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
  },
  stateText: { fontSize: 10, fontWeight: '600', color: '#374151' },
  info: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  location: { fontSize: 10, color: Colors.textLight, flex: 1 },
});
