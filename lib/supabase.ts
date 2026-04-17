import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://gbdcgpfcshyteeczrgdv.supabase.co';
// Anon/publishable key — safe for frontend
const SUPABASE_ANON_KEY = 'sb_publishable_0CgSwuQFwBUdmLsn9wFHvA_YEZnXIIp';

const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => {
        try { return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null); }
        catch { return Promise.resolve(null); }
      },
      setItem: (key: string, value: string) => {
        try { globalThis.localStorage?.setItem(key, value); } catch {}
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        try { globalThis.localStorage?.removeItem(key); } catch {}
        return Promise.resolve();
      },
    }
  : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
