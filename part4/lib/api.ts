import Constants from 'expo-constants';

/**
 * Build an absolute URL to an API route on the dev server.
 *
 * A relative fetch('/api/...') has no meaningful origin on a physical device —
 * the phone is not the machine running the server. Expo exposes the dev server
 * as hostUri ("192.168.1.5:8081"), which is what the phone must call. On web
 * the page is already served from that origin, so a relative path is correct.
 */
export function apiUrl(path: string): string {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? `http://${hostUri}${path}` : path;
}
