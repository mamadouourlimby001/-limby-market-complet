import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Check, MapPin, Wrench } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { colors } from '../theme/theme';

export default memo(function ServiceCard({ service }) {
  const navigation = useNavigation();

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => navigation.navigate('ServiceDetail', { id: service._id })}>
        {service.photo
          ? <Image source={{ uri: service.photo }} style={styles.photo} resizeMode="cover" />
          : <View style={styles.photoPlaceholder}><Wrench size={32} color={colors.textLight} /></View>
        }
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{service.nom}</Text>
            {service.isVerified ? <Check size={14} color={colors.accent} /> : null}
          </View>
          {service.isCertified ? (
            <View style={styles.certified}>
              <Text style={styles.certifiedText}>⭐ Certifié</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} />
            <Text style={styles.meta} numberOfLines={1}>{service.quartier}, {service.ville}</Text>
          </View>
          <Badge variant="primary">{service.metier}</Badge>
        </View>
      </Pressable>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden' },
  photo: { width: '100%', height: 110 },
  photoPlaceholder: { width: '100%', height: 110, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '600', color: colors.text, flexShrink: 1 },
  certified: { alignSelf: 'flex-start', backgroundColor: '#d1fae5', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, marginBottom: 4 },
  certifiedText: { fontSize: 10, fontWeight: '600', color: '#059669' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textLight, flexShrink: 1 },
});
