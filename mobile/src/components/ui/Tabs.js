import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

// Équivalent .tabs / .tab / .tab.active de frontend/src/index.css
export default function Tabs({ tabs, active, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={{ gap: 4 }}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  tabTextActive: { color: '#fff' },
});
