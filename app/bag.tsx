import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
  TextInput, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { CountryPicker } from '@/components/ui/CountryPicker';

const { width } = Dimensions.get('window');

// ─── Delivery Address Form ────────────────────────────────────
interface AddressData {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes: string;
}

const EMPTY_ADDRESS: AddressData = {
  fullName: '', phone: '', country: '', city: '', address: '', notes: '',
};

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: AddressData;
  onSave: (data: AddressData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressData>(initial);
  const update = (k: keyof AddressData) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.fullName.trim() && form.phone.trim() && form.country && form.city.trim() && form.address.trim();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.addressScroll} contentContainerStyle={styles.addressContent} keyboardShouldPersistTaps="handled">
        <View style={styles.addressHeader}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <Text style={styles.addressSubtitle}>Where should we send your order?</Text>
        </View>

        <FieldInput label="Full Name" placeholder="e.g. Joy Mwanza" value={form.fullName} onChangeText={update('fullName')} />
        <FieldInput label="Phone Number" placeholder="+260 97X XXX XXX" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Country</Text>
          <CountryPicker value={form.country} onChange={update('country')} />
        </View>

        <FieldInput label="City / District" placeholder="e.g. Lusaka" value={form.city} onChangeText={update('city')} />
        <FieldInput label="Street Address" placeholder="e.g. 14 Cairo Road, Flat 3B" value={form.address} onChangeText={update('address')} />
        <FieldInput label="Delivery Notes (Optional)" placeholder="e.g. Call before arrival" value={form.notes} onChangeText={update('notes')} multiline />

        <View style={styles.addressBtns}>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => isValid && onSave(form)}
            disabled={!isValid}
            style={{ flex: 2 }}
          >
            <LinearGradient
              colors={isValid ? Gradients.primary : ['#333', '#444']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.saveAddrBtn}
            >
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.saveAddrBtnText}>Save Address</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldInput({ label, placeholder, value, onChangeText, keyboardType, multiline }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

// ─── Order Tracking Timeline ──────────────────────────────────
const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: 'checkmark-circle', done: true },
  { key: 'confirmed', label: 'Confirmed', icon: 'shield-checkmark', done: false },
  { key: 'shipped', label: 'Shipped', icon: 'car', done: false },
  { key: 'out', label: 'Out for Delivery', icon: 'navigate', done: false },
  { key: 'delivered', label: 'Delivered', icon: 'home', done: false },
];

