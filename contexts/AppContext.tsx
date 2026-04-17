import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { DBProfile, DBPost } from '@/lib/types';
import { ProfileService } from '@/services/profileService';
import { PostService } from '@/services/postService';
import { NotificationService } from '@/services/notificationService';
import { getCurrencyForCountry, DEFAULT_CURRENCY, Currency } from '@/services/currencyService';
import { FEED_POSTS, NOTIFICATIONS_DATA } from '@/constants/data';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  isLoggedIn: boolean;
  authLoading: boolean;
  user: DBProfile | null;
  profile: DBProfile | null;
  authUser: { id: string; email: string } | null;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (fields: Partial<DBProfile>) => Promise<void>;
  // Legacy mock support
  login: (username: string, location: string) => void;

  // Currency
  currency: Currency;

  // Feed
  posts: any[];
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
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFallbackPost(p: any, currency: Currency) {
  return {
    ...p,
    // Normalise keys so PostCard works with both mock and DB data
    user_profiles: p.user_profiles ?? {
      username: p.seller,
      avatar_url: p.sellerAvatar,
      verified: p.verified ?? false,
    },
    media_urls: p.media_urls ?? [p.image],
    price_text: p.price_text ?? p.price,
    price_num: p.price_num ?? parseInt((p.price || '0').replace(/[^0-9]/g, '')) || 0,
    likes_count: p.likes_count ?? p.likes ?? 0,
    comments_count: p.comments_count ?? p.comments ?? 0,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [user, setUser] = useState<DBProfile | null>(null);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const notifChannel = useRef<any>(null);

  // ── Bootstrap auth ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        handleAuthUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setAuthLoading(false);
        loadFeed();
      }
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setAuthUser(null);
        setUser(null);
        setNotifCount(0);
        notifChannel.current?.unsubscribe();
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (au: { id: string; email: string }) => {
    setAuthUser(au);

    // Load profile
    const { data: profile } = await ProfileService.getProfile(au.id);

    if (profile) {
      setUser(profile);
      // Set currency based on country
      if (profile.country) {
        setCurrency(getCurrencyForCountry(profile.country));
      }
    } else {
      // Create profile if missing
      const username = au.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_');
      await ProfileService.upsertProfile({
        id: au.id,
        email: au.email,
        username,
        display_name: username,
      });
      const { data: newProfile } = await ProfileService.getProfile(au.id);
      if (newProfile) setUser(newProfile);
    }

    // Load feed & notif count in parallel
    loadFeed();
    refreshNotifCountInternal(au.id);

    // Subscribe to real-time notifications
    notifChannel.current = NotificationService.subscribeToNotifications(au.id, () => {
      refreshNotifCountInternal(au.id);
    });

    setAuthLoading(false);
  };

  // ── Feed ───────────────────────────────────────────────────────────────────

  const loadFeed = useCallback(async (category?: string) => {
    setFeedLoading(true);
    const { data, error } = await PostService.getFeed({ category, limit: 30 });

    if (!error && data.length > 0) {
      setPosts(data.map(p => buildFallbackPost(p, currency)));
    } else {
      // Fallback to mock data when DB is empty or not connected
      const mock = FEED_POSTS as any[];
      const filtered = category && category !== 'foryou'
        ? mock.filter(p => p.category?.toLowerCase().includes(category.toLowerCase()) ||
            (p.hashtags || []).some((h: string) => h.toLowerCase().includes(category.toLowerCase())))
        : mock;
      setPosts(filtered.length > 0 ? filtered : mock);
    }
    setFeedLoading(false);
  }, [currency]);

  const refreshFeed = useCallback(async (category?: string) => {
    await loadFeed(category);
  }, [loadFeed]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!authUser) return;
    const wasLiked = posts.find(p => p.id === postId)?._liked;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: (p.likes_count || p.likes || 0) + (wasLiked ? -1 : 1), _liked: !p._liked }
        : p
    ));

    // Persist
    if (wasLiked) {
      await PostService.unlikePost(authUser.id, postId);
    } else {
      await PostService.likePost(authUser.id, postId);
    }
  }, [authUser, posts]);

  const toggleSave = useCallback(async (postId: string) => {
    if (!authUser) return;
    const wasSaved = posts.find(p => p.id === postId)?._saved;

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, _saved: !p._saved } : p
    ));

    if (wasSaved) {
      await PostService.unsavePost(authUser.id, postId);
    } else {
      await PostService.savePost(authUser.id, postId);
    }
  }, [authUser, posts]);

  // ── Auth actions ───────────────────────────────────────────────────────────

  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'shopitt://auth/callback' },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name: username } },
    });
    if (error) return { error: error.message };
    // Profile is auto-created via DB trigger
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setBagItems([]);
    setUser(null);
    setAuthUser(null);
    setNotifCount(0);
  }, []);

  const updateProfile = useCallback(async (fields: Partial<DBProfile>) => {
    if (!authUser) return;
    setUser(prev => prev ? { ...prev, ...fields } : prev);
    await ProfileService.updateProfile(authUser.id, fields);
    // Update currency if country changed
    if (fields.country) {
      setCurrency(getCurrencyForCountry(fields.country));
    }
  }, [authUser]);

  // Legacy mock login shim
  const login = useCallback((username: string, location: string) => {
    setUser(prev => prev ? { ...prev, username, country: location } : prev);
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────

  const refreshNotifCountInternal = async (userId: string) => {
    const count = await NotificationService.getUnreadCount(userId);
    setNotifCount(count > 0 ? count : 0);
  };

  const refreshNotifCount = useCallback(async () => {
    if (!authUser) { setNotifCount(0); return; }
    await refreshNotifCountInternal(authUser.id);
  }, [authUser]);

  // ── Bag ───────────────────────────────────────────────────────────────────

  const addToBag = useCallback((item: Omit<BagItem, 'quantity'>) => {
    setBagItems(prev => {
      const existing = prev.find(b => b.postId === item.postId);
      if (existing) return prev.map(b => b.postId === item.postId ? { ...b, quantity: b.quantity + 1 } : b);
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

  const isLoggedIn = !!authUser;

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      authLoading,
      user,
      profile: user,
      authUser,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      updateProfile,
      login,
      currency,
      posts,
      feedLoading,
      refreshFeed,
      toggleLike,
      toggleSave,
      bagItems,
      bagCount,
      addToBag,
      removeFromBag,
      updateQuantity,
      clearBag,
      bagTotal,
      notifCount,
      refreshNotifCount,
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
