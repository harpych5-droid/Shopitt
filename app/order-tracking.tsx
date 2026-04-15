import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');

const ORDER_STEPS = [
  {
    key: 'placed',
    label: 'Order Placed',
    desc: 'Your order has been received',
    icon: 'receipt-outline',
    time: 'Apr 15, 2026 · 14:32',
    done: true,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Seller confirmed and is preparing',
    icon: 'shield-checkmark-outline',
    time: 'Apr 15, 2026 · 15:10',
    done: true,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    desc: 'Your item is on the way',
    icon: 'cube-outline',
    time: 'Apr 16, 2026 · 09:45',
    done: false,
    isCurrent: true,
  },
  {
    key: 'out',
    label: 'Out for Delivery',
    desc: 'Courier is nearby',
    icon: 'bicycle-outline',
    time: 'Estimated: Apr 17, 2026',
    done: false,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Package received',
    icon: 'home-outline',
    time: 'Estimated: Apr 17–18, 2026',
    done: false,
  },
];

const MOCK_ORDER = {
  id: `SHP-${Date.now().toString().slice(-6)}`,
  product: 'Air Jordan 1 Retro High',
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  seller: 'the_joystreet_shop',
  sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  price: 'K1,800',
  qty: 1,
  address: 'Cairo Road, Flat 3B, Lusaka, Zambia',
  courier: 'Shopitt Express',
  estimatedDelivery: 'Apr 17–18, 2026',
};

function StepIndicator({ step, index, total }: { step: any; index: number; total: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step.isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <View style={ss.step}>
      {/* Left column: dot + line */}
      <View style={ss.stepLeft}>
        <View style={ss.dotWrap}>
          {step.isCurrent && (
            <Animated.View style={[ss.pulseDot, { transform: [{ scale: pulse }] }]} />
          )}
          <LinearGradient
            colors={step.done || step.isCurrent ? Gradients.primary : [Colors.surface, Colors.surface]}
            style={[ss.dot, step.isCurrent && ss.dotCurrent]}
          >
            <Ionicons
              name={step.icon as any}
              size={15}
              color={step.done || step.isCurrent ? '#fff' : Colors.textMuted}
            />
          </LinearGradient>
        </View>
        {index < total - 1 && (
          <View style={[ss.line, (step.done) && ss.lineDone]} />
        )}
      </View>

      {/* Right: content */}
      <View style={ss.stepRight}>
        <View style={ss.stepHeader}>
          <Text style={[ss.stepLabel, (step.done || step.isCurrent) && ss.stepLabelDone]}>
            {step.label}
          </Text>
          {step.isCurrent && (
            <View style={ss.currentBadge}>
              <Text style={ss.currentBadgeText}>In Progress</Text>
            </View>
          )}
          {step.done && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          )}
        </View>
        <Text style={ss.stepDesc}>{step.desc}</Text>
        <Text style={ss.stepTime}>{step.time}</Text>
      </View>
    </View>
  );
}

