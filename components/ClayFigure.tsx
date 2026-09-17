import { Image } from 'expo-image';

import type { Category } from '../lib/category';

const figures = {
  'budget': require('../assets/clay/budget.webp'),
  'cat-attraction': require('../assets/clay/cat-attraction.webp'),
  'cat-cafe': require('../assets/clay/cat-cafe.webp'),
  'cat-etc': require('../assets/clay/cat-etc.webp'),
  'cat-food': require('../assets/clay/cat-food.webp'),
  'cat-stay': require('../assets/clay/cat-stay.webp'),
  'cat-transport': require('../assets/clay/cat-transport.webp'),
  'hero': require('../assets/clay/hero.webp'),
  'method-ai': require('../assets/clay/method-ai.webp'),
  'method-manual': require('../assets/clay/method-manual.webp'),
  'saved': require('../assets/clay/saved.webp'),
  'tool-fx': require('../assets/clay/tool-fx.webp'),
  'tool-time': require('../assets/clay/tool-time.webp'),
  'tool-translate': require('../assets/clay/tool-translate.webp'),
  'tool-weather': require('../assets/clay/tool-weather.webp'),
} as const;

export const categoryFigure = (category: Category | null): `cat-${Category}` => `cat-${category ?? 'etc'}`;

export function ClayFigure({ name, size }: { name: keyof typeof figures; size: number }) {
  return <Image source={figures[name]} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}
