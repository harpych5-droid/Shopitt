import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';

const TIPS = [
  {
    icon: 'shield-checkmark-outline',
    color: '#7B5CFF',
    title: 'Use Cash on Delivery',
    desc: 'Whenever possible, inspect your item before paying. This reduces risk significantly.',
  },
  {
    icon: 'lock-closed-outline',
    color: '#FF4DA6',
    title: 'Never Share Personal Data',
    desc: 'Do not share your bank account details, passwords, or ID documents with sellers through chat.',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    color: '#7B5CFF',
    title: 'Communicate In-App',
    desc: 'Keep all communications within Shopitt messages. This helps resolve disputes and keeps a record of agreements.',
  },
  {
    icon: 'camera-outline',
    color: '#FF4DA6',
    title: 'Request Proof of Product',
    desc: 'Ask sellers for additional photos or videos of the actual item before confirming your order.',
  },
  {
    icon: 'flag-outline',
    color: '#FF4DA6',
    title: 'Report Suspicious Activity',
    desc: 'If you encounter fake listings, scam attempts, or inappropriate content, report it immediately via support@shopitt.com.',
  },
  {
    icon: 'receipt-outline',
    color: '#00C851',
    title: 'Keep Order Records',
    desc: 'Screenshot your order confirmations and keep a record of all transactions in case of disputes.',
  },
  {
    icon: 'star-outline',
    color: Colors.gold,
    title: 'Buy from Verified Sellers',
    desc: 'Look for the verified badge. These sellers have completed identity verification and have strong track records.',
  },
  {
    icon: 'alert-circle-outline',
    color: Colors.orange,
    title: 'Beware of Too-Good Deals',
    desc: 'If a price seems unrealistically low, proceed with caution. Trust your instincts and verify authenticity.',
  },
];

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Safety Tips</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={['rgba(0,200,81,0.1)', 'rgba(0,200,81,0.02)']} style={styles.hero}>
          <Ionicons name="shield-checkmark" size={44} color={Colors.success} />
          <Text style={styles.heroTitle}>Stay Safe on Shopitt</Text>
          <Text style={styles.heroSub}>
            We care about your safety. Follow these tips to shop with confidence.
          </Text>
        </LinearGradient>

        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <LinearGradient
              colors={[tip.color + '33', tip.color + '11']}
              style={styles.tipIcon}
            >
              <Ionicons name={tip.icon as any} size={22} color={tip.color} />
            </LinearGradient>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Report an Issue</Text>
          <Text style={styles.reportText}>support@shopitt.com</Text>
          <Text style={styles.reportSub}>We investigate all reports within 48 hours</Text>
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
    borderWidth: 1, borderColor: 'rgba(0,200,81,0.2)',
  },
  heroTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black, textAlign: 'center' },
  heroSub: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  tipCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  tipIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipContent: { flex: 1, gap: 4 },
  tipTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  tipDesc: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20 },
  reportCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 20,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  reportTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  reportText: { color: Colors.pink, fontSize: Typography.base, fontWeight: Typography.semibold },
  reportSub: { color: Colors.textSecondary, fontSize: Typography.sm },
});
