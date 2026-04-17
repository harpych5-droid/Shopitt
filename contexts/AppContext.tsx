import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PostService } from '@/services/postService';
import { getCurrencyForCountry, DEFAULT_CURRENCY, Currency } from '@/services/currencyService';
import { FEED_POSTS } from '@/constants/data';

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
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFallbackPost(p: any) {
  return {
    ...p,
    user_profiles: p.user_profiles ?? {
      username: p.seller,
      avatar_url: p.sellerAvatar,
      verified: p.verified ?? false,
    },
    media_urls: p.media_urls ?? [p.image],
    price_text: p.price_text ?? p.price,
    price_num: p.price_num != null ? p.price_num : (parseInt((p.price || '0').replace(/[^0-9]/g, '')) || 0),
    likes_count: p.likes_count != null ? p.likes_count : (p.likes != null ? p.likes : 0),
    comments_count: p.comments_count != null ? p.comments_count : (p.comments != null ? p.comments : 0),
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency] = useState<Currency>(DEFAULT_CURRENCY);
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const notifCount = 3; // static mock

  useEffect(() => {
    loadFeed();
  }, []);

  // ── Feed ───────────────────────────────────────────────────────────────────

  const loadFeed = useCallback(async (category?: string) => {
    setFeedLoading(true);
    const { data, error } = await PostService.getFeed({ category, limit: 30 });

    if (!error && data.length > 0) {
      setPosts(data.map(p => buildFallbackPost(p)));
    } else {
      const mock = FEED_POSTS as any[];
      const filtered = category && category !== 'foryou'
        ? mock.filter(p =>
            p.category?.toLowerCase().includes(category.toLowerCase()) ||
            (p.hashtags || []).some((h: string) => h.toLowerCase().includes(category.toLowerCase()))
          )
        : mock;
      setPosts(filtered.length > 0 ? filtered : mock);
    }
    setFeedLoading(false);
  }, []);

  const refreshFeed = useCallback(async (category?: string) => {
    await loadFeed(category);
  }, [loadFeed]);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: (p.likes_count || p.likes || 0) + (p._liked ? -1 : 1), _liked: !p._liked }
        : p
    ));
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, _saved: !p._saved } : p
    ));
  }, []);

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

  return (
    <AppContext.Provider value={{
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
