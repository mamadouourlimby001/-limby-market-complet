import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { radius } from '../../theme/theme';

function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: anim }]}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={styles.line} />
        <View style={[styles.line, { width: '55%' }]} />
        <View style={[styles.line, { width: '40%', marginTop: 4 }]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonList({ count = 6 }) {
  return (
    <View style={grid.wrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={grid.col}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
}

export default SkeletonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e5e7eb',
    borderRadius: radius,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: { height: 130, backgroundColor: '#d1d5db' },
  body: { padding: 8, gap: 6 },
  line: { height: 10, backgroundColor: '#d1d5db', borderRadius: 4, width: '80%' },
});

const grid = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  col: { flex: 1, minWidth: '45%' },
});
