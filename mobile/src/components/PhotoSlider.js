import { useState, useRef } from 'react';
import { View, Image, FlatList, Pressable, Text, Dimensions, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// Portage de frontend/src/components/PhotoSlider.jsx : FlatList horizontal paginée
// (le swipe est natif en RN, pas besoin de gérer touchStart/touchEnd comme sur le web)
// + flèches + dots identiques au composant web.
export default function PhotoSlider({ photos = [], height = 180, onPhotoClick = null }) {
  const [current, setCurrent] = useState(0);
  const listRef = useRef(null);
  const width = Dimensions.get('window').width;

  if (!photos.length) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Pas de photo</Text>
      </View>
    );
  }

  const goTo = (index) => {
    const next = (index + photos.length) % photos.length;
    setCurrent(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const Content = (
    <View style={{ height }}>
      <FlatList
        ref={listRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrent(idx);
        }}
        renderItem={({ item }) => (
          <Pressable
            disabled={!onPhotoClick}
            onPress={() => onPhotoClick && onPhotoClick(current)}
            style={{ width, height }}
          >
            <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
          </Pressable>
        )}
      />

      {photos.length > 1 && (
        <>
          <Pressable style={[styles.arrow, styles.arrowLeft]} onPress={() => goTo(current - 1)}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Pressable style={[styles.arrow, styles.arrowRight]} onPress={() => goTo(current + 1)}>
            <ChevronRight size={22} color="#fff" />
          </Pressable>
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );

  return Content;
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#9ca3af', fontSize: 13 },
  image: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  dots: { position: 'absolute', bottom: 10, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff' },
});
