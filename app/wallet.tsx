import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, Dimensions, Modal, TextInput, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');

// ─── Mock Data ───────────────────────────────────────────────
const WALLET_DATA = {
  pendingBalance: 12400,
  availableBalance: 36700,
  totalEarnings: 49100,
  totalWithdrawn: 28500,
  currency: 'K',
};

const BREAKDOWN = [
  { label: 'Streetwear', value: 41, color: '#FF4DA6' },
  { label: 'Sneakers', value: 28, color: '#7B5CFF' },
  { label: 'Accessories', value: 18, color: '#FF8C00' },
  { label: 'Other', value: 13, color: '#00C851' },
];

const WITHDRAWAL_HISTORY = [
  { id: 'w1', method: 'Airtel Money', amount: 8500, date: 'Apr 13, 2026', status: 'completed', number: '**** 4821' },
  { id: 'w2', method: 'MTN Money', amount: 12000, date: 'Apr 08, 2026', status: 'completed', number: '**** 3301' },
  { id: 'w3', method: 'Zamtel Kwacha', amount: 5000, date: 'Apr 01, 2026', status: 'completed', number: '**** 7754' },
  { id: 'w4', method: 'Airtel Money', amount: 3000, date: 'Mar 25, 2026', status: 'pending', number: '**** 4821' },
];

const WEEKLY_REVENUE = [
  { day: 'M', value: 3200 },
  { day: 'T', value: 5800 },
  { day: 'W', value: 4100 },
  { day: 'T', value: 7200 },
  { day: 'F', value: 9600 },
  { day: 'S', value: 12400 },
  { day: 'S', value: 6800 },
];

const MOBILE_MONEY_PROVIDERS = [
  { id: 'airtel', label: 'Airtel Money', icon: 'cellphone', color: '#E40000' },
  { id: 'mtn', label: 'MTN Money', icon: 'cellphone', color: '#FFCC00' },
  { id: 'zamtel', label: 'Zamtel Kwacha', icon: 'cellphone', color: '#009900' },
];

// ─── Animated Counter ────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', duration = 1200, style }: {
  value: number; prefix?: string; duration?: number; style?: any;
}) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animVal.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });
    return () => animVal.removeListener(listener);
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{display.toLocaleString()}
    </Text>
  );
}

// ─── Revenue Bar Chart ───────────────────────────────────────
function RevenueChart() {
  const maxVal = Math.max(...WEEKLY_REVENUE.map(d => d.value));
  const barAnims = useRef(WEEKLY_REVENUE.map(() => new Animated.Value(0))).current;
  const today = 5; // Saturday index

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: WEEKLY_REVENUE[i].value / maxVal,
        duration: 700 + i * 80,
        delay: 300 + i * 60,
        useNativeDriver: false,
      })
    );
    Animated.stagger(60, animations).start();
  }, []);

  const chartHeight = 100;

  return (
    <View style={chart.container}>
      <View style={chart.barsRow}>
        {WEEKLY_REVENUE.map((d, i) => {
          const isToday = i === today;
          const barHeight = barAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [4, chartHeight],
          });
          return (
            <View key={i} style={chart.barWrap}>
              <View style={[chart.barOuter, { height: chartHeight }]}>
                <Animated.View style={[chart.barInner, { height: barHeight }]}>
                  {isToday ? (
                    <LinearGradient
                      colors={Gradients.primary}
                      start={{ x: 0.5, y: 1 }}
                      end={{ x: 0.5, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#3A1A30' }]} />
                  )}
                </Animated.View>
              </View>
              <Text style={[chart.dayLabel, isToday && chart.dayLabelActive]}>{d.day}</Text>
              {isToday && (
                <Text style={chart.peakLabel}>{(d.value / 1000).toFixed(1)}K</Text>
              )}
            </View>
          );
        })}
      </View>
      <View style={chart.footer}>
        <View style={chart.dot} />
        <Text style={chart.peakText}>Peak: Saturday</Text>
        <Text style={chart.growthText}>↗ +28% vs last week</Text>
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  container: { gap: 8 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
  },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barOuter: { width: '100%', justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden' },
  barInner: { width: '100%', borderRadius: 6, overflow: 'hidden' },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.semibold,
  },
  dayLabelActive: { color: Colors.pink },
  peakLabel: {
    position: 'absolute',
    top: -18,
    color: Colors.pink,
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink },
  peakText: { color: Colors.textSecondary, fontSize: Typography.xs, flex: 1 },
  growthText: { color: Colors.sold, fontSize: Typography.xs, fontWeight: Typography.semibold },
});

