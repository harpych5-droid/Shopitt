import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Gradients, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { BuyNowButton } from '@/components/ui/GradientButton';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const POST_IMAGE_HEIGHT = Math.round(height * 0.72);

interface Post {
  id: string;
  seller: string;
  sellerAvatar: string;
  location: string;
  verified: boolean;
  image: string;
  price: string;
  oldPrice: string;
  type: 'product' | 'service';
  stockLeft: number;
  freeDelivery: boolean;
  likes: number;
  sold: number;
  caption: string;
  hashtags: string[];
  comments: number;
  saved: boolean;
  liked: boolean;
}

interface PostCardProps {
  post: Post;
  onBuyNow: (post: Post) => void;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// Drop Title — pure glassmorphism, NO borders
function DropTitle({ title }: { title: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.dropTitle, { opacity, transform: [{ translateY }] }]}>
      {/* Subtle inner gradient glow — no hard border */}
      <LinearGradient
        colors={['rgba(255,77,166,0.20)', 'rgba(123,92,255,0.12)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.dropTitleText}>{title}</Text>
    </Animated.View>
  );
}

// Tap feedback helper
function useTapScale(toVal = 0.94) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: toVal, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
    ]).start();
  };
  return { scale, onPress };
}

export function PostCard({ post, onBuyNow }: PostCardProps) {
  const { toggleLike, toggleSave } = useApp();
  const router = useRouter();

  const likeScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const commentTap = useTapScale();
  const shareTap = useTapScale();
  const followTap = useTapScale(0.92);
  const avatarTap = useTapScale(0.92);
  const usernameTap = useTapScale(0.96);
  const hashtagTap = useTapScale(0.94);

  const [showNotif, setShowNotif] = useState(false);
  const notifOpacity = useRef(new Animated.Value(0)).current;

  // Subtle zoom on image
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, { toValue: 1.04, duration: 7000, useNativeDriver: true }),
        Animated.timing(imageScale, { toValue: 1, duration: 7000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Random social proof notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotif(true);
      Animated.sequence([
        Animated.timing(notifOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(3200),
        Animated.timing(notifOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setShowNotif(false));
    }, 2500 + Math.random() * 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = () => {
    toggleLike(post.id);
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.45, useNativeDriver: true, speed: 80 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const handleSave = () => {
    toggleSave(post.id);
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 1.3, useNativeDriver: true, speed: 80 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const dropTitle = post.caption.split(' ').slice(0, 3).join(' ');

  const goToPost = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });
  const goToProfile = () => router.push('/(tabs)/profile');

  return (
    <View style={styles.card}>
      {/* ===== MEDIA SECTION ===== */}
      <Pressable onPress={goToPost} style={styles.mediaContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: imageScale }] }]}>
          <Image source={{ uri: post.image }} style={styles.media} contentFit="cover" transition={300} />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.88)']}
          locations={[0, 0.45, 1]}
          style={styles.mediaGradient}
        />

        {/* DROP TITLE — glassmorphic, no border */}
        <DropTitle title={dropTitle} />

        {/* Stock pill */}
        {post.stockLeft > 0 && post.stockLeft <= 8 && (
          <View style={styles.stockPill}>
            <Text style={styles.stockText}>Only {post.stockLeft} left</Text>
          </View>
        )}

        {/* Social proof float notif */}
        {showNotif && (
          <Animated.View style={[styles.floatNotif, { opacity: notifOpacity }]}>
            <Text style={styles.floatNotifText}>🔥 Someone just bought this</Text>
          </Animated.View>
        )}

        {/* PRICE + CTA row — anchored to bottom of media */}
        <View style={styles.priceCTARow}>
          <View style={styles.priceArea}>
            <Text style={styles.priceText}>{post.price}</Text>
            {post.freeDelivery && <Text style={styles.deliveryText}>🚚 Free Delivery Available</Text>}
          </View>
          <BuyNowButton
            label={post.type === 'service' ? 'Book Now' : 'Buy Now'}
            onPress={() => onBuyNow(post)}
          />
        </View>
      </Pressable>

      {/* ===== BELOW MEDIA ===== */}
      <View style={styles.below}>

        {/* 1. Engagement row */}
        <View style={styles.engagementRow}>
          <View style={styles.engageLeft}>
            {/* Like */}
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Pressable onPress={handleLike} style={styles.engageBtn} hitSlop={10}>
                <Ionicons
                  name={post.liked ? 'heart' : 'heart-outline'}
                  size={26}
                  color={post.liked ? Colors.pink : Colors.textPrimary}
                />
              </Pressable>
            </Animated.View>
            {/* Comment */}
            <Animated.View style={{ transform: [{ scale: commentTap.scale }] }}>
              <Pressable
                style={styles.engageBtn}
                hitSlop={10}
                onPress={() => { commentTap.onPress(); goToPost(); }}
              >
                <Ionicons name="chatbubble-outline" size={24} color={Colors.textPrimary} />
              </Pressable>
            </Animated.View>
            {/* Share */}
            <Animated.View style={{ transform: [{ scale: shareTap.scale }] }}>
              <Pressable style={styles.engageBtn} hitSlop={10} onPress={shareTap.onPress}>
                <Ionicons name="paper-plane-outline" size={24} color={Colors.textPrimary} />
              </Pressable>
            </Animated.View>
          </View>
          {/* Save */}
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Ionicons
                name={post.saved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={post.saved ? Colors.pink : Colors.textPrimary}
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* 2. Likes + Sold */}
        <View style={styles.socialRow}>
          <Pressable onPress={handleLike}>
            <Text style={styles.likesText}>{formatNum(post.likes)} likes</Text>
          </Pressable>
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>✓ {formatNum(post.sold)} sold</Text>
          </View>
        </View>

        {/* 3. Caption — username clickable */}
        <View style={styles.captionRow}>
          <Text style={styles.captionText} numberOfLines={2}>
            <Animated.View style={{ transform: [{ scale: usernameTap.scale }] }}>
              <Text
                style={styles.sellerBold}
                onPress={() => { usernameTap.onPress(); goToProfile(); }}
              >
                {post.seller}
              </Text>
            </Animated.View>
            {'  '}{post.caption}
          </Text>
        </View>

        {/* 4. Hashtags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hashtagScroll}
          contentContainerStyle={{ gap: 8 }}
        >
          {post.hashtags.map(tag => (
            <Pressable
              key={tag}
              style={styles.hashtagPill}
              onPress={hashtagTap.onPress}
            >
              <Text style={styles.hashtagText}>{tag}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 5. View all comments */}
        <Pressable onPress={goToPost}>
          <Text style={styles.viewComments}>View all {post.comments} comments</Text>
        </Pressable>

        {/* 6. Seller row — avatar + username clickable */}
        <View style={styles.sellerRow}>
          <Animated.View style={{ transform: [{ scale: avatarTap.scale }] }}>
            <Pressable onPress={() => { avatarTap.onPress(); goToProfile(); }}>
              <Image
                source={{ uri: post.sellerAvatar }}
                style={styles.sellerAvatar}
                contentFit="cover"
              />
            </Pressable>
          </Animated.View>
          <Pressable
            style={styles.sellerInfo}
            onPress={goToProfile}
          >
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerNameLarge}>{post.seller}</Text>
              {post.verified && (
                <MaterialIcons name="verified" size={14} color={Colors.verified} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.sellerLocation}>📍 {post.location}</Text>
          </Pressable>
          <Animated.View style={{ transform: [{ scale: followTap.scale }] }}>
            <Pressable
              style={styles.followBtn}
              onPress={followTap.onPress}
              hitSlop={6}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width,
    backgroundColor: Colors.background,
    marginBottom: 12,
  },

  // MEDIA
  mediaContainer: {
    width,
    height: POST_IMAGE_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  media: {
    width,
    height: POST_IMAGE_HEIGHT,
  },
  mediaGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: POST_IMAGE_HEIGHT * 0.5,
  },

  // Drop title — pure glass, NO border
  dropTitle: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(10,8,20,0.52)',
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    overflow: 'hidden',
  },
  dropTitleText: {
    color: '#fff',
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    letterSpacing: 0.2,
  },

  // Stock
  stockPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.orange,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stockText: {
    color: '#fff',
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },

  // Float notif
  floatNotif: {
    position: 'absolute',
    top: 58,
    right: 14,
    left: 14,
    backgroundColor: 'rgba(30,20,40,0.75)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  floatNotifText: {
    color: '#fff',
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },

  // Price + CTA row
  priceCTARow: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceArea: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: Typography.black,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 40,
  },
  deliveryText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Typography.sm,
  },

  // BELOW MEDIA
  below: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  engageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  engageBtn: { padding: 2 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  likesText: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  soldBadge: {
    backgroundColor: 'rgba(0,200,81,0.12)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.sold,
  },
  soldText: {
    color: Colors.sold,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  captionRow: {},
  captionText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    lineHeight: 21,
  },
  sellerBold: {
    color: '#fff',
    fontWeight: Typography.bold,
  },
  hashtagScroll: {},
  hashtagPill: {
    backgroundColor: 'rgba(255,77,166,0.1)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,77,166,0.25)',
  },
  hashtagText: {
    color: Colors.pink,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  viewComments: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  sellerInfo: {
    flex: 1,
    gap: 2,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerNameLarge: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  sellerLocation: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  followBtn: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.pink,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followBtnText: {
    color: Colors.pink,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
