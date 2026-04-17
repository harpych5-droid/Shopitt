import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://gbdcgpfcshyteeczrgdv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0CgSwuQFwBUdmLsn9wFHvA_YEZnXIIp';

// Safe localStorage access (undefined in SSR/Node environment)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try { return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null; } catch { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); } catch { /* noop */ }
  },
  removeItem: (key: string): void => {
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); } catch { /* noop */ }
  },
};

// Secure storage adapter for auth tokens — SSR safe
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return Promise.resolve(safeLocalStorage.getItem(key));
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { safeLocalStorage.setItem(key, value); return Promise.resolve(); }
    return SecureStore.setItemAsync(key, value).then(() => {});
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') { safeLocalStorage.removeItem(key); return Promise.resolve(); }
    return SecureStore.deleteItemAsync(key).then(() => {});
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type { User, Session } from '@supabase/supabase-js';
