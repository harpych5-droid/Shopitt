import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

type PostType = null | 'product' | 'video' | 'service';
type DeliveryType = 'local' | 'country' | 'international';
type CourierType = 'self' | 'platform';

const DELIVERY_INFO = {
  local: 'Visible only to nearby/local users in your city',
  country: 'Visible to users within your country',
  international: 'Visible globally — sold worldwide',
};

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>(null);

  // Common
  const [dropTitle, setDropTitle] = useState('');
  const [description, setDescription] = useState('');

  // Product
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [delivery, setDelivery] = useState<DeliveryType>('country');
  const [courier, setCourier] = useState<CourierType>('self');

  // Service
  const [serviceTitle, setServiceTitle] = useState('');

  const [submitted, setSubmitted] = useState(false);

  // Validation
  const isProductValid = dropTitle.trim() && price.trim() && quantity.trim() && delivery;
  const isServiceValid = serviceTitle.trim() && description.trim();
  const isVideoValid = dropTitle.trim();

  const canPost = postType === 'product' ? isProductValid
    : postType === 'service' ? isServiceValid
    : postType === 'video' ? isVideoValid
    : false;

  const handlePost = () => {
    if (!canPost) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPostType(null);
      setDropTitle(''); setDescription(''); setPrice('');
      setQuantity(''); setCategory('');
      router.push('/(tabs)');
    }, 2000);
  };

  const postTypes = [
    {
      id: 'product',
      label: 'Post Product',
      desc: 'Sell fashion items, sneakers, accessories & more',
      icon: 'cube-outline',
      color: '#7B5CFF',
    },
    {
      id: 'video',
      label: 'Post Short Video',
      desc: 'Vertical 9:16 — appears in Shorts feed',
      icon: 'videocam-outline',
      color: '#FF4DA6',
    },
    {
      id: 'service',
      label: 'Post Service',
      desc: 'Tailoring, beauty, styling & more',
      icon: 'briefcase-outline',
      color: '#4FC3F7',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { setPostType(null); router.back(); }} hitSlop={8}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        {postType ? (
          <Pressable onPress={handlePost} disabled={!canPost || submitted}>
            <LinearGradient
              colors={canPost ? Gradients.primary : ['#333', '#444']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.postBtn}
            >
              <Text style={styles.postBtnText}>{submitted ? 'Posting...' : 'Post'}</Text>
            </LinearGradient>
          </Pressable>
        ) : <View style={{ width: 50 }} />}
      </View>

      {!postType ? (
        <View style={styles.typeSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>What are you creating?</Text>
          <Text style={styles.sheetSubtitle}>Choose your post type to get started</Text>
          <View style={styles.typeList}>
            {postTypes.map(pt => (
              <Pressable key={pt.id} onPress={() => setPostType(pt.id as PostType)}>
                <View style={styles.typeCard}>
                  <LinearGradient colors={[pt.color, pt.color + '99']} style={styles.typeIconWrap}>
                    <Ionicons name={pt.icon as any} size={26} color="#fff" />
                  </LinearGradient>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeLabel}>{pt.label}</Text>
                    <Text style={styles.typeDesc} numberOfLines={1}>{pt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

            {/* Media Upload */}
            <Pressable style={styles.mediaUpload}>
              <LinearGradient colors={['rgba(255,77,166,0.1)', 'rgba(123,92,255,0.1)']} style={styles.mediaUploadInner}>
                <Ionicons name="camera-outline" size={36} color={Colors.pink} />
                <Text style={styles.mediaUploadText}>Tap to add photo/video</Text>
                <Text style={styles.mediaUploadHint}>JPG, PNG, MP4 — up to 50MB</Text>
              </LinearGradient>
            </Pressable>

            {/* ── DROP TITLE (all types) ── */}
            <View style={styles.field}>
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.gradientLabel}
              >
                <Text style={styles.gradientLabelText}>
                  {postType === 'service' ? 'Service Title *' : 'Drop Title *'}
                </Text>
              </LinearGradient>
              <TextInput
                style={styles.fieldInput}
                placeholder={
                  postType === 'service'
                    ? 'e.g. Custom Tailoring – Same Day'
                    : postType === 'video'
                    ? 'e.g. New Drop Just Landed 🔥'
                    : 'e.g. Air Jordan 1 Retro High'
                }
                placeholderTextColor={Colors.textMuted}
                value={postType === 'service' ? serviceTitle : dropTitle}
                onChangeText={postType === 'service' ? setServiceTitle : setDropTitle}
              />
              <Text style={styles.fieldHint}>
                This appears as the hook text on your post — make it count
              </Text>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.plainLabel}>Description</Text>
              <TextInput
                style={[styles.fieldInput, styles.textArea]}
                placeholder="Tell buyers what makes this special..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* ── PRODUCT FIELDS ── */}
            {postType === 'product' && (
              <>
                {/* Price + Qty */}
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.plainLabel}>Price (K) *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.plainLabel}>Quantity *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Category */}
                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.catRow}>
                      {['Streetwear', 'Sneakers', 'Luxury', 'Vintage', 'Beauty', 'Accessories', 'Thrift'].map(c => (
                        <Pressable key={c} onPress={() => setCategory(c)} style={styles.catPillWrap}>
                          {category === c ? (
                            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                              style={styles.catPillActive}>
                              <Text style={styles.catTextActive}>{c}</Text>
                            </LinearGradient>
                          ) : (
                            <View style={styles.catPillDefault}>
                              <Text style={styles.catTextDefault}>{c}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* ── DELIVERY TYPE ── */}
                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Delivery Reach *</Text>
                  <View style={styles.deliveryOptions}>
                    {(['local', 'country', 'international'] as DeliveryType[]).map(d => (
                      <Pressable
                        key={d}
                        onPress={() => setDelivery(d)}
                        style={styles.deliveryOptionWrap}
                      >
                        {delivery === d ? (
                          <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                            style={styles.deliveryOptionActive}>
                            <Ionicons
                              name={d === 'local' ? 'location' : d === 'country' ? 'flag' : 'globe'}
                              size={16} color="#fff"
                            />
                            <Text style={styles.deliveryOptionTextActive}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.deliveryOptionDefault}>
                            <Ionicons
                              name={d === 'local' ? 'location-outline' : d === 'country' ? 'flag-outline' : 'globe-outline'}
                              size={16} color={Colors.textMuted}
                            />
                            <Text style={styles.deliveryOptionTextDefault}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                  {delivery && (
                    <View style={styles.deliveryInfoBox}>
                      <Ionicons
                        name={delivery === 'local' ? 'location-outline' : delivery === 'country' ? 'flag-outline' : 'globe-outline'}
                        size={14} color={Colors.pink}
                      />
                      <Text style={styles.deliveryInfoText}>{DELIVERY_INFO[delivery]}</Text>
                    </View>
                  )}
                </View>

                {/* ── COURIER SELECTION ── */}
                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Courier</Text>
                  <View style={styles.courierRow}>
                    <Pressable
                      style={[styles.courierOption, courier === 'self' && styles.courierOptionActive]}
                      onPress={() => setCourier('self')}
                    >
                      <Ionicons name="person-outline" size={18} color={courier === 'self' ? Colors.pink : Colors.textMuted} />
                      <Text style={[styles.courierLabel, courier === 'self' && { color: Colors.pink }]}>
                        Self Delivery
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.courierOption, courier === 'platform' && styles.courierOptionActive]}
                      onPress={() => setCourier('platform')}
                    >
                      <Ionicons name="bicycle-outline" size={18} color={courier === 'platform' ? Colors.pink : Colors.textMuted} />
                      <Text style={[styles.courierLabel, courier === 'platform' && { color: Colors.pink }]}>
                        Platform Courier
                      </Text>
                    </Pressable>
                  </View>
                  {courier === 'platform' && (
                    <View style={styles.courierNote}>
                      <Ionicons name="information-circle-outline" size={14} color={Colors.orange} />
                      <Text style={styles.courierNoteText}>
                        Delivery handled by Shopitt courier — fee deducted from seller earnings
                      </Text>
                    </View>
                  )}
                </View>

                {/* Pricing note */}
                <View style={styles.pricingNote}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={Colors.success} />
                  <Text style={styles.pricingNoteText}>
                    Buyers see "Free Delivery" — delivery cost is blended into your product price
                  </Text>
                </View>
              </>
            )}

            {/* ── SERVICE FIELDS ── */}
            {postType === 'service' && (
              <View style={styles.field}>
                <Text style={styles.plainLabel}>CTA Button</Text>
                <View style={styles.ctaPreview}>
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>Book Now 🛍️</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.fieldHint}>CTA type is automatically set to "Book Now" for services</Text>
              </View>
            )}

            {/* Validation hint */}
            {!canPost && postType && (
              <View style={styles.validationHint}>
                <Ionicons name="alert-circle-outline" size={15} color={Colors.orange} />
                <Text style={styles.validationText}>
                  {postType === 'product'
                    ? 'Drop Title, Price, Quantity and Delivery reach are required'
                    : postType === 'service'
                    ? 'Service Title and Description are required'
                    : 'Drop Title is required'}
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.semibold },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill },
  postBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },

  typeSheet: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 24,
  },
  sheetTitle: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black, marginBottom: 6 },
  sheetSubtitle: { color: Colors.textSecondary, fontSize: Typography.base, marginBottom: 24 },
  typeList: { gap: 12 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  typeIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  typeLabel: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.semibold },
  typeDesc: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: 2 },

  form: { flex: 1 },
  formContent: { padding: 16, gap: 16, paddingBottom: 80 },

  mediaUpload: {
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
  },
  mediaUploadInner: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  mediaUploadText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  mediaUploadHint: { color: Colors.textMuted, fontSize: Typography.sm },

  field: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  gradientLabel: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  gradientLabelText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },
  plainLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, color: '#fff',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: Typography.base,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  fieldHint: { color: Colors.textMuted, fontSize: Typography.xs, lineHeight: 17 },

  catRow: { flexDirection: 'row', gap: 8 },
  catPillWrap: { overflow: 'hidden', borderRadius: Radius.pill },
  catPillActive: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill },
  catPillDefault: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  catTextActive: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  catTextDefault: { color: Colors.textSecondary, fontSize: Typography.sm },

  // Delivery options
  deliveryOptions: { flexDirection: 'row', gap: 8 },
  deliveryOptionWrap: { flex: 1, overflow: 'hidden', borderRadius: Radius.md },
  deliveryOptionActive: {
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: Radius.md,
    alignItems: 'center', gap: 4, flexDirection: 'row', justifyContent: 'center',
  },
  deliveryOptionDefault: {
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', gap: 4, flexDirection: 'row', justifyContent: 'center',
  },
  deliveryOptionTextActive: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  deliveryOptionTextDefault: { color: Colors.textMuted, fontSize: Typography.xs },
  deliveryInfoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(255,77,166,0.07)', borderRadius: Radius.md, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.15)',
  },
  deliveryInfoText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.xs, lineHeight: 17 },

  // Courier
  courierRow: { flexDirection: 'row', gap: 10 },
  courierOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 13,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  courierOptionActive: { borderColor: Colors.pink, backgroundColor: 'rgba(255,77,166,0.06)' },
  courierLabel: { color: Colors.textMuted, fontSize: Typography.sm, fontWeight: Typography.semibold },
  courierNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(255,140,0,0.08)', borderRadius: Radius.md, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
  },
  courierNoteText: { flex: 1, color: Colors.orange, fontSize: Typography.xs, lineHeight: 17 },

  // Pricing note
  pricingNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(0,200,81,0.07)', borderRadius: Radius.md, padding: 10,
    borderWidth: 1, borderColor: 'rgba(0,200,81,0.2)',
  },
  pricingNoteText: { flex: 1, color: Colors.success, fontSize: Typography.xs, lineHeight: 17 },

  // Service
  ctaPreview: { alignItems: 'flex-start' },
  ctaBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.pill },
  ctaBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },

  // Validation
  validationHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(255,140,0,0.07)', borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
  },
  validationText: { flex: 1, color: Colors.orange, fontSize: Typography.sm, lineHeight: 18 },
});
