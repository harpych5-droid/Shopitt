import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { SELLER_ORDERS, REVENUE_DATA } from '@/constants/data';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const BAR_WIDTH = (width - 80) / 7;
const MAX_REV = Math.max(...REVENUE_DATA.map(d => d.value));

type Filter = 'all' | 'pending' | 'confirmed' | 'delivered';

export default function SellerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [orders, setOrders] = useState(SELLER_ORDERS);

  const confirmOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'confirmed' as const, isNew: false } : o));
  };
  const deliverOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'delivered' as const } : o));
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: Colors.orange,
    confirmed: Colors.verified,
    delivered: Colors.success,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <LinearGradient colors={Gradients.primary} style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{(user?.username || 'S').charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Seller Dashboard</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="shield-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revHeader}>
            <Text style={styles.revLabel}>Revenue This Week</Text>
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.revAmount}>
              <Text style={styles.revAmountText}>K 49,100</Text>
            </LinearGradient>
          </View>

          {/* Bar Chart */}
          <View style={styles.chart}>
            {REVENUE_DATA.map((d, i) => (
              <View key={d.day} style={styles.barCol}>
                <View style={styles.barWrap}>
                  <LinearGradient
                    colors={i === 5 ? Gradients.primary : ['#3A2060', '#2A1545']}
                    style={[styles.bar, { height: Math.max(20, (d.value / MAX_REV) * 100) }]}
                  />
                </View>
                <Text style={[styles.barDay, i === 5 && { color: Colors.pink }]}>{d.day}</Text>
                <Text style={[styles.barVal, i === 5 && { color: Colors.pink }]}>{d.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.revFooter}>
            <View style={styles.revFooterLeft}>
              <View style={styles.peakDot} />
              <Text style={styles.peakText}>Peak: Saturday</Text>
            </View>
            <Text style={styles.growthText}>↗ +28% vs last week</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Pending', value: counts.pending, color: Colors.orange },
            { label: 'Confirmed', value: counts.confirmed, color: Colors.verified },
            { label: 'Delivered', value: counts.delivered, color: Colors.success },
            { label: 'Revenue', value: 'K49K', color: Colors.pink },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {([
            ['all', `All (${orders.length})`],
            ['pending', `Pending (${counts.pending})`],
            ['confirmed', `Confirmed (${counts.confirmed})`],
            ['delivered', `Delivered (${counts.delivered})`],
          ] as [Filter, string][]).map(([f, label]) => (
            <Pressable key={f} onPress={() => setFilter(f)}>
              {filter === f ? (
                <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={styles.filterPill}>
                  <Text style={[styles.filterText, { color: '#fff' }]}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterPillInactive}>
                  <Text style={styles.filterText}>{label}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Orders */}
        <View style={styles.orders}>
          {filtered.map(order => (
            <View key={order.id} style={[styles.orderCard, order.isNew && styles.orderCardNew]}>
              {order.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>🔥 NEW ORDER</Text>
                </View>
              )}

              <View style={styles.orderHeader}>
                <Image source={{ uri: order.buyerAvatar }} style={styles.buyerAvatar} contentFit="cover" />
                <View style={styles.orderHeaderInfo}>
                  <Text style={styles.buyerName}>{order.buyer}</Text>
                  <Text style={styles.orderId}>{order.id}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: STATUS_COLORS[order.status] }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                    {order.time}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItem}>
                <Ionicons name="cube-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.orderItemName}>{order.product}</Text>
                <Text style={styles.orderQty}>×{order.qty}</Text>
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.orderTotalLabel}>Order Total</Text>
                  <Text style={styles.orderTotal}>{order.total}</Text>
                </View>
                <Text style={styles.orderLocation}>📍 {order.location}</Text>
              </View>

              {order.status === 'pending' && (
                <Pressable onPress={() => confirmOrder(order.id)}>
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    style={styles.actionBtn}>
                    <MaterialIcons name="check-circle" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Confirm Order</Text>
                  </LinearGradient>
                </Pressable>
              )}

              {order.status === 'confirmed' && (
                <Pressable onPress={() => deliverOrder(order.id)}
                  style={[styles.actionBtn, { backgroundColor: Colors.success, borderRadius: Radius.pill }]}>
                  <Ionicons name="bicycle-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Mark as Delivered</Text>
                </Pressable>
              )}

              {order.status === 'delivered' && (
                <View style={[styles.actionBtn, { backgroundColor: 'rgba(0,200,81,0.1)', borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.success }]}>
                  <MaterialIcons name="check-circle" size={18} color={Colors.success} />
                  <Text style={[styles.actionBtnText, { color: Colors.success }]}>Delivered</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  headerTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  revenueCard: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  revLabel: { color: Colors.textSecondary, fontSize: Typography.base },
  revAmount: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill },
  revAmountText: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginBottom: 8 },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  barWrap: { height: 100, justifyContent: 'flex-end', width: '80%' },
  bar: { width: '100%', borderRadius: 6 },
  barDay: { color: Colors.textMuted, fontSize: 9, fontWeight: Typography.semibold },
  barVal: { color: Colors.textMuted, fontSize: 9 },
  revFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  revFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  peakDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink },
  peakText: { color: Colors.textSecondary, fontSize: Typography.sm },
  growthText: { color: Colors.success, fontSize: Typography.sm, fontWeight: Typography.semibold },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1.5,
  },
  statNum: { fontSize: Typography.xl, fontWeight: Typography.black },
  statLabel: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.medium },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterPill: { borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  filterPillInactive: {
    borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  orders: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  orderCardNew: { borderColor: Colors.pink },
  newBadge: {
    backgroundColor: 'rgba(255,60,0,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.error,
  },
  newBadgeText: { color: Colors.error, fontSize: Typography.xs, fontWeight: Typography.bold },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buyerAvatar: { width: 40, height: 40, borderRadius: 20 },
  orderHeaderInfo: { flex: 1 },
  buyerName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  orderId: { color: Colors.textMuted, fontSize: Typography.xs },
  statusBadge: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: 10 },
  orderItemName: { flex: 1, color: '#fff', fontSize: Typography.sm, fontWeight: Typography.medium },
  orderQty: { color: Colors.textMuted, fontSize: Typography.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  orderTotalLabel: { color: Colors.textSecondary, fontSize: Typography.xs },
  orderTotal: { color: Colors.pink, fontSize: Typography.xxl, fontWeight: Typography.black },
  orderLocation: { color: Colors.textSecondary, fontSize: Typography.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.pill, paddingVertical: 14,
  },
  actionBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
});
