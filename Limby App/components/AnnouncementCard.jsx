import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function AnnouncementCard({ announcement }) {
  const scale = useRef(new Animated.Value(1)).current;
  const isExpired = announcement.dateLimite && new Date(announcement.dateLimite) < new Date();
  const isUnavailable = announcement.disponible === false;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 120, friction: 6 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }).start();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, (isUnavailable || isExpired) && styles.wrapperFaded]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/annonces/${announcement._id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* En-tête colorée avec icône */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase" size={22} color={Colors.white} />
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expiré</Text>
            </View>
          )}
          <Text style={styles.company} numberOfLines={1}>{announcement.entreprise}</Text>
          <View style={styles.headerLocation}>
            <Ionicons name="location-outline" size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.headerLocationText} numberOfLines={1}>{announcement.villeDeTravail}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={3}>{announcement.titre}</Text>
          <View style={styles.salaryRow}>
            <Ionicons name="cash-outline" size={12} color={Colors.success} />
            <Text style={styles.salary}>{announcement.salaireMensuel?.toLocaleString('fr-FR')} GNF</Text>
          </View>
          {announcement.dateLimite && (
            <Text style={styles.deadline}>Limite : {formatDate(announcement.dateLimite)}</Text>
          )}
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
  wrapperFaded: { opacity: 0.6 },
  card: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    padding: 12,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  iconCircle: {
    position: 'absolute', top: 10, right: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  expiredBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: Colors.danger,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
  },
  expiredText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  company: { fontSize: 13, fontWeight: '700', color: Colors.white, marginBottom: 3 },
  headerLocation: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerLocationText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', flex: 1 },
  info: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, lineHeight: 18 },
  salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  salary: { fontSize: 11, fontWeight: '700', color: Colors.success },
  deadline: { fontSize: 10, color: Colors.textMuted },
});
