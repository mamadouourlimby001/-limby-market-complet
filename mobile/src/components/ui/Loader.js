import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

export default function Loader({ fullScreen = false }) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  fullScreen: { flex: 1, backgroundColor: colors.bg },
});
