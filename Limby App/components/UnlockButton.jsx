import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Colors } from '../constants/colors';

export default function UnlockButton({ type, id, contact, onUnlocked }) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState(contact || null);

  const handleUnlock = async () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour débloquer un contact.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (user.credits < 1) {
      Alert.alert(
        'Crédits insuffisants',
        'Vous n\'avez pas assez de crédits. Achetez des crédits pour continuer.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Acheter', onPress: () => router.push('/credits/acheter') },
        ]
      );
      return;
    }

    Alert.alert(
      'Débloquer le contact',
      'Cela coûte 1 crédit. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          onPress: async () => {
            setLoading(true);
            try {
              const endpoint = `/${type}s/${id}/unlock-contact`;
              const response = await api.post(endpoint);
              const contact = response.data?.contact || response.data?.contactInfo;
              setUnlockedContact(contact);
              await refreshUser();
              if (onUnlocked) onUnlocked(contact);
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors du déblocage');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (unlockedContact) {
    return (
      <View style={styles.contactBox}>
        <Text style={styles.contactLabel}>📞 Contact débloqué</Text>
        <Text style={styles.contactValue}>{unlockedContact}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleUnlock}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.buttonText}>Débloquer le contact — 1 crédit</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  contactBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.success,
    gap: 4,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  contactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 1,
  },
});
