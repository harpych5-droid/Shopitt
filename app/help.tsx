import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';

const FAQS = [
  { q: 'How do I place an order?', a: 'Browse the feed, tap "Buy Now" on any product, add to your bag, and complete checkout. You can pay via Mobile Money, card, or cash on delivery.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are encrypted and processed securely. We use industry-standard security protocols to protect your data.' },
  { q: 'How long does delivery take?', a: 'Most orders are delivered within 2–4 business days. Sellers dispatch within 24 hours of confirmed payment.' },
  { q: 'Can I return a product?', a: 'Yes, you have a 7-day return window from delivery date. Contact the seller through in-app chat to initiate a return.' },
  { q: 'How do I become a seller?', a: 'Any user can post products or services. Simply tap the Create (+) button, choose your post type, and list your item.' },
  { q: 'What if I receive a wrong item?', a: 'Contact the seller via chat immediately. If unresolved, report the issue to our support team at support@shopitt.com' },
  { q: 'How are sellers verified?', a: 'Sellers receive a verified badge after completing identity verification and maintaining a strong track record of completed orders.' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={['rgba(255,77,166,0.1)', 'rgba(123,92,255,0.1)']} style={styles.hero}>
          <Ionicons name="help-circle" size={40} color={Colors.pink} />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Find answers to common questions below</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {FAQS.map((faq, i) => (
          <Pressable key={i} onPress={() => setOpenIdx(openIdx === i ? null : i)} style={styles.faqCard}>
            <View style={styles.faqQ}>
              <Text style={styles.faqQText}>{faq.q}</Text>
              <Ionicons name={openIdx === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </View>
            {openIdx === i && (
              <Text style={styles.faqA}>{faq.a}</Text>
            )}
          </Pressable>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our support team responds within 24 hours</Text>
          <Pressable onPress={() => router.push('/contact')}>
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>Contact Support</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  hero: {
    borderRadius: Radius.xl, padding: 24, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  heroTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  heroSub: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: 8 },
  faqCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  faqQ: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  faqQText: { flex: 1, color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold, paddingRight: 8 },
  faqA: {
    color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22,
    paddingHorizontal: 16, paddingBottom: 16,
  },
  contactCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 20,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  contactTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  contactSub: { color: Colors.textSecondary, fontSize: Typography.sm, textAlign: 'center' },
  contactBtn: { borderRadius: Radius.pill, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  contactBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
});
