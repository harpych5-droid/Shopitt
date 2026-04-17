import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { REVENUE_DATA } from '@/constants/data';

function useAnimatedCount(target: number, duration = 1200) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start();
    const sub = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => anim.removeListener(sub);
  }, [target]);
  return display;
}

const PROVIDERS = [
  { id: 'mtn', label: 'MTN Mobile Money', icon: '📱' },
  { id: 'airtel', label: 'Airtel Money', icon: '📲' },
  { id: 'zamtel', label: 'Zamtel Kwacha', icon: '💳' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currency } = useApp();

  const [balance, setBalance] = useState(user?.wallet_balance ?? 0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState(REVENUE_DATA);
  const [loading, setLoading] = useState(true);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [provider, setProvider] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);
  const modalY = useRef(new Animated.Value(600)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const displayBalance = useAnimatedCount(balance);
  const displayEarnings = useAnimatedCount(totalEarnings);
  const sym = currency.symbol;

  useEffect(() => {
    setLoading(false);
  }, []);

  const openWithdraw = () => {
    setShowWithdraw(true);
    Animated.spring(modalY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 9 }).start();
  };

  const closeWithdraw = () => {
    Animated.timing(modalY, { toValue: 600, duration: 250, useNativeDriver: true }).start(() => setShowWithdraw(false));
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!phone.trim() || !amount || amount <= 0 || amount > balance) return;
    setWithdrawing(true);

    // Insert payment gateway API here
    // Insert payment gateway API here
    Animated.timing(modalY, { toValue: 600, duration: 200, useNativeDriver: true }).start();
    setWithdrawing(false);
    setSuccess(true);
    Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8, delay: 100 }).start();
    setTimeout(() => {
      setSuccess(false);
      successScale.setValue(0);
      setShowWithdraw(false);
      setBalance(prev => prev - amount);
      setWithdrawAmount('');
      setPhone('');
    }, 2500);
  };

  const barMax = Math.max(...revenueData.map(d => d.value), 1);

  const displayTx = transactions.length > 0 ? transactions : [
    { id: 't1', type: 'credit', amount: 1620, description: 'Order — after 10% commission', status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 't2', type: 'credit', amount: 810, description: 'Order — after 10% commission', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 't3', type: 'withdrawal', amount: -2000, description: `Withdrawal to MTN`, status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString() },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Seller Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.balanceCard, Shadow.glow]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{sym}{displayBalance.toLocaleString()}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatVal}>{sym}{displayEarnings.toLocaleString()}</Text>
              <Text style={styles.balanceStatLabel}>Total Earnings</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatVal}>{sym}{Math.round(totalEarnings * 0.1).toLocaleString()}</Text>
              <Text style={styles.balanceStatLabel}>Commission (10%)</Text>
            </View>
          </View>
          <Pressable onPress={openWithdraw} style={styles.withdrawBtn}>
            <Ionicons name="arrow-up-circle" size={18} color={Colors.pink} />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue — This Week</Text>
          <View style={styles.chart}>
            {revenueData.map((d, i) => (
              <View key={i} style={styles.bar}>
                <Text style={styles.barVal}>{d.label}</Text>
                <View style={styles.barTrack}>
                  <LinearGradient colors={Gradients.primary} style={[styles.barFill, { height: `${(d.value / barMax) * 100}%` as any }]} />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { paddingBottom: 0 }]}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {displayTx.map((tx: any) => (
            <View key={tx.id} style={styles.txItem}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? 'rgba(0,200,81,0.1)' : 'rgba(255,59,48,0.1)' }]}>
                <Ionicons name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={16} color={tx.type === 'credit' ? Colors.success : Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: tx.type === 'credit' ? Colors.success : Colors.error }]}>
                  {tx.type === 'credit' ? '+' : ''}{sym}{Math.abs(tx.amount).toLocaleString()}
                </Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showWithdraw && (
        <Animated.View style={[styles.modal, { transform: [{ translateY: modalY }] }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            <Pressable onPress={closeWithdraw} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalLabel}>Available: {sym}{balance.toLocaleString()}</Text>
            <Text style={styles.modalSectionLabel}>Select Provider</Text>
            {PROVIDERS.map(p => (
              <Pressable key={p.id} onPress={() => setProvider(p.id)}
                style={[styles.providerRow, provider === p.id && styles.providerRowActive]}>
                <Text style={styles.providerIcon}>{p.icon}</Text>
                <Text style={[styles.providerLabel, provider === p.id && { color: '#fff' }]}>{p.label}</Text>
                {provider === p.id && <Ionicons name="checkmark-circle" size={20} color={Colors.pink} />}
              </Pressable>
            ))}
            <Text style={styles.modalSectionLabel}>Phone Number</Text>
            <TextInput style={styles.modalInput} placeholder="+260 97X XXX XXX" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.modalSectionLabel}>Amount ({sym})</Text>
            <TextInput style={styles.modalInput} placeholder="Enter amount" placeholderTextColor={Colors.textMuted} value={withdrawAmount} onChangeText={setWithdrawAmount} keyboardType="numeric" />
            <Pressable onPress={handleWithdraw} disabled={withdrawing}>
              <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.withdrawSubmit, Shadow.glow]}>
                <Text style={styles.withdrawSubmitText}>{withdrawing ? 'Processing...' : 'Confirm Withdrawal'}</Text>
              </LinearGradient>
            </Pressable>
            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.paymentNoteText}>
                {/* Insert payment gateway API here */}
                Processed within 24 hours. Platform fee of 10% already deducted from earnings.
              </Text>
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      )}

      {success && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <LinearGradient colors={Gradients.primary} style={styles.successIcon}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>Withdrawal Requested!</Text>
            <Text style={styles.successSub}>Funds will arrive within 24 hours</Text>
          </Animated.View>
        </View>
      )}
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
  balanceCard: { margin: 16, borderRadius: Radius.xl, padding: 24, gap: 14 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.sm },
  balanceAmount: { color: '#fff', fontSize: 46, fontWeight: Typography.black, letterSpacing: -1 },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1, gap: 3 },
  balanceStatVal: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  balanceStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs },
  balanceDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 16 },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 11, alignSelf: 'flex-start',
  },
  withdrawBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black, marginBottom: 14 },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, height: 160, borderWidth: 1, borderColor: Colors.border,
  },
  bar: { flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  barVal: { color: Colors.textMuted, fontSize: 8, textAlign: 'center' },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: Typography.semibold },
  txItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txDesc: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  txDate: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
  txAmount: { fontSize: Typography.base, fontWeight: Typography.black },
  txStatus: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2, textTransform: 'capitalize' },
  modal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  modalLabel: { color: Colors.textSecondary, fontSize: Typography.sm, marginBottom: 12 },
  modalSectionLabel: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1, marginTop: 14, marginBottom: 8 },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border,
  },
  providerRowActive: { borderColor: Colors.pink, backgroundColor: 'rgba(255,77,166,0.06)' },
  providerIcon: { fontSize: 22 },
  providerLabel: { flex: 1, color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.semibold },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: '#fff', fontSize: Typography.base,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  withdrawSubmit: { borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 16, minHeight: 52, justifyContent: 'center' },
  withdrawSubmitText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  paymentNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, marginTop: 12,
  },
  paymentNoteText: { color: Colors.textMuted, fontSize: Typography.xs, flex: 1, lineHeight: 17 },
  successOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 14, borderWidth: 1, borderColor: Colors.pink, ...Shadow.glow,
  },
  successIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black },
  successSub: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
});
