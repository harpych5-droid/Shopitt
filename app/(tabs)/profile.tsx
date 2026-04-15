import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, FlatList, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { PROFILE_POSTS } from '@/constants/data';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const GRID_ITEM = (width - 4) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/menu')} hitSlop={8}>
            <Ionicons name="menu" size={26} color="#fff" />
          </Pressable>
          <Text style={styles.username}>@{user?.username || 'the_joystreet_shop'}</Text>
          <Pressable onPress={() => router.push('/seller-dashboard')} hitSlop={8}>
            <Ionicons name="bar-chart-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Cover gradient */}
        <LinearGradient
          colors={['#1A0A2E', '#0E0E0E']}
          style={styles.cover}
        />

        {/* Avatar + stats */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={Gradients.primary} style={styles.avatarRing}>
                <Image
                  source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </LinearGradient>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user?.posts || 6}</Text>
              <Text style={styles.statLabel}>POSTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{formatNum(user?.followers || 15900)}</Text>
              <Text style={styles.statLabel}>FOLLOWERS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user?.following || 610}</Text>
              <Text style={styles.statLabel}>FOLLOWING</Text>
            </View>
          </View>

          {/* Name + bio */}
          <Text style={styles.displayName}>{user?.displayName || 'Joy Street'}</Text>
          <Text style={styles.bio}>
            🔥 Premium Accessories | {user?.location || 'Livingstone'} | 100+ items sold monthly
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{user?.location || 'Livingstone'}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ {user?.sold || 186}+ Sold</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={[styles.badgeText, { color: Colors.gold }]}>★ {user?.rating || 4.6}</Text>
            </View>
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={[styles.badgeText, { color: Colors.verified }]}>⚡ Ships 24h</Text>
            </View>
          </View>

          {/* CTA row */}
          <View style={styles.ctaRow}>
            <Pressable style={{ flex: 1 }}>
              <LinearGradient colors={Gradients.purple} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.shareBtn} hitSlop={4}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </Pressable>
            <Pressable style={styles.shareBtn} hitSlop={4} onPress={() => router.push('/seller-dashboard')}>
              <Ionicons name="storefront-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* TAB BAR */}
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => setActiveTab('posts')}>
            <Ionicons name="grid-outline" size={22} color={activeTab === 'posts' ? Colors.pink : Colors.textMuted} />
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'saved' && styles.tabActive]} onPress={() => setActiveTab('saved')}>
            <Ionicons name="bookmark-outline" size={22} color={activeTab === 'saved' ? Colors.pink : Colors.textMuted} />
          </Pressable>
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {PROFILE_POSTS.map(post => (
            <Pressable key={post.id} style={styles.gridItem}
              onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}>
              <Image source={{ uri: post.image }} style={styles.gridImg} contentFit="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gridOverlay}>
                <Text style={styles.gridPrice}>{post.price}</Text>
                <View style={styles.gridLikes}>
                  <Ionicons name="heart" size={10} color={Colors.pink} />
                  <Text style={styles.gridLikesText}>{(post.likes / 1000).toFixed(1)}K</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  username: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  cover: { height: 120, marginTop: -50 },
  profileInfo: { paddingHorizontal: 16, marginTop: -60, gap: 10 },
  avatarRow: { flexDirection: 'row' },
  avatarWrap: {},
  avatarRing: { width: 90, height: 90, borderRadius: 45, padding: 2.5 },
  avatar: { width: '100%', height: '100%', borderRadius: 44 },
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  statLabel: { color: Colors.textMuted, fontSize: Typography.xs, letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  displayName: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black, marginTop: 4 },
  bio: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: Colors.textMuted, fontSize: Typography.sm },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1.5, borderColor: Colors.pink,
  },
  badgeGold: { borderColor: Colors.gold },
  badgeBlue: { borderColor: Colors.verified },
  badgeText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  editBtn: { borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  shareBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border, marginTop: 16,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.pink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridItem: { width: GRID_ITEM, height: GRID_ITEM, position: 'relative', overflow: 'hidden' },
  gridImg: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 6, paddingVertical: 6,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  gridPrice: { color: '#fff', fontSize: 11, fontWeight: Typography.bold },
  gridLikes: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  gridLikesText: { color: '#fff', fontSize: 9 },
});
