import { useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent mobile de <input type="date"> (utilisé par AddAnnouncement).
// `value`/`onChange` manipulent une chaîne ISO "YYYY-MM-DD" comme le ferait le champ web.
export default function DateInput({ label, value, onChange, placeholder = 'Sélectionner une date' }) {
  const [show, setShow] = useState(false);
  const dateValue = value ? new Date(value) : new Date();

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    if (selectedDate) {
      onChange(selectedDate.toISOString().slice(0, 10));
    }
    if (Platform.OS === 'android') setShow(false);
  };

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.control} onPress={() => setShow(true)}>
        <Text style={[styles.text, !value && { color: colors.textLight }]}>
          {value ? new Date(value).toLocaleDateString('fr-FR') : placeholder}
        </Text>
        <Calendar size={16} color={colors.textLight} />
      </Pressable>
      {show && (
        <DateTimePicker value={dateValue} mode="date" display="default" onChange={handleChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 5 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: '#fff',
  },
  text: { fontSize: 14, color: colors.text },
});
