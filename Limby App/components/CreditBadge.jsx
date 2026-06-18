import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function CreditBadge({ credits = 0, size = 'md' }) {
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, isSmall && styles.badgeSm]}>
      <Text style={[styles.icon, isSmall && styles.iconSm]}>⭐</Text>
      <Text style={[styles.text, isSmall && styles.textSm]}>
        {credits} crédit{credits !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 14,
  },
  iconSm: {
    fontSize: 11,
  },
  text: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
