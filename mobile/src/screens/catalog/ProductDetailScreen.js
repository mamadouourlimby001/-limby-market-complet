import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MapPin, CheckCircle } from 'lucide-react-native';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { Badge, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const etatLabels = { neuf: 'Neuf', occasion: 'Occasion', bon_etat: 'Bon état', use: 'Usagé' };

// Portage exact de frontend/src/pages/ProductDetail.jsx
export default function ProductDetailScreen({ route }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!product) return <EmptyState text="Produit introuvable" />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <PhotoSlider photos={product.photos} height={250} />
      <View style={styles.body}>
        <Text style={styles.title}>{product.titre}</Text>
        <Text style={styles.price}>{Number(product.prix || 0).toLocaleString('fr-FR')} GNF</Text>
        <View style={styles.badgeRow}>
          <Badge variant="primary">{product.categorie}</Badge>
          {product.etat ? <Badge variant="success">{etatLabels[product.etat]}</Badge> : null}
          <Badge variant="primary" icon={<MapPin size={14} color={colors.primary} />}>
            {product.ville}, {product.quartier}
          </Badge>
        </View>
        {product.vendeur?.isVerified ? (
          <Badge variant="success" icon={<CheckCircle size={14} color={colors.success} />} style={{ marginBottom: 10 }}>
            Vendeur vérifié
          </Badge>
        ) : null}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>
        <UnlockButton type="product" id={product._id} contact={product.contact} />
        <View style={{ marginTop: 8 }}>
          <ReportButton typeContenu="product" contenuId={product._id} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  description: { fontSize: 13, color: '#4b5563', lineHeight: 20, marginBottom: 14 },
});
