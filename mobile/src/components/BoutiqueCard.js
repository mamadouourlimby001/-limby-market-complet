import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Check, MapPin, Store } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ReportButton from './ReportButton';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { colors } from '../theme/theme';

export default memo(function BoutiqueCard({ boutique }) {
  const navigation = useNavigation();

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => navigation.navigate('BoutiqueDetail', { id: boutique._id })}>
        {boutique.logo
          ? <Image source={{ uri: boutique.logo }} style={styles.logo} resizeMode="cover" />
          : <View style={styles.logoPlaceholder}><Store size={32} color={colors.textLight} /></View>
        }
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{boutique.nom}</Text>
            {boutique.isVerified ? <Check size={14} color={colors.accent} /> : null}
          </View>
          {boutique.isCertified ? (
            <View style={styles.certified}>
              <Text style={styles.certifiedText}>⭐ Certifiée</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} />
            <Text style={styles.meta} numberOfLines={1}>{boutique.quartier}, {boutique.ville}</Text>
          </View>
          <Badge variant="primary">{boutique.categorie}</Badge>
        </View>
      </Pressable>
      <ReportButton typeContenu="boutique" contenuId={boutique._id} />
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden' },
  logo: { width: '100%', height: 110 },
  logoPlaceholder: { width: '100%', height: 110, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '600', color: colors.text, flexShrink: 1 },
  certified: { alignSelf: 'flex-start', backgroundColor: '#dbeafe', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, marginBottom: 4 },
  certifiedText: { fontSize: 10, fontWeight: '600', color: '#1e40af' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textLight, flexShrink: 1 },
});
