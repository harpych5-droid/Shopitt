import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, FlatList, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { CATEGORIES } from '@/constants/data';
import { PostCard } from '@/components/feed/PostCard';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const NAVBAR_HEIGHT = 56;
const CATEGORY_HEIGHT = 52;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { posts, addToBag, feedLoading, refreshFeed, currency } = useApp();
  const [activeCategory, setActiveCategory] = useState('foryou');
  const [refreshing, setRefreshing] = useState(false);

  // Toast
  const [toastText, setToastText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslate = useRef(new Animated.Value(16)).current;

  // Parallax navbar + category bar
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const catTranslateY = useRef(new Animated.Value(0)).current;
  const catOpacity = useRef(new Animated.Value(1)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const delta = y - lastScrollY.current;
    lastScrollY.current = y;

    if (delta > 6 && y > 80 && !isHidden.current) {
      isHidden.current = true;
      Animated.parallel([
        Animated.timing(navTranslateY, { toValue: -(NAVBAR_HEIGHT + CATEGORY_HEIGHT), duration: 220, useNativeDriver: true }),
        Animated.timing(navOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(catTranslateY, { toValue: -CATEGORY_HEIGHT, duration: 220, useNativeDriver: true }),
        Animated.timing(catOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    } else if (delta < -6 && isHidden.current) {
      isHidden.current = false;
      Animated.parallel([
        Animated.timing(navTranslateY, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(navOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(catTranslateY, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(catOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const showBagToast = (text: string) => {
    setToastText(text);
    setShowToast(true);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(toastTranslate, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(toastTranslate, { toValue: 16, duration: 280, useNativeDriver: true }),
      ]).start(() => setShowToast(false));
    }, 2400);
  };

  const handleBuyNow = (post: any) => {
    addToBag({
      id: post.id,
      postId: post.id,
      seller: post.seller || post.user_profiles?.username || 'seller',
      sellerId: post.user_id || post.seller,
      image: post.image || (post.media_urls?.[0]) || '',
      price: post.price || post.price_text || `${currency.symbol}${post.price_num}`,
      priceNum: post.priceNum || post.price_num || parseInt((post.price || '').replace(/[^0-9]/g, '')) || 200,
      product: post.caption || post.drop_title || post.description || 'Product',
      currency: post.currency || currency.code,
    });
    showBagToast('+1 added 👀');
    router.push('/bag');
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    refreshFeed(catId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFeed(activeCategory);
    setRefreshing(false);
  };

  const navbarTop = insets.top;

  return (
    <View style={styles.container}>
      {/* NAVBAR */}
      <Animated.View style={[styles.navbar, { top: navbarTop, height: NAVBAR_HEIGHT, transform: [{ translateY: navTranslateY }], opacity: navOpacity }]}>
        <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.logoBadge}>
          <Text style={styles.logoText}>Shopitt</Text>
        </LinearGradient>
        <View style={styles.navRight}>
          <Pressable onPress={() => router.push('/search')} style={styles.navBtn} hitSlop={8}>
            <Ionicons name="search-outline" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={() => router.push('/chat')} style={styles.navBtn} hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={() => router.push('/menu')} style={styles.navBtn} hitSlop={8}>
            <Ionicons name="menu-outline" size={26} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>

      {/* CATEGORY PILLS */}
      <Animated.View
        style={[styles.categoryWrap, { top: navbarTop + NAVBAR_HEIGHT, transform: [{ translateY: catTranslateY }], opacity: catOpacity }]}
        pointerEvents="box-none"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat.id} onPress={() => handleCategoryChange(cat.id)} style={styles.pillOuter}>
              {activeCategory === cat.id ? (
                <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.pillActive}>
                  <Text style={styles.pillTextActive}>{cat.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.pillDefault}>
                  <Text style={styles.pillTextDefault}>{cat.label}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* FEED */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + NAVBAR_HEIGHT + CATEGORY_HEIGHT, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing || feedLoading} onRefresh={handleRefresh} tintColor={Colors.pink} />}
        renderItem={({ item }) => (
          <PostCard post={item} onBuyNow={handleBuyNow} />
        )}
      />

      {/* TOAST */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, transform: [{ translateY: toastTranslate }], bottom: 90 + insets.bottom }]}>
          <Text style={styles.toastText}>{toastText}</Text>
        </Animated.View>
      )}

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, backgroundColor: Colors.background,
    zIndex: 100, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoBadge: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.pill },
  logoText: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black, letterSpacing: 0.5 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  navBtn: { padding: 4 },
  categoryWrap: {
    position: 'absolute', left: 0, right: 0, zIndex: 90,
    backgroundColor: 'rgba(14,14,14,0.92)', borderBottomWidth: 1, borderBottomColor: Colors.border,
    height: CATEGORY_HEIGHT, justifyContent: 'center',
  },
  categoryContent: { paddingHorizontal: 14, alignItems: 'center', gap: 8 },
  pillOuter: { borderRadius: Radius.pill, overflow: 'hidden' },
  pillActive: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill },
  pillDefault: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  pillTextActive: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  pillTextDefault: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  toast: {
    position: 'absolute', alignSelf: 'center',
    backgroundColor: 'rgba(26,26,26,0.95)', borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.pink, ...Shadow.glow, zIndex: 200,
  },
  toastText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
});
