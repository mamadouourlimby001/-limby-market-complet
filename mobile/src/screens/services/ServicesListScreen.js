import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Wrench } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ServiceCard from '../../components/ServiceCard';
import { Button, Select, FormInput, EmptyState, Badge, SkeletonList } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function ServicesListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [userService, setUserService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetier, setFilterMetier] = useState('');
  const [filterVille, setFilterVille] = useState('');

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
      if (user) {
        try {
          const userRes = await api.get('/services/my-service');
          if (userRes.data) setUserService(userRes.data.service || userRes.data);
        } catch (err) {
          // pas de service
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1 }}>
      <ServiceCard service={item} />
    </View>
  ), []);

  const metiers = [...new Set(services.map((s) => s.metier))].filter(Boolean);
  const villes = [...new Set(services.map((s) => s.ville))].filter(Boolean);

  const filteredServices = useMemo(() => services.filter((s) => {
    const matchSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMetier = !filterMetier || s.metier === filterMetier;
    const matchVille = !filterVille || s.ville === filterVille;
    const notUserService = !userService || s._id !== userService._id;
    return matchSearch && matchMetier && matchVille && notUserService;
  }), [services, searchTerm, filterMetier, filterVille, userService]);

  return (
    <FlatList
      data={filteredServices}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: colors.bg }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.pageTitle}>Services</Text>

          {user && user.role !== 'vendeur_service' && (
            <Button
              title="Proposer mes compétences"
              block
              style={{ marginBottom: 14 }}
              onPress={() => navigation.navigate('MonProfilService', { screen: 'CreateService' })}
            />
          )}

          <FormInput placeholder="Chercher par nom..." value={searchTerm} onChangeText={setSearchTerm} />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Select value={filterMetier} onChange={setFilterMetier} placeholder="Métier" options={[{ label: 'Métier', value: '' }, ...metiers.map((m) => ({ label: m, value: m }))]} />
            </View>
            <View style={{ flex: 1 }}>
              <Select value={filterVille} onChange={setFilterVille} placeholder="Ville" options={[{ label: 'Ville', value: '' }, ...villes.map((v) => ({ label: v, value: v }))]} />
            </View>
          </View>

          {loading && <SkeletonList count={6} />}

          {!loading && userService && (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.sectionTitle}>Votre profil</Text>
              <View style={{ marginBottom: 8 }}>
                <ServiceCard service={userService} />
              </View>
              <View style={styles.ownServiceRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.textLight }}>Statut:</Text>
                  <Badge variant={userService.isActive ? 'success' : 'danger'}>{userService.isActive ? 'Actif' : 'Inactif'}</Badge>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button title="Modifier" size="sm" variant="secondary" onPress={() => navigation.navigate('MonProfilService', { screen: 'CreateService' })} />
                  <Button title="Renouveler" size="sm" onPress={() => navigation.navigate('MonProfilService', { screen: 'RenewServiceSubscription' })} />
                </View>
              </View>
            </View>
          )}

          {!loading && (
            <Text style={styles.sectionTitle}>{userService ? 'Les autres prestataires' : 'Prestataires'}</Text>
          )}
          {!loading && filteredServices.length === 0 && (
            <EmptyState icon={<Wrench size={32} color={colors.textLight} />} text="Aucun prestataire trouvé" />
          )}
        </View>
      }
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 32 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  ownServiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
});
