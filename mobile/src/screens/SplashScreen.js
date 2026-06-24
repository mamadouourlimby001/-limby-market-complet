import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { colors } from '../theme/theme';

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const cycle = (dot, offset) => {
      Animated.delay(offset).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 340, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.25, duration: 340, useNativeDriver: true }),
            Animated.delay(220),
          ])
        ).start();
      });
    };
    cycle(dot1, 0);
    cycle(dot2, 300);
    cycle(dot3, 600);
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  const logoScale    = useRef(new Animated.Value(0.35)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(22)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganY      = useRef(new Animated.Value(14)).current;
  const dotsOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1 — logo apparaît avec scale + fade
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 580,
          useNativeDriver: true,
        }),
      ]),
      // 2 — titre glisse vers le haut
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 3 — slogan + points de chargement
      Animated.parallel([
        Animated.timing(sloganOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(sloganY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 48, paddingTop: insets.top }]}>
      {/* Centre : logo + textes */}
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          <Logo size={90} color={colors.primary} />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
          Limby Market
        </Animated.Text>

        <Animated.Text style={[styles.slogan, { opacity: sloganOpacity, transform: [{ translateY: sloganY }] }]}>
          La marketplace guinéenne
        </Animated.Text>
      </View>

      {/* Points de chargement en bas */}
      <Animated.View style={{ opacity: dotsOpacity }}>
        <LoadingDots />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '30%',
  },
  center: {
    alignItems: 'center',
    gap: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.4,
    marginTop: 6,
  },
  slogan: {
    fontSize: 15,
    color: '#6b7280',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
