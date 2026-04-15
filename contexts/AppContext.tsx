import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FEED_POSTS } from '@/constants/data';

export interface BagItem {
  id: string;
  postId: string;
  seller: string;
  image: string;
  price: string;
  priceNum: number;
  quantity: number;
  product: string;
}

export interface User {
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
}

interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, location: string) => void;
  logout: () => void;

  // Feed
  posts: typeof FEED_POSTS;
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

  // Notifications badge
  notifCount: number;
  clearNotifs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState(FEED_POSTS);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [notifCount, setNotifCount] = useState(3);

  const login = useCallback((username: string, location: string) => {
    setUser({
      id: 'u1',
      username: username || 'the_joystreet_shop',
      displayName: 'Joy Street',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      location: location || 'Livingstone',
      verified: true,
      followers: 15900,
      following: 610,
      posts: 6,
      sold: 186,
      rating: 4.6,
    });
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setBagItems([]);
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  }, []);

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
    if (qty <= 0) {
      setBagItems(prev => prev.filter(b => b.id !== id));
    } else {
      setBagItems(prev => prev.map(b => b.id === id ? { ...b, quantity: qty } : b));
    }
  }, []);

  const clearBag = useCallback(() => setBagItems([]), []);

  const bagCount = bagItems.reduce((sum, b) => sum + b.quantity, 0);
  const bagTotal = bagItems.reduce((sum, b) => sum + b.priceNum * b.quantity, 0);

  const clearNotifs = useCallback(() => setNotifCount(0), []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, user, login, logout,
      posts, toggleLike, toggleSave,
      bagItems, bagCount, addToBag, removeFromBag, updateQuantity, clearBag, bagTotal,
      notifCount, clearNotifs,
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
