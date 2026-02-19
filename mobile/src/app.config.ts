export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL_STAGING ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://10.0.2.2:3000';
