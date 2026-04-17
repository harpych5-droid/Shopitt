import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useApp } from '@/contexts/AppContext';

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
  const { currency } = useApp();

  const [postType, setPostType] = useState<PostType>(null);
  const [mediaFiles, setMediaFiles] = useState<Array<{ uri: string; type: 'image' | 'video' }>>([]);
  const [dropTitle, setDropTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [delivery, setDelivery] = useState<DeliveryType>('country');
  const [courier, setCourier] = useState<CourierType>('self');
  const [serviceTitle, setServiceTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sym = currency.symbol;

  const isProductValid = dropTitle.trim() && price.trim() && quantity.trim() && delivery && mediaFiles.length > 0;
  const isServiceValid = serviceTitle.trim() && description.trim();
  const isVideoValid = dropTitle.trim() && mediaFiles.length > 0;
  const canPost = postType === 'product' ? isProductValid
    : postType === 'service' ? isServiceValid
    : postType === 'video' ? isVideoValid
    : false;

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      const files = result.assets.map(a => ({
        uri: a.uri,
        type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      }));
      setMediaFiles(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!canPost) return;
    setUploading(true);

    // Simulate post creation
    await new Promise(res => setTimeout(res, 800));
    setUploading(false);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPostType(null);
      setDropTitle(''); setDescription(''); setPrice('');
      setQuantity(''); setCategory(''); setHashtags('');
      setServiceTitle(''); setMediaFiles([]);
      router.push('/(tabs)');
    }, 1200);
  };

  const postTypes = [
    { id: 'product', label: 'Post Product', desc: 'Sell fashion, sneakers, accessories & more', icon: 'cube-outline', color: '#7B5CFF' },
    { id: 'video', label: 'Post Short Video', desc: 'Vertical 9:16 — appears in Shorts feed', icon: 'videocam-outline', color: '#FF4DA6' },
    { id: 'service', label: 'Post Service', desc: 'Tailoring, beauty, styling & more', icon: 'briefcase-outline', color: '#4FC3F7' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { setPostType(null); router.back(); }} hitSlop={8}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        {postType ? (
          <Pressable onPress={handlePost} disabled={!canPost || uploading || submitted}>
            <LinearGradient
              colors={canPost ? Gradients.primary : ['#333', '#444']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.postBtn}
            >
              {uploading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.postBtnText}>{submitted ? 'Posted! ✓' : 'Post'}</Text>
              }
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
            <View style={styles.mediaSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {mediaFiles.map((f, i) => (
                  <View key={i} style={styles.mediaThumbnail}>
                    <Image source={{ uri: f.uri }} style={styles.mediaThumbImg} contentFit="cover" />
                    {f.type === 'video' && (
                      <View style={styles.videoTag}><Text style={styles.videoTagText}>VID</Text></View>
                    )}
                    <Pressable onPress={() => removeMedia(i)} style={styles.mediaRemove}>
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {mediaFiles.length < 5 && (
                  <Pressable onPress={pickMedia} style={styles.mediaUpload}>
                    <LinearGradient colors={['rgba(255,77,166,0.1)', 'rgba(123,92,255,0.1)']} style={styles.mediaUploadInner}>
                      <Ionicons name="camera-outline" size={30} color={Colors.pink} />
                      <Text style={styles.mediaUploadText}>Add Photo/Video</Text>
                      <Text style={styles.mediaUploadHint}>{mediaFiles.length}/5</Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </ScrollView>
            </View>

            {/* Drop Title */}
            <View style={styles.field}>
              <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradientLabel}>
                <Text style={styles.gradientLabelText}>{postType === 'service' ? 'Service Title *' : 'Drop Title *'}</Text>
              </LinearGradient>
              <TextInput
                style={styles.fieldInput}
                placeholder={postType === 'service' ? 'e.g. Custom Tailoring – Same Day' : postType === 'video' ? 'e.g. New Drop Just Landed 🔥' : 'e.g. Air Jordan 1 Retro High'}
                placeholderTextColor={Colors.textMuted}
                value={postType === 'service' ? serviceTitle : dropTitle}
                onChangeText={postType === 'service' ? setServiceTitle : setDropTitle}
              />
              <Text style={styles.fieldHint}>This appears as the hook text on your post — make it count</Text>
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
                multiline numberOfLines={4}
              />
            </View>

            {/* Hashtags */}
            <View style={styles.field}>
              <Text style={styles.plainLabel}>Hashtags</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="#fashion #streetwear #shopzambia"
                placeholderTextColor={Colors.textMuted}
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            {/* Product fields */}
            {postType === 'product' && (
              <>
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.plainLabel}>Price ({sym}) *</Text>
                    <TextInput style={styles.fieldInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.plainLabel}>Quantity *</Text>
                    <TextInput style={styles.fieldInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['Streetwear', 'Sneakers', 'Luxury', 'Vintage', 'Beauty', 'Accessories', 'Tailoring', 'Thrift'].map(c => (
                        <Pressable key={c} onPress={() => setCategory(c)}>
                          {category === c ? (
                            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.catPillActive}>
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

                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Delivery Reach *</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['local', 'country', 'international'] as DeliveryType[]).map(d => (
                      <Pressable key={d} onPress={() => setDelivery(d)} style={{ flex: 1 }}>
                        {delivery === d ? (
                          <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.deliveryOptionActive}>
                            <Ionicons name={d === 'local' ? 'location' : d === 'country' ? 'flag' : 'globe'} size={14} color="#fff" />
                            <Text style={styles.deliveryOptionTextActive}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.deliveryOptionDefault}>
                            <Ionicons name={d === 'local' ? 'location-outline' : d === 'country' ? 'flag-outline' : 'globe-outline'} size={14} color={Colors.textMuted} />
                            <Text style={styles.deliveryOptionTextDefault}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                  {delivery && (
                    <View style={styles.deliveryInfoBox}>
                      <Ionicons name="information-circle-outline" size={13} color={Colors.pink} />
                      <Text style={styles.deliveryInfoText}>{DELIVERY_INFO[delivery]}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.field}>
                  <Text style={styles.plainLabel}>Courier</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {(['self', 'platform'] as CourierType[]).map(c => (
                      <Pressable key={c} onPress={() => setCourier(c)}
                        style={[styles.courierOption, courier === c && styles.courierOptionActive]}>
                        <Ionicons name={c === 'self' ? 'person-outline' : 'bicycle-outline'} size={16} color={courier === c ? Colors.pink : Colors.textMuted} />
                        <Text style={[styles.courierLabel, courier === c && { color: Colors.pink }]}>
                          {c === 'self' ? 'Self Delivery' : 'Platform Courier'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {courier === 'platform' && (
                    <View style={styles.courierNote}>
                      <Ionicons name="information-circle-outline" size={13} color={Colors.orange} />
                      <Text style={styles.courierNoteText}>
                        {/* Insert courier API integration here */}
                        Delivery handled by Shopitt courier — fee deducted from seller earnings
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.pricingNote}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={Colors.success} />
                  <Text style={styles.pricingNoteText}>Buyers see "Free Delivery" — delivery cost is blended into your price</Text>
                </View>
              </>
            )}

            {/* Validation hint */}
            {!canPost && postType && (
              <View style={styles.validationHint}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.orange} />
                <Text style={styles.validationText}>
                  {postType === 'product' ? 'Drop Title, Price, Quantity, Media and Delivery reach are required'
                    : postType === 'service' ? 'Service Title and Description are required'
                    : 'Drop Title and at least 1 video are required'}
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
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, minWidth: 60, alignItems: 'center', justifyContent: 'center' },
  postBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  typeSheet: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black, marginBottom: 6 },
  sheetSubtitle: { color: Colors.textSecondary, fontSize: Typography.base, marginBottom: 24 },
  typeList: { gap: 12 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  typeLabel: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.semibold },
  typeDesc: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: 2 },
  form: { flex: 1 },
  formContent: { padding: 16, gap: 16, paddingBottom: 100 },
  mediaSection: { minHeight: 120 },
  mediaThumbnail: { width: 100, height: 100, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  mediaThumbImg: { width: '100%', height: '100%' },
  videoTag: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  videoTagText: { color: '#fff', fontSize: 9, fontWeight: Typography.bold },
  mediaRemove: { position: 'absolute', top: 4, right: 4 },
  mediaUpload: { width: 100, height: 100, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed' },
  mediaUploadInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  mediaUploadText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.semibold, textAlign: 'center' },
  mediaUploadHint: { color: Colors.textMuted, fontSize: 10 },
  field: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  gradientLabel: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  gradientLabelText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },
  plainLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: Typography.base,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  fieldHint: { color: Colors.textMuted, fontSize: Typography.xs, lineHeight: 17 },
  catPillActive: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill },
  catPillDefault: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  catTextActive: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  catTextDefault: { color: Colors.textSecondary, fontSize: Typography.sm },
  deliveryOptionActive: { paddingVertical: 11, paddingHorizontal: 8, borderRadius: Radius.md, alignItems: 'center', gap: 4, flexDirection: 'row', justifyContent: 'center' },
  deliveryOptionDefault: { paddingVertical: 11, paddingHorizontal: 8, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 4, flexDirection: 'row', justifyContent: 'center' },
  deliveryOptionTextActive: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  deliveryOptionTextDefault: { color: Colors.textMuted, fontSize: Typography.xs },
  deliveryInfoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(255,77,166,0.07)', borderRadius: Radius.md, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.15)',
  },
  deliveryInfoText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.xs, lineHeight: 17 },
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
  pricingNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(0,200,81,0.07)', borderRadius: Radius.md, padding: 10,
    borderWidth: 1, borderColor: 'rgba(0,200,81,0.2)',
  },
  pricingNoteText: { flex: 1, color: Colors.success, fontSize: Typography.xs, lineHeight: 17 },
  validationHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: 'rgba(255,140,0,0.07)', borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
  },
  validationText: { flex: 1, color: Colors.orange, fontSize: Typography.sm, lineHeight: 18 },
});
