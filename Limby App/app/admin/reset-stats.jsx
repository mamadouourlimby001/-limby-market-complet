import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Colors } from '../../constants/colors';

export default function AdminResetStats() {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    Alert.alert(
      '⚠️ Action irréversible',
      'Ceci va réinitialiser :\n• Contacts débloqués\n• Transactions\n• Revenus (GNF)\n\nÊtes-vous absolument sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', style: 'destructive', onPress: async () => {
            setResetting(true);
            try {
              await api.post('/admin/reset-stats');
              Alert.alert('Succès', 'Statistiques réinitialisées', [
                { text: 'OK', onPress: () => router.push('/admin') }
              ]);
            } catch {
              Alert.alert('Erreur', 'Erreur lors de la réinitialisation');
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Réinitialiser les stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="alert-circle" size={28} color={Colors.danger} />
            <View>
              <Text style={styles.warningTitle}>Action irréversible</Text>
              <Text style={styles.warningDesc}>
                Cette opération va réinitialiser les statistiques suivantes du tableau de bord:
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemText}>❌ Contacts débloqués : remis à 0</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>❌ Transactions : remises à 0</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>❌ Revenus (GNF) : remis à 0</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#1e40af" />
            <Text style={styles.infoText}>
              Les sections "Utilisateurs" et "Publications actives" ne seront pas affectées
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, resetting && styles.resetBtnDisabled]}
          onPress={handleReset}
          disabled={resetting}
        >
          {resetting ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color={Colors.white} />
              <Text style={styles.resetBtnText}>Réinitialiser les statistiques</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={resetting}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  container: { flex: 1 },
  warningCard: {
    backgroundColor: '#fef2f2', borderRadius: 12,
    margin: 12, padding: 16,
    borderLeftWidth: 4, borderLeftColor: Colors.danger,
  },
  warningHeader: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#991b1b', marginBottom: 4 },
  warningDesc: { fontSize: 13, color: '#7c2d12', lineHeight: 18, flex: 1 },
  itemRow: {
    backgroundColor: '#fee2e2', borderRadius: 8,
    padding: 12, marginBottom: 6,
  },
  itemText: { fontSize: 13, fontWeight: '600', color: '#991b1b' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#dbeafe', borderRadius: 8, padding: 10, marginTop: 10,
  },
  infoText: { fontSize: 12, color: '#1e40af', flex: 1, lineHeight: 18 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.danger, borderRadius: 8,
    marginHorizontal: 12, paddingVertical: 14, marginBottom: 10,
  },
  resetBtnDisabled: { opacity: 0.5 },
  resetBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    backgroundColor: '#e5e7eb', borderRadius: 8,
    marginHorizontal: 12, paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
