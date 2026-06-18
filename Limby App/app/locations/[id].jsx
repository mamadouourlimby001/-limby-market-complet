import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhotoSlider from '../../components/PhotoSlider';
import UnlockButton from '../../components/UnlockButton';
import ReportButton from '../../components/ReportButton';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, [id]);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/locations/${id}`);
      setLocation(res.data);
    } catch {
      Alert.alert('Erreur', 'Annonce introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Êtes-vous sûr de vouloir supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/locations/${id}`);
            Alert.alert('Supprimé', 'Votre annonce a été supprimée');
            router.back();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await api.put(`/locations/${id}/disponibilite`);
      setLocation((prev) => ({ ...prev, disponible: res.data.disponible }));
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

  if (!location) return null;

  const isOwner =
    user &&
    (location.proprietaire?._id === user._id || location.proprietaire === user._id);

  const catLabels = {
    Location: 'Location',
    Colocation: 'Colocation',
    Vente_immobilière: 'Vente immobilière',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity onPress={handleToggle} disabled={toggling}>
              <Text style={styles.toggleText}>
                {toggling ? '...' : location.disponible ? '🔴 Indispo' : '🟢 Dispo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={deleting}>
              <Text style={styles.deleteText}>{deleting ? '...' : '🗑️ Suppr.'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PhotoSlider photos={location.photos || []} height={300} />

        <View style={styles.content}>
          {!location.disponible && (
            <View style={styles.unavailableBanner}>
              <Text style={styles.unavailableText}>Cette annonce est marquée comme indisponible</Text>
            </View>
          )}

          <View style={styles.tagRow}>
            <View style={styles.catTag}>
              <Text style={styles.catTagText}>🏠 {catLabels[location.categorie] || location.categorie}</Text>
            </View>
          </View>

          <Text style={styles.title}>{location.titre}</Text>
          <Text style={styles.price}>
            {location.prix?.toLocaleString('fr-FR')} GNF
            <Text style={styles.priceUnit}> / mois</Text>
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{location.ville} — {location.quartier}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{location.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Contact propriétaire</Text>
          {isOwner ? (
            <View style={styles.ownerContactBox}>
              <Text style={styles.ownerContactLabel}>Votre contact</Text>
              <Text style={styles.ownerContactValue}>{location.contact}</Text>
            </View>
          ) : (
            <UnlockButton
              type="location"
              id={id}
              contact={location.contactInfo}
              onUnlocked={(c) => setLocation((prev) => ({ ...prev, contactInfo: c }))}
            />
          )}

          <View style={{ marginTop: 8 }}>
            <ReportButton typeContenu="location" contenuId={id} />
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
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  ownerActions: { flexDirection: 'row', gap: 16 },
  toggleText: { color: Colors.text, fontSize: 13 },
  deleteText: { color: Colors.danger, fontSize: 13 },
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
  tagRow: { flexDirection: 'row', marginBottom: 10 },
  catTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  catTagText: { color: '#E65100', fontSize: 13, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8, lineHeight: 26 },
  price: { fontSize: 26, fontWeight: 'bold', color: Colors.primary, marginBottom: 14 },
  priceUnit: { fontSize: 14, fontWeight: 'normal', color: Colors.textLight },
  metaRow: { gap: 8, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIcon: { fontSize: 14 },
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
