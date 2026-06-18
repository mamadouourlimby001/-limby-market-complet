import { useState } from 'react';
import {
  View, Image, FlatList, TouchableOpacity,
  Dimensions, StyleSheet, Text,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function PhotoSlider({ photos = [], height = 280 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos.length) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderIcon}>📷</Text>
        <Text style={styles.placeholderText}>Aucune photo</Text>
      </View>
    );
  }

  if (photos.length === 1) {
    return (
      <Image
        source={{ uri: photos[0] }}
        style={[styles.singleImage, { height }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.image, { width, height }]}
            resizeMode="cover"
          />
        )}
      />

      <View style={styles.dots}>
        {photos.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {activeIndex + 1}/{photos.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderIcon: {
    fontSize: 40,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  singleImage: {
    width: '100%',
  },
  image: {
    resizeMode: 'cover',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
