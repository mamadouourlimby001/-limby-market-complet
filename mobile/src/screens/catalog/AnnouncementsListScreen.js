import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AnnouncementCard from '../../components/AnnouncementCard';
import { Button, Select, FormInput, EmptyState, SkeletonList } from '../../components/ui';
import { VILLES_OPTIONS } from '../../constants/villes';
import { colors } from '../../theme/theme';

const EXPANDED_H  = 100;
const COLLAPSED_H = 50;
const COLLAPSE_AT = 50;

export default function AnnouncementsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ villeDeTravail: '', entreprise: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchAnnouncements = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (filters.villeDeTravail) params.villeDeTravail = filters.villeDeTravail;
      if (filters.entreprise) params.entreprise = filters.entreprise;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const headerHeight     = scrollY.interpolate({ inputRange: [0, COLLAPSE_AT], outputRange: [EXPANDED_H, COLLAPSED_H], extrapolate: 'clamp' });
  const expandedOpacity  = scrollY.interpolate({ inputRange: [0, COLLAPSE_AT * 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
  const collapsedOpacity = scrollY.interpolate({ inputRange: [COLLAPSE_AT * 0.5, COLLAPSE_AT], outputRange: [0, 1], extrapolate: 'clamp' });

  const goAdd = () => user ? navigation.navigate('AddAnnouncement') : navigation.navigate('Compte', { screen: 'Login' });

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1 }}><AnnouncementCard announcement={item} /></View>
  ), []);

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.animHeader, { height: headerHeight }]}>
        {/* Étendu — reçoit les touches quand non scrollé */}
        <Animated.View pointerEvents={scrolled ? 'none' : 'auto'} style={[styles.fill, { opacity: expandedOpacity }]}>
          <View style={styles.expandedInner}>
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Annonces</Text>
              <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
            </View>
            <Button title="+ Nouvelle publication" size="sm" block style={{ backgroundColor: '#111', marginBottom: 6 }} onPress={goAdd} />
          </View>
        </Animated.View>
        {/* Réduit — reçoit les touches quand scrollé */}
        <Animated.View pointerEvents={scrolled ? 'auto' : 'none'} style={[styles.fill, { opacity: collapsedOpacity }]}>
          <View style={styles.collapsedInner}>
            <Text style={styles.pageTitleSmall}>Annonces</Text>
            <View style={{ flex: 1 }} />
            <Button title="Filtres" variant="secondary" size="sm" onPress={() => setShowFilters(!showFilters)} />
            <Button title="+" size="sm" style={{ backgroundColor: '#111', marginLeft: 4 }} onPress={goAdd} />
          </View>
        </Animated.View>
      </Animated.View>

      {showFilters && (
        <View style={styles.filterCard}>
          <Select label="Ville de travail" value={filters.villeDeTravail} onChange={(v) => setFilters({ ...filters, villeDeTravail: v })} options={[{ label: 'Toutes', value: '' }, ...VILLES_OPTIONS]} />
          <FormInput label="Entreprise" value={filters.entreprise} onChangeText={(v) => setFilters({ ...filters, entreprise: v })} />
          <Button title="Appliquer" block size="sm" onPress={() => { fetchAnnouncements(); setShowFilters(false); }} />
        </View>
      )}

      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.list}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (e) => setScrolled(e.nativeEvent.contentOffset.y >= COLLAPSE_AT * 0.5),
          }
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAnnouncements(true)} colors={[colors.primary]} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            {loading && <SkeletonList count={6} />}
            {!loading && announcements.length === 0 && <EmptyState text="Aucune annonce trouvée" />}
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  animHeader: { backgroundColor: colors.bg, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.border },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  expandedInner: { paddingHorizontal: 12, paddingTop: 10 },
  collapsedInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  pageTitleSmall: { fontSize: 14, fontWeight: '700', color: colors.primary },
  filterCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 12, marginBottom: 8 },
  list: { padding: 12, paddingBottom: 80 },
});
