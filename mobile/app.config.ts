import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'mobile',
  slug: 'mobile',
  version: '1.0.0',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/1725de21-62db-4a59-a5a9-4549fd2e55e3',
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.hsd_sakarya.mobile',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  owner: 'hsdsakaryaproje',
  extra: {
    apiUrl: process.env.API_URL ?? 'http://localhost:3000',
    eas: {
      projectId: '1725de21-62db-4a59-a5a9-4549fd2e55e3',
    },
  },
});