function OrderTimeline() {
  return (
    <View style={styles.timeline}>
      {ORDER_STEPS.map((step, i) => (
        <View key={step.key} style={styles.timelineStep}>
          <View style={styles.timelineLeft}>
            <View style={[styles.timelineDot, step.done ? styles.timelineDotDone : styles.timelineDotPending]}>
              <Ionicons
                name={step.icon as any}
                size={16}
                color={step.done ? '#fff' : Colors.textMuted}
              />
            </View>
            {i < ORDER_STEPS.length - 1 && (
              <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
            )}
          </View>
          <View style={styles.timelineInfo}>
            <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>{step.label}</Text>
            {step.done && step.key === 'placed' && (
              <Text style={styles.timelineTime}>Just now · Order #SHP-{Date.now().toString().slice(-6)}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Bag Screen ──────────────────────────────────────────
export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bagItems, updateQuantity, removeFromBag, bagTotal, clearBag } = useApp();

  // Address state
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Checkout flow
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment' | 'success'>('address');
  const [payMethod, setPayMethod] = useState<'mobilemoney' | 'card' | 'delivery'>('mobilemoney');
  const [success, setSuccess] = useState(false);
  const checkoutY = useRef(new Animated.Value(600)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const openCheckout = () => {
    setShowCheckout(true);
    setCheckoutStep(savedAddress ? 'payment' : 'address');
    Animated.spring(checkoutY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 9 }).start();
  };

  const closeCheckout = () => {
    Animated.timing(checkoutY, { toValue: 600, duration: 250, useNativeDriver: true }).start(() => setShowCheckout(false));
  };

  const handleSaveAddress = (data: AddressData) => {
    setSavedAddress(data);
    setCheckoutStep('payment');
    setShowAddressForm(false);
  };

  const placeOrder = () => {
    Animated.timing(checkoutY, { toValue: 600, duration: 250, useNativeDriver: true }).start();
    setSuccess(true);
    Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8, delay: 100 }).start();
    setTimeout(() => {
      clearBag();
      setSuccess(false);
      successScale.setValue(0);
      setShowCheckout(false);
      setCheckoutStep('address');
      router.push('/(tabs)');
    }, 3200);
  };

  const PAY_METHODS = [
    { id: 'mobilemoney', label: 'Mobile Money', icon: 'phone-portrait-outline', sub: 'MTN, Airtel, Zamtel' },
    { id: 'card', label: 'Card Payment', icon: 'card-outline', sub: 'Visa, Mastercard' },
    { id: 'delivery', label: 'Cash on Delivery', icon: 'car-outline', sub: 'Pay when you receive' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Bag 🛍️</Text>
        {bagItems.length > 0 && (
          <Pressable onPress={clearBag} hitSlop={8}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {bagItems.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient colors={Gradients.primary} style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySubtitle}>Discover products and add them to your bag</Text>
          <Pressable onPress={() => router.push('/(tabs)')} style={styles.emptyBtn}>
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.emptyBtnGrad}>
              <Text style={styles.emptyBtnText}>Browse Feed</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {bagItems.map(item => (
              <View key={item.id} style={styles.bagItem}>
                <Image source={{ uri: item.image }} style={styles.itemImg} contentFit="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemProduct} numberOfLines={2}>{item.product}</Text>
                  <Text style={styles.itemSeller}>@{item.seller}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={18} color="#fff" />
                  </Pressable>
                  <Text style={styles.qtyNum}>{item.quantity}</Text>
                  <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </Pressable>
                </View>
                <Pressable onPress={() => removeFromBag(item.id)} style={styles.removeBtn} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </Pressable>
              </View>
            ))}

            {/* Saved address preview */}
            {savedAddress && (
              <Pressable style={styles.addressCard} onPress={() => setShowAddressForm(true)}>
                <View style={styles.addressCardLeft}>
                  <LinearGradient colors={Gradients.primary} style={styles.addressIcon}>
                    <Ionicons name="location" size={16} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressCardName}>{savedAddress.fullName}</Text>
                    <Text style={styles.addressCardDetail} numberOfLines={1}>
                      {savedAddress.address}, {savedAddress.city}, {savedAddress.country}
                    </Text>
                    <Text style={styles.addressCardPhone}>{savedAddress.phone}</Text>
                  </View>
                </View>
                <Ionicons name="pencil" size={16} color={Colors.pink} />
              </Pressable>
            )}

            {/* Order summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>K{bagTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>FREE</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>K{bagTotal.toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Button */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable onPress={openCheckout} style={{ flex: 1 }}>
              <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={[styles.checkoutBtn, Shadow.glow]}>
                <Text style={styles.checkoutText}>Checkout — K{bagTotal.toLocaleString()}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}

      {/* CHECKOUT PANEL */}
      {showCheckout && (
        <Animated.View style={[styles.checkoutPanel, { transform: [{ translateY: checkoutY }] }]}>
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              {checkoutStep === 'address' ? 'Delivery Address' : 'Checkout'}
            </Text>
            <Pressable onPress={closeCheckout} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {checkoutStep === 'address' && (
            <AddressForm
              initial={savedAddress || EMPTY_ADDRESS}
              onSave={handleSaveAddress}
              onCancel={closeCheckout}
            />
          )}

          {checkoutStep === 'payment' && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Delivery address summary */}
              {savedAddress && (
                <Pressable style={styles.addressMini} onPress={() => setCheckoutStep('address')}>
                  <Ionicons name="location" size={16} color={Colors.pink} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressMiniName}>{savedAddress.fullName} · {savedAddress.phone}</Text>
                    <Text style={styles.addressMiniAddr} numberOfLines={1}>
                      {savedAddress.address}, {savedAddress.city}, {savedAddress.country}
                    </Text>
                  </View>
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              )}

              {/* Items */}
              <Text style={styles.panelSection}>Order Summary</Text>
              {bagItems.map(item => (
                <View key={item.id} style={styles.panelItem}>
                  <Image source={{ uri: item.image }} style={styles.panelItemImg} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.panelItemName} numberOfLines={1}>{item.product}</Text>
                    <Text style={styles.panelItemSub}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.panelItemPrice}>{item.price}</Text>
                </View>
              ))}

              {/* Delivery */}
              <View style={styles.deliveryInfo}>
                <Ionicons name="time-outline" size={15} color={Colors.success} />
                <Text style={styles.deliveryInfoText}>Estimated delivery: 2–4 business days 🚚</Text>
              </View>

              {/* Payment */}
              <Text style={styles.panelSection}>Payment Method</Text>
              {PAY_METHODS.map(pm => (
                <Pressable key={pm.id} onPress={() => setPayMethod(pm.id as any)}
                  style={[styles.payMethod, payMethod === pm.id && styles.payMethodActive]}>
                  <View style={[styles.payIcon, payMethod === pm.id && styles.payIconActive]}>
                    <Ionicons name={pm.icon as any} size={20} color={payMethod === pm.id ? '#fff' : Colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payLabel, payMethod === pm.id && { color: '#fff' }]}>{pm.label}</Text>
                    <Text style={styles.paySub}>{pm.sub}</Text>
                  </View>
                  {payMethod === pm.id && <MaterialIcons name="check-circle" size={20} color={Colors.pink} />}
                </Pressable>
              ))}

              {/* Total */}
              <View style={styles.checkoutTotal}>
                <Text style={styles.checkoutTotalLabel}>Total (incl. free delivery)</Text>
                <Text style={styles.checkoutTotalValue}>K{bagTotal.toLocaleString()}</Text>
              </View>

              <Pressable onPress={placeOrder}>
                <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  style={[styles.placeOrderBtn, Shadow.glow]}>
                  <Text style={styles.placeOrderText}>Place Order — K{bagTotal.toLocaleString()}</Text>
                </LinearGradient>
              </Pressable>
              <View style={{ height: 32 }} />
            </ScrollView>
          )}
        </Animated.View>
      )}

      {/* SUCCESS OVERLAY */}
      {success && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <LinearGradient colors={Gradients.primary} style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>Order Placed! 🎉</Text>
            <Text style={styles.successSub}>Arriving in 2–4 days · Track in your profile</Text>
            <View style={styles.successAddress}>
              <Ionicons name="location" size={14} color={Colors.pink} />
              <Text style={styles.successAddressText} numberOfLines={2}>
                {savedAddress ? `${savedAddress.address}, ${savedAddress.city}, ${savedAddress.country}` : 'Your saved address'}
              </Text>
            </View>
            {/* Mini timeline */}
            <OrderTimeline />
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
  clearText: { color: Colors.error, fontSize: Typography.sm },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold },
  emptySubtitle: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
  emptyBtn: { width: '100%', borderRadius: Radius.pill, overflow: 'hidden' },
  emptyBtnGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: Radius.pill },
  emptyBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },

  list: { flex: 1 },
  bagItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  itemImg: { width: 72, height: 72, borderRadius: Radius.md },
  itemInfo: { flex: 1, gap: 4 },
  itemProduct: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold, lineHeight: 18 },
  itemSeller: { color: Colors.textMuted, fontSize: Typography.xs },
  itemPrice: { color: Colors.pink, fontSize: Typography.md, fontWeight: Typography.black },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 4,
  },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 8 },

  // Address card
  addressCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1.5, borderColor: Colors.pink,
    gap: 10,
  },
  addressCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  addressIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addressCardName: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  addressCardDetail: { color: Colors.textSecondary, fontSize: Typography.xs, lineHeight: 17, marginTop: 2 },
  addressCardPhone: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },

  summary: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: Colors.textSecondary, fontSize: Typography.base },
  summaryValue: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  summaryTotal: { paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  totalValue: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.black },

  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.background },
  checkoutBtn: { borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.bold },

  checkoutPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', padding: 20, paddingBottom: 0,
  },
  panelHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  panelTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  panelSection: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1, marginVertical: 10 },
  panelItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  panelItemImg: { width: 48, height: 48, borderRadius: Radius.sm },
  panelItemName: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  panelItemSub: { color: Colors.textMuted, fontSize: Typography.xs },
  panelItemPrice: { color: Colors.pink, fontSize: Typography.base, fontWeight: Typography.bold },

  // Address mini
  addressMini: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,77,166,0.3)',
  },
  addressMiniName: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  addressMiniAddr: { color: Colors.textSecondary, fontSize: Typography.xs, marginTop: 2 },
  changeText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold, marginTop: 2 },

  deliveryInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,200,81,0.08)', borderRadius: Radius.md,
    padding: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,200,81,0.2)',
  },
  deliveryInfoText: { color: Colors.success, fontSize: Typography.sm, fontWeight: Typography.medium },

  payMethod: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border,
  },
  payMethodActive: { borderColor: Colors.pink },
  payIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  payIconActive: { backgroundColor: Colors.pink },
  payLabel: { color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.semibold },
  paySub: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },

  checkoutTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, marginVertical: 8, borderWidth: 1, borderColor: Colors.border,
  },
  checkoutTotalLabel: { color: Colors.textSecondary, fontSize: Typography.sm },
  checkoutTotalValue: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.black },

  placeOrderBtn: { borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  placeOrderText: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.bold },

  // Address form styles
  addressScroll: { maxHeight: 480 },
  addressContent: { gap: 14, paddingBottom: 20 },
  addressHeader: { marginBottom: 4 },
  addressTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  addressSubtitle: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: 4 },
  field: { gap: 6 },
  fieldLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  fieldInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: '#fff', fontSize: Typography.base,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  multilineInput: { minHeight: 70, textAlignVertical: 'top' },
  addressBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.semibold },
  saveAddrBtn: { borderRadius: Radius.pill, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveAddrBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },

  // Success
  successOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 14, borderWidth: 1, borderColor: Colors.pink, ...Shadow.glow,
    width: '100%',
  },
  successIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black },
  successSub: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
  successAddress: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, width: '100%' },
  successAddressText: { color: Colors.textMuted, fontSize: Typography.xs, flex: 1, lineHeight: 18 },

  // Order timeline
  timeline: { width: '100%', gap: 0, marginTop: 4 },
  timelineStep: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: Colors.pink },
  timelineDotPending: { backgroundColor: Colors.surfaceElevated, borderWidth: 1.5, borderColor: Colors.border },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.pink },
  timelineInfo: { flex: 1, paddingVertical: 6, paddingBottom: 12 },
  timelineLabel: { color: Colors.textMuted, fontSize: Typography.sm, fontWeight: Typography.medium },
  timelineLabelDone: { color: '#fff', fontWeight: Typography.bold },
  timelineTime: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
});
