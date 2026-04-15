import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions, FlatList, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow, Spacing } from '@/constants/theme';
import { SHORTS_DATA } from '@/constants/data';
import { BuyNowButton } from '@/components/ui/GradientButton';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useApp } from '@/contexts/AppContext';

const { width, height } = Dimensions.get('window');

export default function ShortsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToBag } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  // Tab bar height for scroll item height calculation
  const tabBarH = 60 + insets.bottom;
  const ITEM_HEIGHT = height - tabBarH;

  const handleBuyNow = (short: any) => {
    addToBag({
      id: short.id,
      postId: short.id,
      seller: short.seller,
      image: short.thumbnail,
      price: short.price,
      priceNum: parseInt(short.price.replace(/[^0-9]/g, '')) || 350,
      product: short.caption.split(' ').slice(0, 4).join(' '),
    });
    router.push('/bag');
  };

  const renderShort = ({ item }: any) => (
    <ShortItem
      item={item}
      itemHeight={ITEM_HEIGHT}
      onBuyNow={handleBuyNow}
      insets={insets}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={SHORTS_DATA}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          setActiveIndex(idx);
        }}
        renderItem={renderShort}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
      {/* Tab bar with floating bag */}
      <BottomTabBar />
    </View>
  );
}

function ShortItem({ item, itemHeight, onBuyNow, insets }: any) {
  const likeScale = useRef(new Animated.Value(1)).current;
  const bagScale = useRef(new Animated.Value(1)).current;
  const bagBreathe = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);
  const { bagCount, addToBag } = useApp();
  const router = useRouter();

  // Breathing animation for in-stack bag
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bagBreathe, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(bagBreathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLike = () => {
    setLiked(v => !v);
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true, speed: 80 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const handleBagPress = () => {
    addToBag({
      id: item.id,
      postId: item.id,
      seller: item.seller,
      image: item.thumbnail,
      price: item.price,
      priceNum: parseInt(item.price.replace(/[^0-9]/g, '')) || 350,
      product: item.caption.split(' ').slice(0, 4).join(' '),
    });
    // Pulse
    Animated.sequence([
      Animated.spring(bagScale, { toValue: 1.4, useNativeDriver: true, speed: 80 }),
      Animated.spring(bagScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 16 }),
    ]).start();
    router.push('/bag');
  };

  return (
    <View style={[styles.shortItem, { height: itemHeight }]}>
      {/* Fullscreen background image (video placeholder) */}
      <Image
        source={{ uri: item.thumbnail }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Full overlay gradient from bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
        locations={[0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Play button center */}
      <View style={styles.playCenter}>
        <View style={styles.playBtn}>
          <Ionicons name="play" size={38} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      {/* Stock pill — top-right */}
      {item.stockLeft > 0 && item.stockLeft <= 5 && (
        <View style={[styles.stockPill, { top: insets.top + 16 }]}>
          <Text style={styles.stockText}>Only {item.stockLeft} left</Text>
        </View>
      )}

      {/* RIGHT SIDE ACTIONS — vertically centered, bag integrated at bottom */}
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={8}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? Colors.pink : '#fff'} />
            <Text style={styles.actionCount}>{(item.likes / 1000).toFixed(1)}K</Text>
          </Pressable>
        </Animated.View>
        <Pressable style={styles.actionBtn} hitSlop={8}>
          <Ionicons name="chatbubble-outline" size={27} color="#fff" />
          <Text style={styles.actionCount}>Reply</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} hitSlop={8}>
          <Ionicons name="paper-plane-outline" size={27} color="#fff" />
          <Text style={styles.actionCount}>Share</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} hitSlop={8}>
          <Ionicons name="bookmark-outline" size={27} color="#fff" />
          <Text style={styles.actionCount}>Save</Text>
        </Pressable>

        {/* BAG — integrated into right stack, NO overlap with caption/CTA */}
        <Animated.View style={{ transform: [{ scale: Animated.multiply(bagBreathe, bagScale) }], marginTop: 4 }}>
          <Pressable onPress={handleBagPress} style={styles.actionBtn} hitSlop={8}>
            <LinearGradient colors={Gradients.primary} style={styles.stackBag}>
              <Ionicons name="bag" size={20} color="#fff" />
              {bagCount > 0 && (
                <View style={styles.stackBagBadge}>
                  <Text style={styles.stackBagBadgeText}>{bagCount > 9 ? '9+' : bagCount}</Text>
                </View>
              )}
            </LinearGradient>
            <Text style={styles.actionCount}>Bag</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* BOTTOM LEFT — username + caption */}
      <View style={styles.bottomLeft}>
        {/* Seller row */}
        <View style={styles.sellerRow}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face' }}
            style={styles.sellerAvatar}
            contentFit="cover"
          />
          <Text style={styles.sellerName}>@{item.seller}</Text>
          <Pressable style={styles.followBtn}>
            <Text style={styles.followText}>Follow</Text>
          </Pressable>
        </View>

        {/* Caption */}
        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>

        {/* Price + delivery */}
        <Text style={styles.price}>{item.price}</Text>
        {item.freeDelivery && <Text style={styles.delivery}>🚚 Free Delivery</Text>}

        {/* Sold badge */}
        <View style={styles.soldBadge}>
          <Text style={styles.soldText}>✓ {item.sold} sold</Text>
        </View>
      </View>

      {/* BOTTOM RIGHT — Buy Now CTA */}
      <View style={styles.bottomRight}>
        <BuyNowButton
          label={item.type === 'service' ? 'Book Now' : 'Buy Now'}
          onPress={() => onBuyNow(item)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  shortItem: {
    width,
    position: 'relative',
    overflow: 'hidden',
  },

  playCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  playBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
  },

  // Stock
  stockPill: {
    position: 'absolute',
    right: 16,
    backgroundColor: Colors.orange,
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
    zIndex: 10,
  },
  stockText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },

  // Right actions — vertically centered, moved slightly lower to avoid overlap
  rightActions: {
    position: 'absolute',
    right: 14,
    top: '28%',
    gap: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  stackBag: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackBagBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.notificationBadge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 2,
  },
  stackBagBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { color: '#fff', fontSize: 11, fontWeight: Typography.semibold },

  // Bottom left
  bottomLeft: {
    position: 'absolute',
    bottom: 22,
    left: 14,
    right: 100,
    gap: 5,
    zIndex: 10,
  },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sellerAvatar: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.pink,
  },
  sellerName: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold, flex: 1 },
  followBtn: {
    borderWidth: 1, borderColor: Colors.pink,
    borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 4,
  },
  followText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: Typography.sm, lineHeight: 18 },
  price: { color: '#fff', fontSize: 28, fontWeight: Typography.black, letterSpacing: -0.5 },
  delivery: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs },
  soldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,200,81,0.12)',
    borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.sold,
  },
  soldText: { color: Colors.sold, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Bottom right
  bottomRight: {
    position: 'absolute',
    bottom: 22,
    right: 14,
    zIndex: 10,
  },
});
