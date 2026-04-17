import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ── External Supabase project credentials ─────────────────────────────────────
// Loaded from EXPO_PUBLIC_ env vars so they are available at build time.
// Never use OnSpace Cloud or any internal backend — all calls go to this project.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://gbdcgpfcshyteeczrgdv.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_0CgSwuQFwBUdmLsn9wFHvA_YEZnXIIp';

// ── Safe localStorage shim (undefined in SSR / Node) ─────────────────────────
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch { /* noop */ }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch { /* noop */ }
  },
};

// ── Cross-platform secure token storage ───────────────────────────────────────
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return Promise.resolve(safeLocalStorage.getItem(key));
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      safeLocalStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value).then(() => {});
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      safeLocalStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key).then(() => {});
  },
};

// ── Supabase client (external project — NOT OnSpace Cloud) ───────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      // Identifies requests as coming from the Shopitt mobile app
      'x-app-name': 'shopitt',
    },
  },
});

export type { User, Session } from '@supabase/supabase-js';
