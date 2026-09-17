import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { cityFallback, citySceneSlug, type CitySceneSlug } from '../lib/cityScene';
import { colors, illustration, rounded } from '../theme';

export type CitySceneSlot = 'hero' | 'card' | 'thumb';

const scenes: Record<CitySceneSlug, Record<CitySceneSlot, number>> = {
  seoul: {
    hero: require('../assets/clay/city/seoul-hero.webp'),
    card: require('../assets/clay/city/seoul-card.webp'),
    thumb: require('../assets/clay/city/seoul-thumb.webp'),
  },
  busan: {
    hero: require('../assets/clay/city/busan-hero.webp'),
    card: require('../assets/clay/city/busan-card.webp'),
    thumb: require('../assets/clay/city/busan-thumb.webp'),
  },
  jeju: {
    hero: require('../assets/clay/city/jeju-hero.webp'),
    card: require('../assets/clay/city/jeju-card.webp'),
    thumb: require('../assets/clay/city/jeju-thumb.webp'),
  },
  gangneung: {
    hero: require('../assets/clay/city/gangneung-hero.webp'),
    card: require('../assets/clay/city/gangneung-card.webp'),
    thumb: require('../assets/clay/city/gangneung-thumb.webp'),
  },
  yeosu: {
    hero: require('../assets/clay/city/yeosu-hero.webp'),
    card: require('../assets/clay/city/yeosu-card.webp'),
    thumb: require('../assets/clay/city/yeosu-thumb.webp'),
  },
  gyeongju: {
    hero: require('../assets/clay/city/gyeongju-hero.webp'),
    card: require('../assets/clay/city/gyeongju-card.webp'),
    thumb: require('../assets/clay/city/gyeongju-thumb.webp'),
  },
  jeonju: {
    hero: require('../assets/clay/city/jeonju-hero.webp'),
    card: require('../assets/clay/city/jeonju-card.webp'),
    thumb: require('../assets/clay/city/jeonju-thumb.webp'),
  },
  sokcho: {
    hero: require('../assets/clay/city/sokcho-hero.webp'),
    card: require('../assets/clay/city/sokcho-card.webp'),
    thumb: require('../assets/clay/city/sokcho-thumb.webp'),
  },
  tokyo: {
    hero: require('../assets/clay/city/tokyo-hero.webp'),
    card: require('../assets/clay/city/tokyo-card.webp'),
    thumb: require('../assets/clay/city/tokyo-thumb.webp'),
  },
  osaka: {
    hero: require('../assets/clay/city/osaka-hero.webp'),
    card: require('../assets/clay/city/osaka-card.webp'),
    thumb: require('../assets/clay/city/osaka-thumb.webp'),
  },
  fukuoka: {
    hero: require('../assets/clay/city/fukuoka-hero.webp'),
    card: require('../assets/clay/city/fukuoka-card.webp'),
    thumb: require('../assets/clay/city/fukuoka-thumb.webp'),
  },
  taipei: {
    hero: require('../assets/clay/city/taipei-hero.webp'),
    card: require('../assets/clay/city/taipei-card.webp'),
    thumb: require('../assets/clay/city/taipei-thumb.webp'),
  },
  bangkok: {
    hero: require('../assets/clay/city/bangkok-hero.webp'),
    card: require('../assets/clay/city/bangkok-card.webp'),
    thumb: require('../assets/clay/city/bangkok-thumb.webp'),
  },
  danang: {
    hero: require('../assets/clay/city/danang-hero.webp'),
    card: require('../assets/clay/city/danang-card.webp'),
    thumb: require('../assets/clay/city/danang-thumb.webp'),
  },
  singapore: {
    hero: require('../assets/clay/city/singapore-hero.webp'),
    card: require('../assets/clay/city/singapore-card.webp'),
    thumb: require('../assets/clay/city/singapore-thumb.webp'),
  },
  paris: {
    hero: require('../assets/clay/city/paris-hero.webp'),
    card: require('../assets/clay/city/paris-card.webp'),
    thumb: require('../assets/clay/city/paris-thumb.webp'),
  },
};

export function CityScene({ slot, cityName }: { slot: CitySceneSlot; cityName: string }) {
  const slug = citySceneSlug(cityName);
  const size = illustration.cityScene[slot];
  return (
    <View
      style={[
        s.base,
        slot === 'hero' ? s.hero : { width: size.width, height: size.height },
        slot === 'card' && s.card,
        slot === 'thumb' && s.thumb,
        { backgroundColor: colors[cityFallback(cityName)] },
      ]}
    >
      {slug ? <Image source={scenes[slug][slot]} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  base: { overflow: 'hidden' },
  hero: { width: '100%', height: illustration.cityScene.hero.height },
  card: { borderRadius: rounded.lg },
  thumb: { borderRadius: rounded.md },
});
