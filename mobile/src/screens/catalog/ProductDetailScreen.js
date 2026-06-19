import { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { MapPin, CheckCircle } from 'lucide-react-native';
import api from '../../services/api';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { Badge, Loader, EmptyState } from '../../components/ui';
import { colors } from '../../theme/theme';

const etatLabels = { neuf: 'Neuf', occasion: 'Occasion', bon_etat: 'Bon état', use: 'Usagé' };
const { height } = Dimensions.get('window');

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PhotoSlider photos={product.photos} height={Math.round(height * 0.50)} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{product.titre}</Text>
        <Text style={styles.price}>{Number(product.prix || 0).toLocaleString('fr-FR')} GNF</Text>
        <View style={styles.badgeRow}>
          <Badge variant="primary">{product.categorie}</Badge>
          {product.etat ? <Badge variant="success">{etatLabels[product.etat]}</Badge> : null}
          <Badge variant="primary" icon={<MapPin size={12} color={colors.primary} />}>
            {product.ville}, {product.quartier}
          </Badge>
        </View>
        {product.vendeur?.isVerified ? (
          <Badge variant="success" icon={<CheckCircle size={12} color={colors.success} />} style={{ marginBottom: 6 }}>
            Vendeur vérifié
          </Badge>
        ) : null}
        {product.description ? (
          <Text style={styles.description} numberOfLines={3}>{product.description}</Text>
        ) : null}
        <UnlockButton type="product" id={product._id} contact={product.contact} />
        <View style={{ marginTop: 6 }}>
          <ReportButton typeContenu="product" contenuId={product._id} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: colors.text },
  price: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  description: { fontSize: 12, color: '#4b5563', lineHeight: 18, marginBottom: 8 },
});
