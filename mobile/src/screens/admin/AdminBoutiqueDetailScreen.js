import { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ShoppingCart, CheckCircle, XCircle, TrendingUp } from 'lucide-react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card, Loader, Button } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function AdminBoutiqueDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [boutique, setBoutique] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [boutiqueRes, statsRes] = await Promise.all([
          api.get(`/boutiques/${id}`),
          api.get(`/admin/boutiques/${id}/stats`),
        ]);
        setBoutique(boutiqueRes.data.boutique);
        setStats(statsRes.data);
      } catch (err) {
        Alert.alert('', 'Erreur lors du chargement');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!boutique || !stats) return null;

  return (
    <Screen>
      <Button title="← Retour aux boutiques" variant="secondary" onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
      <Text style={styles.title}>Bilan - {boutique.nom}</Text>

      <View style={styles.grid}>
        {[
          { Icon: ShoppingCart, label: 'Total Commandes', value: stats.totalOrders, color: '#3b82f6' },
          { Icon: CheckCircle, label: 'Confirmées', value: stats.totalConfirmed, color: colors.success },
          { Icon: XCircle, label: 'Annulées', value: stats.totalCancelled, color: colors.danger },
          { Icon: TrendingUp, label: 'Revenu Total', value: `${(stats.totalRevenue || 0).toLocaleString('fr-GN')} GNF`, color: colors.warning },
        ].map(({ Icon, label, value, color }, i) => (
          <Card key={i} style={styles.statCard}>
            <Icon size={28} color={color} style={{ marginBottom: 8 }} />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </Card>
        ))}
      </View>

      <Card style={{ padding: 12, marginBottom: 16, backgroundColor: '#f9fafb' }}>
        <Text style={styles.resetLabel}>Dernière réinitialisation</Text>
        <Text style={styles.resetValue}>
          {new Date(stats.lastResetDate).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </Card>

      <Button title="Retour aux boutiques" variant="secondary" block onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.textLight, marginBottom: 6, textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1f2937', textAlign: 'center' },
  resetLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  resetValue: { fontSize: 14, fontWeight: '600' },
});
