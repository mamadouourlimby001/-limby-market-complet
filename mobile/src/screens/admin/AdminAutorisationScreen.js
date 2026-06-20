import { useState, useEffect } from 'react';
import { View, Text, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import api from '../../services/api';
import Screen from '../../components/Screen';
import { Card } from '../../components/ui';
import { colors } from '../../theme/theme';

const MENU_PERMISSIONS = [
  { key: 'credits', label: 'Demandes crédits' },
  { key: 'abonnements', label: 'Abonnements' },
  { key: 'signalements', label: 'Signalements' },
  { key: 'utilisateurs', label: 'Utilisateurs' },
  { key: 'boutiques', label: 'Boutiques' },
  { key: 'reset-stats', label: 'Réinitialiser stats' },
  { key: 'send-to-users', label: 'Écrire aux utilisateurs' },
  { key: 'passwords', label: 'Mots de passe' },
  { key: 'visites', label: 'Visites' },
  { key: 'messages', label: 'Messages' },
];

export default function AdminAutorisationScreen() {
  const [admins, setAdmins] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/permissions/admins');
        setAdmins(res.data);
        const map = {};
        res.data.forEach(a => { map[a._id] = a.adminPermissions || []; });
        setPermissions(map);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const toggle = (adminId, key) => {
    setPermissions(prev => {
      const cur = prev[adminId] || [];
      const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
      return { ...prev, [adminId]: next };
    });
  };

  const save = async (adminId) => {
    setSaving(adminId);
    try {
      await api.put(`/admin/permissions/${adminId}`, { permissions: permissions[adminId] || [] });
      Alert.alert('Succès', 'Autorisations enregistrées.');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer les autorisations.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Autorisations des admins</Text>
      {admins.length === 0 ? (
        <Text style={styles.empty}>Aucun administrateur simple trouvé.</Text>
      ) : (
        admins.map(admin => (
          <Card key={admin._id} style={styles.adminCard}>
            <Text style={styles.adminName}>{admin.nom}</Text>
            <Text style={styles.adminPhone}>{admin.telephone}</Text>
            {MENU_PERMISSIONS.map(perm => (
              <View key={perm.key} style={styles.permRow}>
                <Text style={styles.permLabel}>{perm.label}</Text>
                <Switch
                  value={(permissions[admin._id] || []).includes(perm.key)}
                  onValueChange={() => toggle(admin._id, perm.key)}
                  trackColor={{ false: '#e5e7eb', true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
            <Pressable
              style={[styles.saveBtn, saving === admin._id && { opacity: 0.6 }]}
              onPress={() => save(admin._id)}
              disabled={saving === admin._id}
            >
              <Text style={styles.saveTxt}>
                {saving === admin._id ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 16 },
  empty: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 32 },
  adminCard: { padding: 14, marginBottom: 14 },
  adminName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  adminPhone: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  permLabel: { fontSize: 13, color: '#374151' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 14 },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