// ─── Donut-style Breakdown ───────────────────────────────────
function BreakdownBar() {
  const anims = useRef(BREAKDOWN.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(120, BREAKDOWN.map((d, i) =>
      Animated.timing(anims[i], {
        toValue: d.value / 100,
        duration: 800,
        delay: 500 + i * 100,
        useNativeDriver: false,
      })
    )).start();
  }, []);

  const barW = width - 32 - 40; // padding

  return (
    <View style={bd.container}>
      <Text style={bd.title}>Revenue Breakdown</Text>
      {BREAKDOWN.map((d, i) => {
        const barWidth = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, barW * (d.value / 100)],
        });
        return (
          <View key={d.label} style={bd.row}>
            <View style={[bd.dot, { backgroundColor: d.color }]} />
            <Text style={bd.label}>{d.label}</Text>
            <View style={bd.trackOuter}>
              <Animated.View style={[bd.trackInner, { width: barWidth, backgroundColor: d.color }]} />
            </View>
            <Text style={[bd.pct, { color: d.color }]}>{d.value}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const bd = StyleSheet.create({
  container: { gap: 12 },
  title: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: Colors.textSecondary, fontSize: Typography.sm, width: 90 },
  trackOuter: {
    flex: 1, height: 6, backgroundColor: Colors.surfaceElevated,
    borderRadius: 3, overflow: 'hidden',
  },
  trackInner: { height: 6, borderRadius: 3 },
  pct: { fontSize: Typography.xs, fontWeight: Typography.bold, width: 30, textAlign: 'right' },
});

// ─── Withdraw Modal ──────────────────────────────────────────
function WithdrawModal({ visible, onClose, maxAmount }: {
  visible: boolean; onClose: () => void; maxAmount: number;
}) {
  const [step, setStep] = useState<'amount' | 'provider' | 'number' | 'confirm' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('amount');
      setAmount('');
      setProvider(null);
      setPhone('');
      Animated.parallel([
        Animated.timing(slideY, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (step === 'success') {
      Animated.sequence([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        successScale.setValue(0);
        successOpacity.setValue(0);
        onClose();
      }, 2800);
    }
  }, [step]);

  const amtNum = parseInt(amount) || 0;
  const canProceedAmount = amtNum >= 50 && amtNum <= maxAmount;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modal.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modal.kvWrap}
        pointerEvents="box-none"
      >
        <Animated.View style={[modal.sheet, { transform: [{ translateY: slideY }], opacity: fadeIn }]}>
          {/* Handle */}
          <View style={modal.handle} />

          {step === 'amount' && (
            <View style={modal.content}>
              <Text style={modal.title}>Withdraw Funds</Text>
              <Text style={modal.sub}>Available: K{maxAmount.toLocaleString()}</Text>
              <View style={modal.amountInputWrap}>
                <Text style={modal.currencySymbol}>K</Text>
                <TextInput
                  style={modal.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  maxLength={7}
                  autoFocus
                />
              </View>
              <View style={modal.quickAmounts}>
                {[500, 1000, 5000, 10000].map(q => (
                  <Pressable key={q} onPress={() => setAmount(String(q))} style={modal.quickBtn}>
                    <Text style={modal.quickBtnText}>K{q.toLocaleString()}</Text>
                  </Pressable>
                ))}
              </View>
              {amtNum > maxAmount && (
                <Text style={modal.errorText}>Exceeds available balance</Text>
              )}
              <Pressable
                onPress={() => canProceedAmount && setStep('provider')}
                disabled={!canProceedAmount}
                style={{ width: '100%', marginTop: 16 }}
              >
                <LinearGradient
                  colors={canProceedAmount ? Gradients.primary : ['#333', '#444']}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={modal.continueBtn}
                >
                  <Text style={modal.continueBtnText}>Continue →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {step === 'provider' && (
            <View style={modal.content}>
              <Pressable onPress={() => setStep('amount')} style={modal.backBtn}>
                <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
              </Pressable>
              <Text style={modal.title}>Select Provider</Text>
              <Text style={modal.sub}>Withdrawing K{parseInt(amount).toLocaleString()}</Text>
              {MOBILE_MONEY_PROVIDERS.map(p => (
                <Pressable key={p.id} onPress={() => { setProvider(p); setStep('number'); }}
                  style={[modal.providerCard, provider?.id === p.id && modal.providerCardActive]}>
                  <View style={[modal.providerDot, { backgroundColor: p.color }]} />
                  <Text style={modal.providerLabel}>{p.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}

          {step === 'number' && (
            <View style={modal.content}>
              <Pressable onPress={() => setStep('provider')} style={modal.backBtn}>
                <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
              </Pressable>
              <Text style={modal.title}>{provider?.label}</Text>
              <Text style={modal.sub}>Enter your mobile number</Text>
              <TextInput
                style={modal.phoneInput}
                placeholder="+260 97X XXX XXX"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
              <Pressable
                onPress={() => phone.length >= 9 && setStep('confirm')}
                disabled={phone.length < 9}
                style={{ width: '100%', marginTop: 16 }}
              >
                <LinearGradient
                  colors={phone.length >= 9 ? Gradients.primary : ['#333', '#444']}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={modal.continueBtn}
                >
                  <Text style={modal.continueBtnText}>Review →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {step === 'confirm' && (
            <View style={modal.content}>
              <Pressable onPress={() => setStep('number')} style={modal.backBtn}>
                <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
              </Pressable>
              <Text style={modal.title}>Confirm Withdrawal</Text>
              <View style={modal.confirmCard}>
                <ConfirmRow label="Amount" value={`K${parseInt(amount).toLocaleString()}`} highlight />
                <ConfirmRow label="Provider" value={provider?.label} />
                <ConfirmRow label="Number" value={phone} />
                <ConfirmRow label="Fee" value="Free" />
                <ConfirmRow label="Arrives" value="Within 5 minutes" />
              </View>
              <Pressable onPress={() => setStep('success')} style={{ width: '100%', marginTop: 16 }}>
                <LinearGradient
                  colors={Gradients.primary}
                  start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={[modal.continueBtn, Shadow.glow]}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={modal.continueBtnText}>Confirm Withdrawal</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {step === 'success' && (
            <View style={[modal.content, modal.successContent]}>
              <Animated.View style={[modal.successCircle, { transform: [{ scale: successScale }], opacity: successOpacity }]}>
                <LinearGradient colors={Gradients.primary} style={modal.successGradCircle}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </LinearGradient>
              </Animated.View>
              <Text style={modal.successTitle}>Withdrawal Sent!</Text>
              <Text style={modal.successSub}>
                K{parseInt(amount).toLocaleString()} is on its way to {provider?.label}
              </Text>
              <Text style={modal.successTime}>Arriving within 5 minutes ⚡</Text>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ConfirmRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={modal.confirmRow}>
      <Text style={modal.confirmLabel}>{label}</Text>
      <Text style={[modal.confirmValue, highlight && modal.confirmValueHighlight]}>{value}</Text>
    </View>
  );
}

const modal = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  kvWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center', marginBottom: 20,
  },
  content: { gap: 12 },
  title: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  sub: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: -4 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  amountInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.pink,
    paddingHorizontal: 16, marginVertical: 8,
  },
  currencySymbol: {
    color: Colors.pink, fontSize: 28, fontWeight: Typography.bold, marginRight: 8,
  },
  amountInput: {
    flex: 1, color: '#fff', fontSize: 32, fontWeight: Typography.black,
    paddingVertical: 14, includeFontPadding: false,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn: {
    borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.surfaceElevated,
  },
  quickBtnText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.semibold },
  errorText: { color: Colors.error, fontSize: Typography.sm },
  continueBtn: {
    borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row', gap: 4,
  },
  continueBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  providerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  providerCardActive: { borderColor: Colors.pink },
  providerDot: { width: 14, height: 14, borderRadius: 7 },
  providerLabel: { flex: 1, color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  phoneInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, color: '#fff',
    fontSize: Typography.lg, paddingHorizontal: 16, paddingVertical: 14,
  },
  confirmCard: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
    padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { color: Colors.textSecondary, fontSize: Typography.sm },
  confirmValue: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  confirmValueHighlight: { color: Colors.pink, fontSize: Typography.lg },
  successContent: { alignItems: 'center', paddingVertical: 24 },
  successCircle: { marginBottom: 16 },
  successGradCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.glow,
  },
  successTitle: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black },
  successSub: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  successTime: { color: Colors.sold, fontSize: Typography.sm, fontWeight: Typography.semibold, marginTop: 4 },
});

// ─── Main Wallet Screen ───────────────────────────────────────
export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const headerGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlow, { toValue: 0.7, duration: 2400, useNativeDriver: true }),
        Animated.timing(headerGlow, { toValue: 0.4, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HERO BALANCE CARD ── */}
        <View style={styles.heroCardWrap}>
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Animated.View style={[styles.glowBlob, { opacity: headerGlow }]} />
            <Text style={styles.heroLabel}>Total Earnings</Text>
            <AnimatedCounter
              value={WALLET_DATA.totalEarnings}
              prefix="K"
              duration={1400}
              style={styles.heroAmount}
            />
            <View style={styles.heroDivider} />
            <View style={styles.heroSubRow}>
              <View style={styles.heroSubItem}>
                <Text style={styles.heroSubLabel}>Available</Text>
                <AnimatedCounter
                  value={WALLET_DATA.availableBalance}
                  prefix="K"
                  duration={1200}
                  style={styles.heroSubValue}
                />
              </View>
              <View style={styles.heroSubDivider} />
              <View style={styles.heroSubItem}>
                <Text style={styles.heroSubLabel}>Pending</Text>
                <AnimatedCounter
                  value={WALLET_DATA.pendingBalance}
                  prefix="K"
                  duration={1000}
                  style={styles.heroSubValuePending}
                />
              </View>
              <View style={styles.heroSubDivider} />
              <View style={styles.heroSubItem}>
                <Text style={styles.heroSubLabel}>Withdrawn</Text>
                <AnimatedCounter
                  value={WALLET_DATA.totalWithdrawn}
                  prefix="K"
                  duration={1100}
                  style={styles.heroSubValue}
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── WITHDRAW BUTTON ── */}
        <Pressable onPress={() => setShowWithdraw(true)} style={styles.withdrawBtnWrap}>
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={[styles.withdrawBtn, Shadow.glow]}
          >
            <MaterialCommunityIcons name="bank-transfer-out" size={22} color="#fff" />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </LinearGradient>
        </Pressable>

        {/* Pending info bar */}
        <View style={styles.pendingBar}>
          <Ionicons name="time-outline" size={16} color={Colors.orange} />
          <Text style={styles.pendingBarText}>
            K{WALLET_DATA.pendingBalance.toLocaleString()} pending — clears after order delivery
          </Text>
        </View>

        {/* ── REVENUE CHART ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue This Week</Text>
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>K{(WALLET_DATA.totalEarnings / 1000).toFixed(1)}K</Text>
            </LinearGradient>
          </View>
          <RevenueChart />
        </View>

        {/* ── BREAKDOWN ── */}
        <View style={styles.section}>
          <BreakdownBar />
        </View>

        {/* ── WITHDRAWAL HISTORY ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal History</Text>
          <View style={styles.historyList}>
            {WITHDRAWAL_HISTORY.map((item, i) => (
              <View
                key={item.id}
                style={[styles.historyItem, i < WITHDRAWAL_HISTORY.length - 1 && styles.historyItemBorder]}
              >
                <View style={styles.historyIconWrap}>
                  <LinearGradient
                    colors={item.status === 'completed' ? ['#003B00', '#00C851'] : [Colors.surfaceElevated, Colors.surface]}
                    style={styles.historyIcon}
                  >
                    <MaterialCommunityIcons
                      name="bank-transfer-out"
                      size={18}
                      color={item.status === 'completed' ? '#fff' : Colors.orange}
                    />
                  </LinearGradient>
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMethod}>{item.method}</Text>
                  <Text style={styles.historyMeta}>{item.number} · {item.date}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>K{item.amount.toLocaleString()}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'completed' ? styles.statusDone : styles.statusPending,
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.status === 'completed' ? styles.statusTextDone : styles.statusTextPending,
                    ]}>
                      {item.status === 'completed' ? 'Sent' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── STATS GRID ── */}
        <View style={styles.statsGrid}>
          <StatCard icon="trending-up" label="This Month" value="K49.1K" color={Colors.pink} />
          <StatCard icon="star" label="Top Day" value="Sat K12.4K" color={Colors.gold} />
          <StatCard icon="people" label="Total Orders" value="186" color={Colors.purple} />
          <StatCard icon="checkmark-circle" label="Completed" value="97%" color={Colors.sold} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Withdraw Modal */}
      <WithdrawModal
        visible={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        maxAmount={WALLET_DATA.availableBalance}
      />
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={stat.card}>
      <View style={[stat.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    width: (width - 48) / 2,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, gap: 6, borderWidth: 1, borderColor: Colors.border,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  value: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  label: { color: Colors.textMuted, fontSize: Typography.xs },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  scroll: { padding: 16, gap: 16 },

  // Hero card
  heroCardWrap: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.glow },
  heroCard: { padding: 24, borderRadius: Radius.xl, gap: 6, overflow: 'hidden' },
  glowBlob: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.15)',
    top: -60, right: -60,
  },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.sm, fontWeight: Typography.semibold },
  heroAmount: { color: '#fff', fontSize: 44, fontWeight: Typography.black, letterSpacing: -1 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center' },
  heroSubItem: { flex: 1, alignItems: 'center', gap: 3 },
  heroSubDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroSubLabel: { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xs, fontWeight: Typography.medium },
  heroSubValue: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.black },
  heroSubValuePending: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.black },

  // Withdraw button
  withdrawBtnWrap: { borderRadius: Radius.pill, overflow: 'hidden' },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: Radius.pill,
  },
  withdrawBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },

  // Pending bar
  pendingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,140,0,0.08)', borderRadius: Radius.lg, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
    marginTop: -4,
  },
  pendingBarText: { flex: 1, color: Colors.orange, fontSize: Typography.xs, lineHeight: 18 },

  // Section
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 18, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  weekBadge: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  weekBadgeText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.black },

  // History
  historyList: { gap: 0 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  historyIconWrap: {},
  historyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  historyInfo: { flex: 1, gap: 3 },
  historyMethod: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  historyMeta: { color: Colors.textMuted, fontSize: Typography.xs },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.black },
  statusBadge: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusDone: { backgroundColor: 'rgba(0,200,81,0.1)', borderColor: Colors.sold },
  statusPending: { backgroundColor: 'rgba(255,140,0,0.1)', borderColor: Colors.orange },
  statusText: { fontSize: 10, fontWeight: Typography.bold },
  statusTextDone: { color: Colors.sold },
  statusTextPending: { color: Colors.orange },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
