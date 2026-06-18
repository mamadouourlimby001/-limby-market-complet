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

export default function AnnonceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchAnnonce();
  }, [id]);

  const fetchAnnonce = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/announcements/${id}`);
      setAnnonce(res.data);
    } catch {
      Alert.alert('Erreur', 'Offre introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette offre d\'emploi ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/announcements/${id}`);
            Alert.alert('Supprimé');
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
      const res = await api.put(`/announcements/${id}/disponibilite`);
      setAnnonce((prev) => ({ ...prev, disponible: res.data.disponible }));
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

  if (!annonce) return null;

  const isOwner = user && (annonce.auteur?._id === user._id || annonce.auteur === user._id);
  const isExpired = annonce.dateLimite && new Date(annonce.dateLimite) < new Date();

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

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
                {toggling ? '...' : annonce.disponible ? '🔴 Indispo' : '🟢 Dispo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={deleting}>
              <Text style={styles.deleteText}>{deleting ? '...' : '🗑️ Suppr.'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {annonce.photos?.length > 0 && (
          <PhotoSlider photos={annonce.photos} height={240} />
        )}

        <View style={styles.content}>
          {isExpired && (
            <View style={styles.expiredBanner}>
              <Text style={styles.expiredText}>⚠️ Cette offre d'emploi a expiré</Text>
            </View>
          )}

          <View style={styles.companyRow}>
            <View style={styles.companyIcon}>
              <Text style={styles.companyEmoji}>🏢</Text>
            </View>
            <View>
              <Text style={styles.company}>{annonce.entreprise}</Text>
              <Text style={styles.location}>
                📍 {annonce.villeDeTravail} — {annonce.quartier}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{annonce.titre}</Text>

          <View style={styles.infoGrid}>
            <InfoItem icon="💰" label="Salaire mensuel" value={`${annonce.salaireMensuel?.toLocaleString('fr-FR')} GNF`} />
            {annonce.dateLimite && (
              <InfoItem icon="📅" label="Date limite" value={formatDate(annonce.dateLimite)} />
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description du poste</Text>
          <Text style={styles.description}>{annonce.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Postuler / Contacter</Text>
          {isOwner ? (
            <View style={styles.ownerContactBox}>
              <Text style={styles.ownerContactLabel}>Votre contact</Text>
              <Text style={styles.ownerContactValue}>{annonce.contact}</Text>
            </View>
          ) : (
            <UnlockButton
              type="announcement"
              id={id}
              contact={annonce.contactInfo}
              onUnlocked={(c) => setAnnonce((prev) => ({ ...prev, contactInfo: c }))}
            />
          )}

          <View style={{ marginTop: 8 }}>
            <ReportButton typeContenu="announcement" contenuId={id} />
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={infoStyles.item}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
    flex: 1,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '700', color: Colors.text },
});

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
  expiredBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  expiredText: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companyIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyEmoji: { fontSize: 24 },
  company: { fontSize: 16, fontWeight: '700', color: Colors.text },
  location: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 14, lineHeight: 26 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 8 },
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
