import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PhotoSlider from '../../../components/PhotoSlider';
import UnlockButton from '../../../components/UnlockButton';
import ReportButton from '../../../components/ReportButton';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Colors } from '../../../constants/colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch {
      Alert.alert('Erreur', 'Produit introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Êtes-vous sûr de vouloir supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/products/${id}`);
            Alert.alert('Succès', 'Produit supprimé');
            router.back();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la suppression');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleToggleDisponibilite = async () => {
    setToggling(true);
    try {
      const res = await api.put(`/products/${id}/disponibilite`);
      setProduct((prev) => ({ ...prev, disponible: res.data.disponible }));
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) return null;

  const isOwner = user && (product.vendeur?._id === user._id || product.vendeur === user._id);
  const stateLabels = {
    neuf: 'Neuf',
    bon_etat: 'Bon état',
    occasion: 'Occasion',
    use: 'Usé',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity onPress={handleToggleDisponibilite} disabled={toggling} style={styles.actionBtn}>
              <Ionicons
                name={toggling ? 'ellipsis-horizontal' : (product.disponible ? 'eye-off-outline' : 'eye-outline')}
                size={16}
                color={product.disponible ? Colors.danger : Colors.success}
              />
              <Text style={{ fontSize: 12, color: product.disponible ? Colors.danger : Colors.success }}>
                {toggling ? '...' : (product.disponible ? 'Indispo' : 'Dispo')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={deleting} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              <Text style={{ fontSize: 12, color: Colors.danger }}>{deleting ? '...' : 'Suppr.'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PhotoSlider photos={product.photos || []} height={300} />

        <View style={styles.content}>
          {!product.disponible && (
            <View style={styles.unavailableBanner}>
              <Text style={styles.unavailableText}>Ce produit est marqué comme indisponible</Text>
            </View>
          )}

          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.titre}</Text>
            {product.etat && (
              <View style={styles.stateBadge}>
                <Text style={styles.stateText}>{stateLabels[product.etat] || product.etat}</Text>
              </View>
            )}
          </View>

          <Text style={styles.price}>{product.prix?.toLocaleString('fr-FR')} GNF</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{product.ville} — {product.quartier}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{product.categorie}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Contact vendeur</Text>
          {isOwner ? (
            <View style={styles.ownerContactBox}>
              <Text style={styles.ownerContactLabel}>Votre contact (visible par vous uniquement)</Text>
              <Text style={styles.ownerContactValue}>{product.contact}</Text>
            </View>
          ) : (
            <UnlockButton
              type="product"
              id={id}
              contact={product.contactInfo}
              onUnlocked={(c) => setProduct((prev) => ({ ...prev, contactInfo: c }))}
            />
          )}

          <View style={{ marginTop: 8 }}>
            <ReportButton typeContenu="product" contenuId={id} />
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  ownerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  content: { padding: 16 },
  unavailableBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  unavailableText: { color: '#856404', fontSize: 13, textAlign: 'center' },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.text, lineHeight: 26 },
  stateBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stateText: { fontSize: 12, color: '#E65100', fontWeight: '600' },
  price: { fontSize: 26, fontWeight: 'bold', color: Colors.primary, marginBottom: 14 },
  metaRow: { gap: 8, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: Colors.textLight },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  description: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  ownerContactBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.success,
    gap: 4,
  },
  ownerContactLabel: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  ownerContactValue: { fontSize: 18, fontWeight: 'bold', color: Colors.text, letterSpacing: 1 },
});
