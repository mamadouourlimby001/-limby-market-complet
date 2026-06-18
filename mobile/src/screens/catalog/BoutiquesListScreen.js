import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Store } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BoutiqueCard from '../../components/BoutiqueCard';
import { Button, Select, FormInput, Loader, EmptyState, Badge } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/BoutiquesList.jsx
export default function BoutiquesListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [boutiques, setBoutiques] = useState([]);
  const [userBoutique, setUserBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterVille, setFilterVille] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/boutiques');
        setBoutiques(res.data);
        if (user) {
          try {
            const userRes = await api.get('/boutiques/my-boutique');
            if (userRes.data) setUserBoutique(userRes.data.boutique || userRes.data);
          } catch (err) {
            // pas de boutique
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const categories = [...new Set(boutiques.map((b) => b.categorie))].filter(Boolean);
  const villes = [...new Set(boutiques.map((b) => b.ville))].filter(Boolean);

  const filteredBoutiques = boutiques.filter((b) => {
    const matchSearch = b.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = !filterCategorie || b.categorie === filterCategorie;
    const matchVille = !filterVille || b.ville === filterVille;
    const notUserBoutique = !userBoutique || b._id !== userBoutique._id;
    return matchSearch && matchCategorie && matchVille && notUserBoutique;
  });

  return (
    <FlatList
      data={filteredBoutiques}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: colors.bg }}
      ListHeaderComponent={
        <View>
          <Text style={styles.pageTitle}>Boutiques</Text>

          {user && user.role !== 'vendeur_boutique' && (
            <Button
              title="🏪 Créer ma boutique"
              block
              style={{ marginBottom: 14 }}
              onPress={() => navigation.navigate('CreateBoutique')}
            />
          )}

          <FormInput placeholder="Chercher par nom..." value={searchTerm} onChangeText={setSearchTerm} />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Select value={filterCategorie} onChange={setFilterCategorie} placeholder="Catégorie" options={[{ label: 'Catégorie', value: '' }, ...categories.map((c) => ({ label: c, value: c }))]} />
            </View>
            <View style={{ flex: 1 }}>
              <Select value={filterVille} onChange={setFilterVille} placeholder="Ville" options={[{ label: 'Ville', value: '' }, ...villes.map((v) => ({ label: v, value: v }))]} />
            </View>
          </View>

          {loading && <Loader />}

          {!loading && userBoutique && (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.sectionTitle}>Votre boutique</Text>
              <View style={{ marginBottom: 8 }}>
                <BoutiqueCard boutique={userBoutique} />
              </View>
              <View style={styles.ownBoutiqueRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.textLight }}>Statut:</Text>
                  <Badge variant={userBoutique.isActive ? 'success' : 'danger'}>{userBoutique.isActive ? 'Active' : 'Inactive'}</Badge>
                </View>
                <Button title="Renouveler" size="sm" onPress={() => navigation.navigate('Compte', { screen: 'RenewSubscription' })} />
              </View>
            </View>
          )}

          {!loading && (
            <Text style={styles.sectionTitle}>{userBoutique ? 'Les autres boutiques' : 'Boutiques'}</Text>
          )}
          {!loading && filteredBoutiques.length === 0 && (
            <EmptyState icon={<Store size={32} color={colors.textLight} />} text="Aucune boutique trouvée" />
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ marginBottom: 10 }}>
          <BoutiqueCard boutique={item} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 32 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  ownBoutiqueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
});
