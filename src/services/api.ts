import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const STORAGE_KEY_CUSTOM_API = '@kumbh_custom_api_url';
export const DEFAULT_LAN_HOST_IP = '10.62.83.186';
export const BACKEND_PORT = '8001';

/**
 * Dynamically resolves the backend API URL across:
 * 1. Physical mobile devices (via Expo Go hostUri or LAN IP fallback)
 * 2. Android emulator (10.0.2.2)
 * 3. iOS Simulator / Web (localhost)
 * 4. EXPO_PUBLIC_API_URL environment variable override
 */
export function resolveDefaultApiBaseUrl(): string {
  // 1. Explicit env variable override
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Automatically detect development machine IP from Expo debugger connection
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:${BACKEND_PORT}`;
    }
  }

  // 3. Android Emulator uses special loopback 10.0.2.2
  if (Platform.OS === 'android' && !Device.isDevice) {
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  // 4. Physical device fallback to current laptop Wi-Fi IP
  if (Device.isDevice) {
    return `http://${DEFAULT_LAN_HOST_IP}:${BACKEND_PORT}`;
  }

  // 5. iOS Simulator / Desktop Web
  return `http://localhost:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveDefaultApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

/**
 * Retrieves the currently active API base URL (custom override or default)
 */
export function getActiveApiUrl(): string {
  return apiClient.defaults.baseURL || API_BASE_URL;
}

/**
 * Automatically normalizes any entered server URL:
 * - Prepends http:// if missing
 * - Appends :8001 if IP entered without port
 * - Strips trailing slashes and whitespace
 */
export function normalizeApiUrl(raw: string | null | undefined): string {
  if (!raw) return '';
  let url = raw.trim();
  url = url.replace(/\/+$/, '');
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  const withoutProtocol = url.replace(/^https?:\/\//, '');
  const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(withoutProtocol);
  if (isIpv4) {
    url = `${url}:${BACKEND_PORT}`;
  }
  return url;
}

/**
 * Loads custom saved API URL from AsyncStorage on app boot
 */
export async function loadSavedApiUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_API);
    if (saved && saved.trim()) {
      const clean = normalizeApiUrl(saved);
      apiClient.defaults.baseURL = clean;
      return clean;
    }
  } catch (_) {}
  return API_BASE_URL;
}

/**
 * Persists a custom API URL (e.g. from ngrok, localtunnel, or cloud IP)
 */
export async function saveCustomApiUrl(url: string | null): Promise<string> {
  try {
    if (url && url.trim()) {
      const clean = normalizeApiUrl(url);
      await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_API, clean);
      apiClient.defaults.baseURL = clean;
      return clean;
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_CUSTOM_API);
      apiClient.defaults.baseURL = API_BASE_URL;
      return API_BASE_URL;
    }
  } catch (_) {
    return API_BASE_URL;
  }
}

// Auto-initialize on module load
loadSavedApiUrl();
