import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { PostService } from '@/services/postService';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { PROFILE_POSTS } from '@/constants/data';
import { DbPost } from '@/lib/types';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authUser, profile, logout, currency } = useApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  useEffect(() => {
    loadPosts();
  }, [authUser]);

  const loadPosts = async () => {
    setLoading(true);
    if (authUser) {
      const data = await PostService.getByUser(authUser.id);
      setPosts(data.length > 0 ? data : PROFILE_POSTS);
    } else {
      setPosts(PROFILE_POSTS);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const sym = currency.symbol;

  const displayProfile = profile || {
    username: 'the_joystreet_shop',
    display_name: 'Joy Street',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    country: 'Zambia',
    bio: 'Fashion drops weekly 🔥 Fast shipping | Authentic only',
    verified: true,
    followers_count: 15900,
    following_count: 610,
    posts_count: posts.length || 6,
    sold_count: 186,
    rating: 4.6,
    is_seller: true,
    wallet_balance: 4850,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.username}>@{displayProfile.username}</Text>
            {displayProfile.verified && (
              <MaterialIcons name="verified" size={16} color={Colors.verified} />
            )}
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/menu')} hitSlop={8}>
              <Ionicons name="menu-outline" size={26} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Avatar + Stats */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {displayProfile.avatar_url ? (
              <Image source={{ uri: displayProfile.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <LinearGradient colors={Gradients.primary} style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {(displayProfile.username || 'U').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            {displayProfile.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={14} color="#fff" />
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            {[
              { label: 'Posts', value: displayProfile.posts_count },
              { label: 'Followers', value: formatCount(displayProfile.followers_count) },
              { label: 'Following', value: formatCount(displayProfile.following_count) },
              { label: 'Sold', value: displayProfile.sold_count },
            ].map(s => (
              <View key={s.label} style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.displayName}>{displayProfile.display_name || displayProfile.username}</Text>
          {displayProfile.bio ? <Text style={styles.bio}>{displayProfile.bio}</Text> : null}
          {displayProfile.country ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.location}>{displayProfile.country}</Text>
            </View>
          ) : null}

          {displayProfile.is_seller && (
            <View style={styles.sellerBadgeRow}>
              <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.sellerBadge}>
                <Ionicons name="storefront-outline" size={13} color="#fff" />
                <Text style={styles.sellerBadgeText}>Verified Seller</Text>
              </LinearGradient>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color={Colors.gold} />
                <Text style={styles.ratingText}>{displayProfile.rating?.toFixed(1)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.editBtn}
            onPress={() => router.push('/menu')}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
          {displayProfile.is_seller && (
            <Pressable onPress={() => router.push('/seller-dashboard')} style={styles.dashBtn}>
              <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.dashBtnGrad}>
                <Ionicons name="storefront-outline" size={15} color="#fff" />
                <Text style={styles.dashBtnText}>Dashboard</Text>
              </LinearGradient>
            </Pressable>
          )}
          <Pressable onPress={() => router.push('/wallet')} style={styles.walletBtn} hitSlop={8}>
            <Ionicons name="wallet-outline" size={20} color={Colors.pink} />
          </Pressable>
        </View>

        {/* Seller wallet preview */}
        {displayProfile.is_seller && (
          <Pressable onPress={() => router.push('/wallet')} style={styles.walletCard}>
            <View style={styles.walletCardLeft}>
              <Ionicons name="wallet" size={18} color={Colors.pink} />
              <View>
                <Text style={styles.walletCardLabel}>Wallet Balance</Text>
                <Text style={styles.walletCardValue}>{sym}{(displayProfile.wallet_balance || 0).toLocaleString()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        )}

        {/* Post grid tabs */}
        <View style={styles.tabRow}>
          <Pressable onPress={() => setActiveTab('posts')} style={[styles.tab, activeTab === 'posts' && styles.tabActive]}>
            <Ionicons name="grid-outline" size={20} color={activeTab === 'posts' ? Colors.pink : Colors.textMuted} />
          </Pressable>
          <Pressable onPress={() => setActiveTab('saved')} style={[styles.tab, activeTab === 'saved' && styles.tabActive]}>
            <Ionicons name="bookmark-outline" size={20} color={activeTab === 'saved' ? Colors.pink : Colors.textMuted} />
          </Pressable>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color={Colors.pink} style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.grid}>
            {posts.map((post: any) => (
              <Pressable
                key={post.id}
                style={styles.gridItem}
                onPress={() => router.push(`/post/${post.id}`)}
              >
                <Image
                  source={{ uri: post.image || post.media_urls?.[0] }}
                  style={styles.gridImg}
                  contentFit="cover"
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gridOverlay}>
                  <Text style={styles.gridPrice}>{post.price || post.price_text || `${sym}${post.price_num}`}</Text>
                  <View style={styles.gridLikes}>
                    <Ionicons name="heart" size={11} color="#fff" />
                    <Text style={styles.gridLikesText}>{formatCount(post.likes || post.likes_count || 0)}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const GRID_SIZE = 3;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  headerActions: { flexDirection: 'row', gap: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 20, marginBottom: 14 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 2.5, borderColor: Colors.pink },
  avatarFallback: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#fff', fontSize: 32, fontWeight: Typography.black },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.verified, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 3 },
  statValue: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.black },
  statLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  bioSection: { paddingHorizontal: 16, gap: 5, marginBottom: 14 },
  displayName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  bio: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 19 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { color: Colors.textMuted, fontSize: Typography.xs },
  sellerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sellerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  sellerBadgeText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  ratingText: { color: Colors.gold, fontSize: Typography.xs, fontWeight: Typography.bold },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  editBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.border, paddingVertical: 10, alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  dashBtn: { flex: 1, borderRadius: Radius.pill, overflow: 'hidden' },
  dashBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dashBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  walletBtn: {
    width: 44, height: 44, backgroundColor: Colors.surface, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.pink,
  },
  walletCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.3)',
  },
  walletCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletCardLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  walletCardValue: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  tabRow: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    marginBottom: 1,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.pink },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33.33%', aspectRatio: 1, position: 'relative' },
  gridImg: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    justifyContent: 'flex-end', padding: 6,
  },
  gridPrice: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.black },
  gridLikes: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gridLikesText: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
});
