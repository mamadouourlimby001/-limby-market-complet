import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PhotoSlider from './PhotoSlider';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { colors } from '../theme/theme';

const etatLabels = { neuf: 'Neuf', occasion: 'Occasion', bon_etat: 'Bon état', use: 'Usagé' };

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const goDetail = () => navigation.navigate('ProductDetail', { id: product._id });

  return (
    <Card style={styles.card}>
      <Pressable onPress={goDetail}>
        <PhotoSlider photos={product.photos} height={130} />
      </Pressable>
      <View style={styles.body}>
        <Pressable onPress={goDetail}>
          <Text style={styles.title} numberOfLines={1}>{product.titre}</Text>
        </Pressable>
        <View style={styles.row}>
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} />
            <Text style={styles.meta}>{product.ville}</Text>
          </View>
          {product.etat ? <Badge variant="primary">{etatLabels[product.etat]}</Badge> : null}
        </View>
        <Text style={styles.price}>{Number(product.prix || 0).toLocaleString('fr-FR')} GNF</Text>
        <UnlockButton type="product" id={product._id} contact={product.contact} />
        <ReportButton typeContenu="product" contenuId={product._id} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  body: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { fontSize: 11, color: colors.textLight },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 6 },
});
