import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';

// Équivalent mobile de <select class="form-control"> : ouvre une feuille modale
// avec la liste des options (les pages web utilisent des <select> natifs).
export default function Select({ label, value, onChange, options, placeholder = 'Sélectionner' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.control} onPress={() => setOpen(true)}>
        <Text style={[styles.controlText, !selected && { color: colors.textLight }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={colors.textLight} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value ? <Check size={16} color={colors.primary} /> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  controlText: { fontSize: 14, color: colors.text },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '70%' },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: { fontSize: 14, color: colors.text },
  optionTextActive: { color: colors.primary, fontWeight: '700' },
});
