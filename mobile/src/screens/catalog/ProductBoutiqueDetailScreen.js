import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Linking, Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Phone, MapPin, Store } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { Button, Card, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

// Portage exact de frontend/src/pages/ProductBoutiqueDetail.jsx
export default function ProductBoutiqueDetailScreen({ route }) {
  const { boutiqueId, productId } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/boutiques/${boutiqueId}`);
      const { boutique: boutiqueData, products } = res.data;
      setBoutique(boutiqueData);
      const prod = products.find((p) => p._id === productId);
      if (!prod) setError('Produit non trouvé');
      else setProduct(prod);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [boutiqueId, productId]);

  const handleOrder = async () => {
    if (!user) {
      Alert.alert('', 'Veuillez vous connecter');
      navigation.navigate('Compte', { screen: 'Login' });
      return;
    }
    if (user._id === boutique.proprietaire._id || user._id === boutique.proprietaire) {
      Alert.alert('', 'Vous ne pouvez pas commander vos propres produits');
      return;
    }
    setOrderLoading(true);
    try {
      await api.post('/orders', { productId, quantite });
      Alert.alert('', 'Commande créée avec succès !');
      navigation.navigate('Compte', { screen: 'MesCommandes' });
    } catch (err) {
      Alert.alert('', err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (error || !product || !boutique) {
    return (
      <View style={styles.flexPad}>
        <Button title="Retour" variant="secondary" onPress={() => navigation.goBack()} style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
        <Text style={styles.errorText}>{error || 'Produit non trouvé'}</Text>
      </View>
    );
  }

  const isOwner = user && (user._id === boutique.proprietaire._id || user._id === boutique.proprietaire);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12 }}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={18} color={colors.primary} />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      <PhotoSlider photos={product.photos || []} height={300} />

      <View style={{ marginTop: 16, marginBottom: 16 }}>
        <Text style={styles.title}>{product.titre}</Text>
        <Text style={styles.categorie}>{product.categorie}</Text>
        <Text style={styles.price}>{product.prix} GNF</Text>
        <Text style={styles.created}>Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>
      </View>

      <Card style={styles.boutiqueCard}>
        <View style={styles.boutiqueHeader}>
          {boutique.logo ? <Image source={{ uri: boutique.logo }} style={styles.boutiqueLogo} /> : null}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Store size={16} color={colors.text} />
              <Text style={styles.boutiqueName}>{boutique.nom}</Text>
            </View>
            {boutique.isVerified ? <Text style={styles.verified}>✓ Vérifié</Text> : null}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          {boutique.telephone ? (
            <View style={styles.infoRow}>
              <Phone size={14} color={colors.textLight} />
              <Text style={styles.infoText}>{boutique.telephone}</Text>
            </View>
          ) : null}
          {boutique.quartier && boutique.ville ? (
            <View style={styles.infoRow}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={styles.infoText}>{boutique.quartier}, {boutique.ville}</Text>
            </View>
          ) : null}
          {boutique.categorie ? (
            <Text style={styles.infoTextSm}><Text style={{ fontWeight: '700' }}>Catégorie:</Text> {boutique.categorie}</Text>
          ) : null}
        </View>
      </Card>

      <View style={[styles.dispoBox, { backgroundColor: product.disponible ? '#dcfce7' : '#fee2e2', borderColor: product.disponible ? '#22c55e' : '#ef4444' }]}>
        <Text style={[styles.dispoText, { color: product.disponible ? '#22c55e' : '#ef4444' }]}>
          {product.disponible ? '✓ Produit disponible' : '✗ Produit indisponible'}
        </Text>
      </View>

      {!isOwner ? (
        <View style={{ gap: 12 }}>
          {product.disponible && (
            <>
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Quantité:</Text>
                <View style={styles.qtyControl}>
                  <Pressable style={styles.qtyBtn} onPress={() => setQuantite(Math.max(1, quantite - 1))}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{quantite}</Text>
                  <Pressable style={styles.qtyBtn} onPress={() => setQuantite(quantite + 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <Button
                title={orderLoading ? 'Traitement...' : 'Commander maintenant'}
                variant="success"
                block
                loading={orderLoading}
                onPress={handleOrder}
              />
            </>
          )}
          <Pressable
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL(`https://wa.me/${(boutique.telephone || '').replace(/\D/g, '')}`)}
          >
            <WhatsAppIcon size={18} color="#fff" />
            <Text style={styles.whatsappText}>Contacter par WhatsApp</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerText}>C'est votre produit</Text>
          <Button
            title="Modifier"
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('MaBoutique', { screen: 'AddBoutiqueProduct', params: { id: boutiqueId } })}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flexPad: { flex: 1, padding: 12, backgroundColor: colors.bg },
  errorText: { textAlign: 'center', color: colors.danger },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  categorie: { fontSize: 14, color: colors.textLight, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '700', color: colors.success, marginBottom: 12 },
  created: { fontSize: 12, color: '#9ca3af' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 21 },
  boutiqueCard: { padding: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: colors.primary },
  boutiqueHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  boutiqueLogo: { width: 60, height: 60, borderRadius: 8 },
  boutiqueName: { fontSize: 14, fontWeight: '700' },
  verified: { fontSize: 11, color: colors.success, fontWeight: '600', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 12, color: colors.text },
  infoTextSm: { fontSize: 11, color: colors.textLight },
  dispoBox: { padding: 12, borderRadius: 6, borderWidth: 2, marginBottom: 20, alignItems: 'center' },
  dispoText: { fontSize: 14, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyLabel: { fontSize: 14, fontWeight: '600', minWidth: 80 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 4, width: 110 },
  qtyBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '700' },
  qtyValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: '#3b82f6', borderRadius: 6 },
  whatsappText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ownerBox: { alignItems: 'center', padding: 20, backgroundColor: '#f3f4f6', borderRadius: 6 },
  ownerText: { fontSize: 14, color: colors.textLight },
});
