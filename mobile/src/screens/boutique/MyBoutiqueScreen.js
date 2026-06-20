import { useState, useCallback } from 'react';
import { View, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Package, Trash2, Check, X, Eye } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import PhotoSlider from '../../components/PhotoSlider';
import { Button, Card, Badge, FormInput, Select, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

const SORT_OPTIONS = [
  { label: 'Récent', value: 'recent' },
  { label: 'Prix ↑', value: 'price-asc' },
  { label: 'Prix ↓', value: 'price-desc' },
];

// Portage exact de frontend/src/pages/MyBoutique.jsx
export default function MyBoutiqueScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [updatingProductId, setUpdatingProductId] = useState(null);

  const fetchBoutique = async () => {
    try {
      const [boutRes, messagesRes] = await Promise.all([
        api.get('/boutiques/my-boutique'),
        api.get('/boutique-messages/boutique-inbox').catch(() => ({ data: { unreadCount: 0 } })),
      ]);
      setData(boutRes.data);
      setUnreadMessagesCount(messagesRes.data.unreadCount || 0);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBoutique(); }, []));

  const deleteProduct = (productId) => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/boutiques/${data.boutique._id}/products/${productId}`);
          Alert.alert('', 'Produit supprimé avec succès');
          fetchBoutique();
        } catch (err) {
          Alert.alert('', 'Erreur lors de la suppression du produit');
        }
      } },
    ]);
  };

  const toggleDisponibilite = async (productId) => {
    try {
      setUpdatingProductId(productId);
      await api.put(`/boutiques/${data.boutique._id}/products/${productId}/disponibilite`);
      await fetchBoutique();
    } catch (err) {
      Alert.alert('', 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingProductId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (!data) {
    return (
      <Screen center>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ marginBottom: 12 }}>Vous n'avez pas encore de boutique</Text>
          <Button title="Créer une boutique" onPress={() => navigation.navigate('CreateBoutique')} />
        </View>
      </Screen>
    );
  }

  const { boutique, products } = data;
  let filteredProducts = products;
  if (search) {
    filteredProducts = filteredProducts.filter(
      (p) => p.titre.toLowerCase().includes(search.toLowerCase()) || p.categorie.toLowerCase().includes(search.toLowerCase())
    );
  }
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.prix - b.prix;
    if (sort === 'price-desc') return b.prix - a.prix;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const availableProducts = filteredProducts.filter((p) => p.disponible);
  const unavailableProducts = filteredProducts.filter((p) => !p.disponible);

  const renderProductGrid = (list) => (
    <View style={styles.grid}>
      {list.map((p) => (
        <View key={p._id} style={styles.gridItem}>
          <Pressable onPress={() => navigation.navigate('ProductBoutiqueDetail', { boutiqueId: boutique._id, productId: p._id })}>
            <Card style={{ opacity: p.disponible ? 1 : 0.6, overflow: 'hidden' }}>
              {p.photos?.length > 0
                ? <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                : <View style={{ width: '100%', height: 110, backgroundColor: '#f0f0f0' }} />
              }
              <View style={{ padding: 8 }}>
                <Text style={styles.productTitle} numberOfLines={1}>{p.titre}</Text>
                <Text style={styles.productCategorie}>{p.categorie}</Text>
                <Text style={styles.productPrice}>{Number(p.prix || 0).toLocaleString('fr-FR')} GNF</Text>
              </View>
            </Card>
          </Pressable>
          <Pressable
            disabled={updatingProductId === p._id}
            onPress={() => toggleDisponibilite(p._id)}
            style={[styles.dispoBtn, { backgroundColor: p.disponible ? '#059669' : '#ef4444', opacity: updatingProductId === p._id ? 0.6 : 1 }]}
          >
            {p.disponible ? <Check size={14} color="#fff" /> : <X size={14} color="#fff" />}
            <Text style={styles.dispoText}>{p.disponible ? 'Dispo' : 'Indispo'}</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn} onPress={() => deleteProduct(p._id)}>
            <Trash2 size={14} color="#fff" />
          </Pressable>
        </View>
      ))}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          {boutique.logo ? <Image source={{ uri: boutique.logo }} style={styles.logo} /> : null}
        </View>
        <Text style={styles.name}>{boutique.nom}</Text>
        <Text style={styles.description}>{boutique.description}</Text>
        <Text style={styles.location}>{boutique.quartier}, {boutique.ville}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: boutique.isActive ? '#059669' : '#dc3545' }]}>
            <Text style={styles.statusBadgeText}>{boutique.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          <Badge variant="primary">{boutique.categorie}</Badge>
          {boutique.isCertified ? (
            <View style={styles.certifiedBadge}>
              <Text style={styles.certifiedText}>Boutique Certifiée</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 8, marginBottom: 16 }}>
        <Button title="Renouveler mon abonnement" block onPress={() => navigation.navigate('Compte', { screen: 'RenewSubscription' })} />
        <Button title="Commandes" variant="secondary" block onPress={() => navigation.navigate('ProduitsCommandes')} />
        <Button title={`Messages (${unreadMessagesCount})`} variant="secondary" block onPress={() => navigation.navigate('BoutiqueMessages')} />
        <Button title="Modifier Boutique" variant="secondary" block onPress={() => navigation.navigate('CreateBoutique')} />
        <Button title="Organiser les produits" variant="secondary" block onPress={() => navigation.navigate('OrganiserBoutique')} />
        <Button
          title="Visite de la boutique"
          variant="secondary"
          block
          onPress={() => navigation.navigate('BoutiqueVisits', { boutiqueId: boutique._id })}
        />
      </View>

      <FormInput placeholder="Chercher produit..." value={search} onChangeText={setSearch} />
      <Select value={sort} onChange={setSort} options={SORT_OPTIONS} placeholder="Trier" />

      <Button title="+ Ajouter un produit" variant="success" block style={{ marginBottom: 16 }} onPress={() => navigation.navigate('AddBoutiqueProduct', { id: boutique._id })} />

      <Text style={styles.sectionTitle}>Mes produits ({filteredProducts.length})</Text>

      {filteredProducts.length === 0 ? (
        <Text style={styles.emptyText}>{search ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit'}</Text>
      ) : boutique.sections?.length > 0 ? (
        <>
          {[...(boutique.sections)].sort((a, b) => (a.ordre || 0) - (b.ordre || 0)).map(section => {
            const sectionProds = filteredProducts
              .filter(p => p.section === section.nom)
              .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
            if (sectionProds.length === 0) return null;
            return (
              <View key={section.nom} style={{ marginBottom: 16 }}>
                <View style={styles.sectionBar}>
                  <Text style={styles.sectionBarText}>{section.nom}</Text>
                  <Text style={styles.sectionBarCount}>{sectionProds.length} produit(s)</Text>
                </View>
                {renderProductGrid(sectionProds)}
              </View>
            );
          })}
          {(() => {
            const unassigned = filteredProducts.filter(p => !p.section);
            if (unassigned.length === 0) return null;
            return (
              <View style={{ marginBottom: 16 }}>
                <View style={[styles.sectionBar, { backgroundColor: '#6b7280' }]}>
                  <Text style={styles.sectionBarText}>Sans section</Text>
                  <Text style={styles.sectionBarCount}>{unassigned.length} produit(s)</Text>
                </View>
                {renderProductGrid(unassigned)}
              </View>
            );
          })()}
        </>
      ) : (
        <>
          {availableProducts.length > 0 && (
            <>
              <Text style={[styles.subTitle, { color: colors.success }]}>Disponibles ({availableProducts.length})</Text>
              {renderProductGrid(availableProducts)}
            </>
          )}
          {unavailableProducts.length > 0 && (
            <>
              <Text style={[styles.subTitle, { color: colors.danger, marginTop: 16 }]}>Non disponibles ({unavailableProducts.length})</Text>
              {renderProductGrid(unavailableProducts)}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  logoWrap: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 8 },
  logo: { width: '100%', height: '100%' },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 12, color: colors.textLight, marginBottom: 8, textAlign: 'center' },
  location: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  certifiedBadge: { backgroundColor: '#d1fae5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  certifiedText: { color: '#059669', fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  subTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  sectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 10 },
  sectionBarText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  sectionBarCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  emptyText: { textAlign: 'center', color: colors.textLight, paddingVertical: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  gridItem: { width: '47%', position: 'relative' },
  productTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  productCategorie: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  dispoBtn: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
  dispoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', borderRadius: 4, padding: 7 },
});
