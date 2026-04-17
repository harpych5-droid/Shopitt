import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { OrderService } from '@/services/orderService';
import { WalletService } from '@/services/walletService';
import { PostService } from '@/services/postService';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { SELLER_ORDERS, REVENUE_DATA } from '@/constants/data';

type StatusFilter = 'all' | 'new' | 'pending' | 'confirmed' | 'shipped' | 'delivered';

const STATUS_COLORS: Record<string, string> = {
  new: Colors.pink,
  pending: Colors.orange,
  confirmed: Colors.verified,
  shipped: Colors.purple,
  delivered: Colors.success,
};

const STATUS_NEXT: Record<string, string> = {
  new: 'Confirm Order',
  pending: 'Mark Confirmed',
  confirmed: 'Mark Shipped',
  shipped: 'Mark Delivered',
  delivered: '',
};

const STATUS_MAP: Record<string, string> = {
  new: 'confirmed',
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

export default function SellerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authUser, currency, user } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState(REVENUE_DATA);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [walletBalance, setWalletBalance] = useState(user?.wallet_balance ?? 0);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const sym = currency.symbol;

  useEffect(() => {
    loadDashboard();
  }, [authUser]);

  const loadDashboard = async () => {
    setLoading(true);
    if (authUser) {
      const [ordersRes, revenueRes, weeklyRes, balanceRes] = await Promise.all([
        OrderService.getSellerOrders(authUser.id),
        OrderService.getSellerRevenue(authUser.id),
        WalletService.getWeeklyRevenue(authUser.id),
        WalletService.getBalance(authUser.id),
      ]);

      if (!ordersRes.error && ordersRes.data.length > 0) {
        setOrders(ordersRes.data.map(o => ({
          ...o,
          buyer: o.buyer?.username ?? 'Buyer',
          buyerAvatar: (o.buyer as any)?.avatar_url,
          product: (o.post as any)?.drop_title ?? 'Product',
          total: o.total,
          location: (o.delivery_address as any)?.city + ', ' + (o.delivery_address as any)?.country || 'Unknown',
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isNew: o.status === 'new',
        })));
      } else {
        setOrders(SELLER_ORDERS.map((o: any) => ({ ...o, total: parseFloat(String(o.total).replace(/[^0-9.]/g, '')) || 0 })));
      }

      if (revenueRes) setTotalRevenue(revenueRes.total);
      if (weeklyRes.some(d => d.value > 0)) setRevenueData(weeklyRes);
      setWalletBalance(balanceRes);
    } else {
      setOrders(SELLER_ORDERS.map((o: any) => ({ ...o, total: parseFloat(String(o.total).replace(/[^0-9.]/g, '')) || 0 })));
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const next = STATUS_MAP[currentStatus] as any;
    if (!next) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
    if (authUser) {
      await OrderService.updateOrderStatus(orderId, next, authUser.id);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingOrders = orders.filter(o => ['new', 'pending', 'confirmed'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalOrders = orders.length;
  const barMax = Math.max(...revenueData.map(d => d.value), 1);
  const STATUS_TABS: StatusFilter[] = ['all', 'new', 'pending', 'confirmed', 'shipped', 'delivered'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <Pressable onPress={() => router.push('/wallet')} hitSlop={8}>
          <Ionicons name="wallet-outline" size={24} color={Colors.pink} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.pink} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.statsRow}>
            <StatCard label="Revenue" value={`${sym}${Math.round(totalRevenue).toLocaleString()}`} icon="trending-up" color={Colors.pink} />
            <StatCard label="Orders" value={String(totalOrders)} icon="bag-outline" color={Colors.purple} />
            <StatCard label="Pending" value={String(pendingOrders)} icon="time-outline" color={Colors.orange} />
            <StatCard label="Done" value={String(completedOrders)} icon="checkmark-circle-outline" color={Colors.success} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue — This Week</Text>
            <View style={styles.chart}>
              {revenueData.map((d, i) => (
                <View key={i} style={styles.bar}>
                  <Text style={styles.barLabel}>{d.label}</Text>
                  <View style={styles.barTrack}>
                    <LinearGradient colors={Gradients.primary} style={[styles.barFill, { height: `${(d.value / barMax) * 100}%` as any }]} />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orders</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {STATUS_TABS.map(s => (
                  <Pressable key={s} onPress={() => setFilter(s)}
                    style={[styles.filterTab, filter === s && styles.filterTabActive]}>
                    <Text style={[styles.filterTabText, filter === s && styles.filterTabTextActive]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {s === 'all' ? ` (${totalOrders})` : ` (${orders.filter(o => o.status === s).length})`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {filtered.length === 0 ? (
              <Text style={{ color: Colors.textMuted, textAlign: 'center', padding: 20 }}>No orders in this status</Text>
            ) : (
              filtered.map(order => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    {order.buyerAvatar ? (
                      <Image source={{ uri: order.buyerAvatar }} style={styles.buyerAvatar} contentFit="cover" />
                    ) : (
                      <LinearGradient colors={Gradients.primary} style={styles.buyerAvatarFallback}>
                        <Text style={{ color: '#fff', fontWeight: Typography.bold }}>
                          {(order.buyer || 'U').charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderId}>{order.id?.slice(0, 12) || order.order_number || 'ORDER'}</Text>
                      <Text style={styles.orderBuyer}>@{order.buyer || 'Buyer'}</Text>
                      <Text style={styles.orderProduct} numberOfLines={1}>{order.product || 'Product'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.orderTotal}>{sym}{typeof order.total === 'number' ? order.total.toLocaleString() : order.total}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[order.status]}22`, borderColor: `${STATUS_COLORS[order.status]}44` }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.orderMeta}>
                    <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.orderMetaText}>{order.location || 'Unknown'}</Text>
                    <Text style={styles.orderMetaText}>· {order.time || ''}</Text>
                    {order.isNew && (
                      <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
                    )}
                  </View>

                  {order.status !== 'delivered' && (
                    <Pressable onPress={() => handleStatusUpdate(order.id, order.status)} style={{ marginTop: 10 }}>
                      <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.orderActionBtn}>
                        <Text style={styles.orderActionText}>{STATUS_NEXT[order.status] || 'Update'}</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}33` }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 12, alignItems: 'center', gap: 6, borderWidth: 1,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.black },
  statLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black, marginBottom: 12 },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, height: 140, borderWidth: 1, borderColor: Colors.border,
  },
  bar: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barLabel: { color: Colors.textMuted, fontSize: 8, textAlign: 'center' },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { color: Colors.textSecondary, fontSize: 9, fontWeight: Typography.semibold },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { borderColor: Colors.pink, backgroundColor: 'rgba(255,77,166,0.1)' },
  filterTabText: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.semibold },
  filterTabTextActive: { color: Colors.pink },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  buyerAvatar: { width: 42, height: 42, borderRadius: 21 },
  buyerAvatarFallback: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  orderId: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1 },
  orderBuyer: { color: Colors.pink, fontSize: Typography.sm, fontWeight: Typography.semibold },
  orderProduct: { color: '#fff', fontSize: Typography.sm, marginTop: 2 },
  orderTotal: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.black },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  orderMetaText: { color: Colors.textMuted, fontSize: Typography.xs },
  newBadge: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 2 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: Typography.black },
  orderActionBtn: { borderRadius: Radius.pill, paddingVertical: 10, alignItems: 'center' },
  orderActionText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
});
