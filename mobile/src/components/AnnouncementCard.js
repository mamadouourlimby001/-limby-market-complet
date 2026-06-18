import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin, Building2, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PhotoSlider from './PhotoSlider';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import { colors } from '../theme/theme';

export default function AnnouncementCard({ announcement }) {
  const navigation = useNavigation();
  const goDetail = () => navigation.navigate('AnnouncementDetail', { id: announcement._id });

  return (
    <Card style={styles.card}>
      <Pressable onPress={goDetail}>
        <PhotoSlider photos={announcement.photos} height={130} />
      </Pressable>
      <View style={styles.body}>
        <Pressable onPress={goDetail}>
          <Text style={styles.title} numberOfLines={1}>{announcement.titre}</Text>
        </Pressable>
        <View style={styles.metaRow}>
          <MapPin size={12} color={colors.textLight} />
          <Text style={styles.meta}>{announcement.villeDeTravail}</Text>
        </View>
        <View style={styles.metaRow}>
          <Building2 size={12} color={colors.textLight} />
          <Text style={styles.meta}>{announcement.entreprise}</Text>
        </View>
        <Text style={styles.price}>{Number(announcement.salaireMensuel || 0).toLocaleString('fr-FR')} GNF/mois</Text>
        <View style={styles.metaRow}>
          <Clock size={12} color={colors.warning} />
          <Text style={styles.limite}>Limite: {new Date(announcement.dateLimite).toLocaleDateString('fr-FR')}</Text>
        </View>
        <UnlockButton type="announcement" id={announcement._id} contact={announcement.contact} />
        <ReportButton typeContenu="announcement" contenuId={announcement._id} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  body: { padding: 8 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  meta: { fontSize: 11, color: colors.textLight },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginVertical: 2 },
  limite: { fontSize: 10, color: colors.warning, marginBottom: 6 },
});
