import { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminResetStatsScreen() {
  const navigation = useNavigation();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Action irréversible',
      'Ceci va réinitialiser:\n- Contacts débloqués\n- Transactions\n- Revenus (GNF)\n\nÊtes-vous absolument sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: async () => {
          setResetting(true);
          try {
            await api.post('/admin/reset-stats');
            Alert.alert('', 'Statistiques réinitialisées avec succès');
            navigation.goBack();
          } catch (err) {
            Alert.alert('', 'Erreur lors de la réinitialisation');
            setResetting(false);
          }
        }},
      ]
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>Réinitialiser les statistiques</Text>

      <View style={styles.warningBox}>
        <View style={styles.warningHeader}>
          <AlertCircle size={28} color="#dc2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Action irréversible</Text>
            <Text style={styles.warningDesc}>
              Cette opération va réinitialiser les statistiques suivantes du tableau de bord:
            </Text>
          </View>
        </View>

        {[
          'Contacts débloqués: Seront remis à 0',
          'Transactions: Seront remises à 0',
          'Revenus (GNF): Seront remis à 0',
        ].map((item, i) => (
          <View key={i} style={styles.resetItem}>
            <Text style={styles.resetItemText}>{item}</Text>
          </View>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Les sections "Utilisateurs" et "Publications actives" ne seront pas affectées
          </Text>
        </View>
      </View>

      <Button
        title={resetting ? 'Réinitialisation en cours...' : 'Réinitialiser les statistiques'}
        variant="danger"
        block
        loading={resetting}
        onPress={handleReset}
        style={{ marginBottom: 8 }}
      />
      <Button
        title="Annuler"
        variant="secondary"
        block
        disabled={resetting}
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 20 },
  warningBox: { backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 },
  warningHeader: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b', marginBottom: 6 },
  warningDesc: { fontSize: 14, color: '#7c2d12', lineHeight: 20 },
  resetItem: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 6, marginBottom: 8 },
  resetItemText: { fontSize: 14, fontWeight: '600', color: '#991b1b' },
  infoBox: { backgroundColor: '#dbeafe', padding: 12, borderRadius: 6, marginTop: 8 },
  infoText: { fontSize: 13, color: '#1e40af', fontStyle: 'italic' },
});
