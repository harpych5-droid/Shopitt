import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FEED_POSTS, NOTIFICATIONS_DATA } from '@/constants/data';

// ── Types ─────────────────────────────────────────────────────
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

export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  location: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
  sold: number;
  rating: number;
  isSeller: boolean;
  walletBalance: number;
  bio: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface AppContextType {
  // Auth (mock)
  isLoggedIn: boolean;
  authLoading: boolean;
  user: MockUser | null;
  profile: MockUser | null;
  authUser: { id: string; email: string } | null;
  login: (username: string, location: string) => void;
  logout: () => void;
  updateProfile: (fields: Partial<MockUser>) => void;

  // Currency
  currency: Currency;

  // Feed (mock)
  posts: any[];
  feedLoading: boolean;
  refreshFeed: (category?: string) => void;
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

  // Notifications (mock)
  notifCount: number;
  refreshNotifCount: () => void;
}

// ── Default mock user ─────────────────────────────────────────
const DEFAULT_USER: MockUser = {
  id: 'user_001',
  username: 'the_joystreet_shop',
  displayName: 'Joy Street',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  location: 'Zambia',
  verified: true,
  followers: 15900,
  following: 610,
  posts: 6,
  sold: 186,
  rating: 4.6,
  isSeller: true,
  walletBalance: 4850,
  bio: 'Fashion drops weekly 🔥 Fast shipping | Authentic only',
};

const DEFAULT_CURRENCY: Currency = { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha' };

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // auto-logged in for UI demo
  const [user, setUser] = useState<MockUser | null>(DEFAULT_USER);
  const [posts, setPosts] = useState<any[]>(FEED_POSTS as any);
  const [feedLoading, setFeedLoading] = useState(false);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [notifCount, setNotifCount] = useState(3);

  // ── Auth ──────────────────────────────────────────────────
  const login = useCallback((username: string, location: string) => {
    setUser({ ...DEFAULT_USER, username, location });
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setBagItems([]);
    setNotifCount(0);
  }, []);

  const updateProfile = useCallback((fields: Partial<MockUser>) => {
    setUser(prev => prev ? { ...prev, ...fields } : prev);
  }, []);

  // ── Feed ──────────────────────────────────────────────────
  const refreshFeed = useCallback((category?: string) => {
    setFeedLoading(true);
    setTimeout(() => {
      if (category && category !== 'foryou') {
        setPosts((FEED_POSTS as any).filter((p: any) =>
          p.category?.toLowerCase().includes(category.toLowerCase())
        ) || FEED_POSTS as any);
      } else {
        setPosts(FEED_POSTS as any);
      }
      setFeedLoading(false);
    }, 300);
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: (p.likes || 0) + (p._liked ? -1 : 1), _liked: !p._liked } : p
    ));
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, _saved: !p._saved } : p
    ));
  }, []);

  // ── Bag ───────────────────────────────────────────────────
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

  // ── Notifications ─────────────────────────────────────────
  const refreshNotifCount = useCallback(() => {
    setNotifCount(0);
  }, []);

  // ── Legacy shim for screens using authUser ────────────────
  const authUser = isLoggedIn && user ? { id: user.id, email: `${user.username}@shopitt.com` } : null;

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      authLoading: false,
      user,
      profile: user,
      authUser,
      login,
      logout,
      updateProfile,
      currency: DEFAULT_CURRENCY,
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