export default function OrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const doneCount = ORDER_STEPS.filter(s => s.done).length;
  const currentIdx = ORDER_STEPS.findIndex(s => s.isCurrent);
  const progressPct = ((currentIdx >= 0 ? currentIdx : doneCount) / (ORDER_STEPS.length - 1));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Track Order</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/chat')}>
          <Ionicons name="chatbubble-outline" size={22} color={Colors.pink} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Order card */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardTop}>
            <Image source={{ uri: MOCK_ORDER.image }} style={styles.productThumb} contentFit="cover" />
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{MOCK_ORDER.id}</Text>
              <Text style={styles.orderProduct} numberOfLines={2}>{MOCK_ORDER.product}</Text>
              <Text style={styles.orderSeller}>@{MOCK_ORDER.seller}</Text>
              <Text style={styles.orderPrice}>{MOCK_ORDER.price}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                <LinearGradient
                  colors={Gradients.primary}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressLabel}>
              Step {Math.min(currentIdx >= 0 ? currentIdx + 1 : doneCount + 1, ORDER_STEPS.length)} of {ORDER_STEPS.length}
            </Text>
          </View>
        </View>

        {/* Delivery info */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <View style={[styles.deliveryIconWrap, { backgroundColor: 'rgba(255,77,166,0.15)' }]}>
              <Ionicons name="time-outline" size={18} color={Colors.pink} />
            </View>
            <View>
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliveryValue}>{MOCK_ORDER.estimatedDelivery}</Text>
            </View>
          </View>
          <View style={styles.deliveryDivider} />
          <View style={styles.deliveryRow}>
            <View style={[styles.deliveryIconWrap, { backgroundColor: 'rgba(0,200,81,0.15)' }]}>
              <Ionicons name="car-outline" size={18} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.deliveryLabel}>Courier</Text>
              <Text style={styles.deliveryValue}>{MOCK_ORDER.courier}</Text>
            </View>
          </View>
          <View style={styles.deliveryDivider} />
          <View style={styles.deliveryRow}>
            <View style={[styles.deliveryIconWrap, { backgroundColor: 'rgba(123,92,255,0.15)' }]}>
              <Ionicons name="location-outline" size={18} color={Colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <Text style={styles.deliveryValue} numberOfLines={2}>{MOCK_ORDER.address}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Order Timeline</Text>
          <View style={styles.timelineCard}>
            {ORDER_STEPS.map((step, i) => (
              <StepIndicator key={step.key} step={step} index={i} total={ORDER_STEPS.length} />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/chat')}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.pink} />
            <Text style={styles.actionBtnText}>Message Seller</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="help-circle-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionBtnText}>Get Help</Text>
          </Pressable>
        </View>

        {/* Seller info */}
        <Pressable style={styles.sellerCard} onPress={() => router.push('/(tabs)/profile')}>
          <Image source={{ uri: MOCK_ORDER.sellerAvatar }} style={styles.sellerAvatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerName}>@{MOCK_ORDER.seller}</Text>
            <Text style={styles.sellerSub}>Tap to view seller profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const ss = StyleSheet.create({
  step: { flexDirection: 'row', gap: 12 },
  stepLeft: { alignItems: 'center', width: 36 },
  dotWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  pulseDot: {
    position: 'absolute',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,77,166,0.2)',
    zIndex: 0,
  },
  dot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  dotCurrent: { ...Shadow.glow },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 4, minHeight: 24 },
  lineDone: { backgroundColor: Colors.pink },
  stepRight: { flex: 1, paddingBottom: 24, paddingTop: 4 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  stepLabel: { color: Colors.textMuted, fontSize: Typography.base, fontWeight: Typography.medium },
  stepLabelDone: { color: '#fff', fontWeight: Typography.bold },
  stepDesc: { color: Colors.textMuted, fontSize: Typography.xs, lineHeight: 17 },
  stepTime: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 4 },
  currentBadge: {
    backgroundColor: 'rgba(255,77,166,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.3)',
  },
  currentBadgeText: { color: Colors.pink, fontSize: 10, fontWeight: Typography.bold },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  scroll: { padding: 16, gap: 14 },

  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, gap: 14, borderWidth: 1, borderColor: Colors.border,
  },
  orderCardTop: { flexDirection: 'row', gap: 12 },
  productThumb: { width: 80, height: 80, borderRadius: Radius.lg },
  orderInfo: { flex: 1, gap: 3 },
  orderId: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1 },
  orderProduct: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold, lineHeight: 20 },
  orderSeller: { color: Colors.textSecondary, fontSize: Typography.xs },
  orderPrice: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.black },

  progressWrap: { gap: 6 },
  progressTrack: {
    height: 6, backgroundColor: Colors.surfaceElevated,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressLabel: { color: Colors.textMuted, fontSize: Typography.xs, textAlign: 'right' },

  deliveryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  deliveryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  deliveryIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deliveryLabel: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.medium, marginBottom: 2 },
  deliveryValue: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold, lineHeight: 19 },
  deliveryDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: 10 },

  timelineSection: { gap: 10 },
  timelineTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  timelineCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    paddingVertical: 13, borderWidth: 1.5, borderColor: Colors.border,
  },
  actionBtnText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.semibold },

  sellerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Colors.pink },
  sellerName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  sellerSub: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
});
