import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Check, Phone, MapPin, Store } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { colors } from '../theme/theme';

export default function BoutiqueCard({ boutique }) {
  const navigation = useNavigation();

  return (
    <Card style={styles.card}>
      <Pressable
        style={styles.row}
        onPress={() => navigation.navigate('BoutiqueDetail', { id: boutique._id })}
      >
        <View style={styles.logoWrap}>
          {boutique.logo ? (
            <Image source={{ uri: boutique.logo }} style={styles.logo} />
          ) : (
            <Store size={22} color={colors.textLight} />
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{boutique.nom}</Text>
            {boutique.isVerified ? <Check size={14} color={colors.accent} /> : null}
          </View>
          {boutique.isCertified ? (
            <View style={styles.certified}>
              <Text style={styles.certifiedText}>Boutique Certifiée</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <Phone size={12} color={colors.textLight} />
            <Text style={styles.meta}>{boutique.telephone}</Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} />
            <Text style={styles.meta}>{boutique.quartier}, {boutique.ville}</Text>
          </View>
          <Badge variant="primary">{boutique.categorie}</Badge>
        </View>
      </Pressable>
      <ReportButton typeContenu="boutique" contenuId={boutique._id} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1 },
  certified: {
    backgroundColor: '#0ea5e9',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  certifiedText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  meta: { fontSize: 12, color: colors.textLight },
});
