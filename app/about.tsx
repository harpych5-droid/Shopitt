import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';

const VALUES = [
  { icon: 'flash-outline', color: '#FF4DA6', title: 'Speed', desc: 'Buy in seconds. Sell in minutes.' },
  { icon: 'people-outline', color: '#7B5CFF', title: 'Community', desc: 'Connecting Africa one sale at a time.' },
  { icon: 'shield-checkmark-outline', color: '#00C851', title: 'Trust', desc: 'Verified sellers, secure payments.' },
  { icon: 'heart-outline', color: '#FF8C00', title: 'Passion', desc: 'We love fashion. You will too.' },
];

const STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '12K+', label: 'Products Listed' },
  { value: '4.8★', label: 'App Rating' },
  { value: 'v2.0', label: 'Version' },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>About Shopitt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <LinearGradient colors={['#1A0835', '#0E0E0E']} style={styles.hero}>
          <Image
            source={{ uri: 'https://cdn-ai.onspace.ai/onspace/files/hqoPFyysTQXXFDYLWTgamJ/file_00000000a83071fba04af85181c18e75.png' }}
            style={styles.mascot}
            contentFit="contain"
          />
          <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={styles.logoBadge}>
            <Text style={styles.logoText}>Shopitt</Text>
          </LinearGradient>
          <Text style={styles.heroTagline}>
            Trend Discovery → Social Sharing → Instant Buying
          </Text>
          <Text style={styles.heroVersion}>Version 2.0.0</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Shopitt is a social commerce platform by AETHØN Inc., designed to revolutionize how Africa discovers, shares, and purchases fashion.
          </Text>
          <Text style={styles.sectionText}>
            We believe fashion should be social, fast, and accessible. Shopitt connects buyers directly with local sellers, creators, and fashion entrepreneurs — creating a dopamine-driven shopping experience that feels alive.
          </Text>
        </View>

        {/* Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {VALUES.map(v => (
              <View key={v.title} style={styles.valueCard}>
                <LinearGradient colors={[v.color + '33', v.color + '11']} style={styles.valueIcon}>
                  <Ionicons name={v.icon as any} size={22} color={v.color} />
                </LinearGradient>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueDesc}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AETHON Inc */}
        <View style={styles.aethonCard}>
          <Text style={styles.aethonTitle}>AETHØN Inc.</Text>
          <Text style={styles.aethonText}>
            A technology company based in Lusaka, Zambia. We build platforms that empower African entrepreneurs and connect communities through commerce.
          </Text>
          <Text style={styles.aethonContact}>hello@aethon.inc</Text>
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
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center', paddingTop: 40, paddingBottom: 32, paddingHorizontal: 16, gap: 12,
  },
  mascot: { width: 100, height: 100 },
  logoBadge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill },
  logoText: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black },
  heroTagline: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  heroVersion: { color: Colors.textMuted, fontSize: Typography.sm },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginVertical: 16,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.black },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: Typography.medium },
  section: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  sectionText: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 24 },
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valueCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  valueIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  valueTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  valueDesc: { color: Colors.textSecondary, fontSize: Typography.xs, lineHeight: 18 },
  aethonCard: {
    margin: 16, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 20, gap: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  aethonTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black, letterSpacing: 2 },
  aethonText: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20, textAlign: 'center' },
  aethonContact: { color: Colors.pink, fontSize: Typography.base, fontWeight: Typography.semibold },
});
