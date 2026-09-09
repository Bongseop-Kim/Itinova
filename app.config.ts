import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    ...config,
    name: config.name ?? 'Itinova',
    slug: config.slug ?? 'Itinova',
    android: { ...config.android, config: { ...config.android?.config, googleMaps: { apiKey } } },
    extra: { ...config.extra, googleMapsConfigured: !!apiKey },
  };
};
