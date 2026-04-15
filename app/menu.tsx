import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const SELLER_ITEMS = [
  { label: 'Seller Dashboard', icon: 'storefront-outline', route: '/seller-dashboard' },
  { label: 'My Wallet', icon: 'wallet-outline', route: '/wallet' },
  { label: 'Create Post', icon: 'add-circle-outline', route: '/(tabs)/create' },
  { label: 'Order Tracking', icon: 'navigate-outline', route: '/order-tracking' },
];

const SUPPORT_ITEMS = [
  { label: 'Help Center', icon: 'help-circle-outline', route: '/help' },
  { label: 'Contact AETHØN Inc.', icon: 'mail-outline', route: '/contact' },
  { label: 'Safety Tips', icon: 'shield-checkmark-outline', route: '/safety' },
];

const LEGAL_ITEMS = [
  { label: 'Terms of Service', icon: 'document-text-outline', route: '/terms' },
  { label: 'Privacy Policy', icon: 'lock-closed-outline', route: '/privacy' },
  { label: 'About Shopitt', icon: 'information-circle-outline', route: '/about' },
  { label: 'Cookie Policy', icon: 'receipt-outline', route: '/cookies' },
];

function MenuSection({ title, items }: { title?: string; items: typeof SELLER_ITEMS }) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionCard}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={[styles.menuItem, i < items.length - 1 && styles.menuItemBorder]}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useApp();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={styles.logoBadge}>
          <Text style={styles.logoText}>Shopitt</Text>
        </LinearGradient>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <MenuSection title="SELLER" items={SELLER_ITEMS} />
        <MenuSection title="SUPPORT" items={SUPPORT_ITEMS} />
        <MenuSection title="LEGAL — AETHØN INC." items={LEGAL_ITEMS} />

        {/* User Avatar */}
        <View style={styles.userSection}>
          <LinearGradient colors={Gradients.primary} style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{(user?.username || 'S').charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.userName}>@{user?.username || 'shopitt_user'}</Text>
        </View>

        <Pressable onPress={() => { logout(); router.replace('/auth'); }} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill },
  logoText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.black },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: {
    color: Colors.textMuted, fontSize: Typography.xs,
    fontWeight: Typography.bold, letterSpacing: 1.2, paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: '#fff', fontSize: Typography.base },
  userSection: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  userAvatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  userName: { color: Colors.textSecondary, fontSize: Typography.base },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: Radius.pill,
    paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)',
  },
  logoutText: { color: Colors.error, fontSize: Typography.base, fontWeight: Typography.semibold },
});
