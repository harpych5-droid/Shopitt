import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AppState } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { DbProfile, DbPost } from '@/lib/types';
import { ProfileService } from '@/services/profileService';
import { PostService } from '@/services/postService';
import { NotificationService } from '@/services/notificationService';
import { getCurrencyForCountry } from '@/services/currencyService';
import { FEED_POSTS } from '@/constants/data'; // fallback while db empty

export interface BagItem {
  id: string;
  postId: string;
  seller: string;
  sellerId: string;
  image: string;
  price: string;
  priceNum: number;
  quantity: number;
  product: string;
  currency: string;
}

interface AppContextType {
  // Auth
  session: Session | null;
  authUser: User | null;
  profile: DbProfile | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (fields: Partial<DbProfile>) => Promise<void>;

  // Currency
  currency: { code: string; symbol: string; name: string };

  // Feed
  posts: DbPost[];
  feedLoading: boolean;
  refreshFeed: (category?: string) => Promise<void>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;

  // Bag
  bagItems: BagItem[];
  bagCount: number;
  addToBag: (item: Omit<BagItem, 'quantity'>) => void;
  removeFromBag: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearBag: () => void;
  bagTotal: number;

  // Notifications
  notifCount: number;
  refreshNotifCount: () => Promise<void>;

  // Legacy helpers (keep for screens that still use mock)
  user: { id: string; username: string; displayName: string; avatar: string; location: string; verified: boolean; followers: number; following: number; posts: number; sold: number; rating: number } | null;
  login: (username: string, location: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [posts, setPosts] = useState<DbPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);

  const appState = useRef(AppState.currentState);

  // ── Currency ───────────────────────────────────────────────
  const currency = getCurrencyForCountry(profile?.country || 'Zambia');

  // ── Auth Init ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user);
      else { setProfile(null); setAuthLoading(false); }
    });

    // Refresh session on app foreground
    const appSub = AppState.addEventListener('change', (state) => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
      appState.current = state;
    });

    return () => { subscription.unsubscribe(); appSub.remove(); };
  }, []);

  const loadProfile = async (user: User) => {
    setAuthLoading(true);
    // Auto-create profile if first login
    const meta = user.user_metadata;
    let p = await ProfileService.get(user.id);
    if (!p) {
      p = await ProfileService.upsert(user.id, {
        id: user.id,
        email: user.email || null,
        username: meta?.preferred_username || meta?.name?.replace(/\s+/g, '_').toLowerCase() || `user_${user.id.slice(0, 6)}`,
        avatar_url: meta?.avatar_url || meta?.picture || null,
        display_name: meta?.full_name || meta?.name || null,
        verified: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        sold_count: 0,
        rating: 4.5,
        is_seller: false,
        wallet_balance: 0,
      });
    }
    setProfile(p);
    setAuthLoading(false);
    if (p) {
      refreshNotifCount(p.id);
    }
  };

  // ── Auth Methods ───────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'shopitt://' },
    });
    return { error: error?.message || null };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, preferred_username: username } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await ProfileService.upsert(data.user.id, {
        id: data.user.id,
        email,
        username,
        verified: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        sold_count: 0,
        rating: 4.5,
        is_seller: false,
        wallet_balance: 0,
      });
    }
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setBagItems([]);
    setNotifCount(0);
  }, []);

  const updateProfile = useCallback(async (fields: Partial<DbProfile>) => {
    if (!authUser) return;
    const updated = await ProfileService.update(authUser.id, fields);
    if (updated) setProfile(updated);
  }, [authUser]);

  // ── Feed ───────────────────────────────────────────────────
  const refreshFeed = useCallback(async (category?: string) => {
    setFeedLoading(true);
    const data = await PostService.getFeed({
      category,
      userCountry: profile?.country || undefined,
    });
    if (data.length > 0) {
      setPosts(data);
    } else {
      // Fallback to mock data while DB is empty
      setPosts(FEED_POSTS as any);
    }
    setFeedLoading(false);
  }, [profile?.country]);

  useEffect(() => { refreshFeed(); }, []);

  const toggleLike = useCallback(async (postId: string) => {
    if (!authUser) return;
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    await PostService.toggleLike(postId, authUser.id);
  }, [authUser]);

  const toggleSave = useCallback(async (postId: string) => {
    if (!authUser) return;
    setSavedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    await PostService.toggleSave(postId, authUser.id);
  }, [authUser]);

  // ── Bag ────────────────────────────────────────────────────
  const addToBag = useCallback((item: Omit<BagItem, 'quantity'>) => {
    setBagItems(prev => {
      const existing = prev.find(b => b.postId === item.postId);
      if (existing) {
        return prev.map(b => b.postId === item.postId ? { ...b, quantity: b.quantity + 1 } : b);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromBag = useCallback((id: string) => {
    setBagItems(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) setBagItems(prev => prev.filter(b => b.id !== id));
    else setBagItems(prev => prev.map(b => b.id === id ? { ...b, quantity: qty } : b));
  }, []);

  const clearBag = useCallback(() => setBagItems([]), []);

  const bagCount = bagItems.reduce((s, b) => s + b.quantity, 0);
  const bagTotal = bagItems.reduce((s, b) => s + b.priceNum * b.quantity, 0);

  // ── Notifications ──────────────────────────────────────────
  const refreshNotifCount = useCallback(async (uid?: string) => {
    const userId = uid || authUser?.id;
    if (!userId) return;
    const count = await NotificationService.getUnreadCount(userId);
    setNotifCount(count);
  }, [authUser?.id]);

  // Poll notifications every 30s
  useEffect(() => {
    if (!authUser) return;
    const interval = setInterval(() => refreshNotifCount(), 30000);
    return () => clearInterval(interval);
  }, [authUser, refreshNotifCount]);

  // ── Legacy shim ────────────────────────────────────────────
  const legacyUser = profile ? {
    id: profile.id,
    username: profile.username || 'user',
    displayName: profile.display_name || profile.username || 'User',
    avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: profile.country || 'Zambia',
    verified: profile.verified,
    followers: profile.followers_count,
    following: profile.following_count,
    posts: profile.posts_count,
    sold: profile.sold_count,
    rating: profile.rating,
  } : null;

  const legacyLogin = useCallback((username: string, location: string) => {
    // Kept for backward compat — real auth uses supabase
  }, []);

  return (
    <AppContext.Provider value={{
      session, authUser, profile,
      isLoggedIn: !!session,
      authLoading,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      logout, updateProfile,
      currency,
      posts, feedLoading, refreshFeed, toggleLike, toggleSave,
      bagItems, bagCount, addToBag, removeFromBag, updateQuantity, clearBag, bagTotal,
      notifCount, refreshNotifCount,
      user: legacyUser,
      login: legacyLogin,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
