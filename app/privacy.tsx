import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius, Typography } from '@/constants/theme';

const SECTIONS = [
  {
    icon: 'person-outline',
    title: 'Information We Collect',
    content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes name, email address, username, profile photo, location, payment information, and transaction history.',
  },
  {
    icon: 'analytics-outline',
    title: 'How We Use Your Information',
    content: 'We use your information to provide, maintain, and improve our services; process transactions; send notifications; provide customer support; and personalize your experience with relevant products and sellers.',
  },
  {
    icon: 'share-social-outline',
    title: 'Information Sharing',
    content: 'We do not sell your personal data to third parties. We share information with sellers only as necessary to complete transactions. We may share data with service providers who assist us in operating the platform.',
  },
  {
    icon: 'lock-closed-outline',
    title: 'Data Security',
    content: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information from unauthorized access, alteration, or disclosure.',
  },
  {
    icon: 'phone-portrait-outline',
    title: 'Device & Usage Data',
    content: 'We automatically collect certain information about your device and how you interact with our app, including device type, operating system, IP address, pages viewed, and features used. This helps us improve the app.',
  },
  {
    icon: 'settings-outline',
    title: 'Your Rights & Choices',
    content: 'You have the right to access, update, or delete your personal information at any time through your account settings. You may also opt out of marketing communications or request a copy of your data.',
  },
  {
    icon: 'people-outline',
    title: "Children's Privacy",
    content: 'Shopitt is not directed to children under 13. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will delete it promptly.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.metaCard}>
          <Ionicons name="lock-closed" size={28} color={Colors.purple} />
          <Text style={styles.metaTitle}>Your Privacy Matters</Text>
          <Text style={styles.metaSub}>AETHØN Inc. — Effective April 2026</Text>
          <Text style={styles.metaIntro}>
            This Privacy Policy explains how AETHØN Inc. collects, uses, and protects your information when you use Shopitt.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name={s.icon as any} size={18} color={Colors.pink} />
              </View>
              <Text style={styles.sectionTitle}>{s.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{s.content}</Text>
          </View>
        ))}

        <Text style={styles.footer}>Questions? privacy@shopitt.com</Text>
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
  content: { padding: 16, gap: 0, paddingBottom: 40 },
  metaCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 20,
    gap: 6, borderWidth: 1, borderColor: Colors.border, marginBottom: 16, alignItems: 'center',
  },
  metaTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  metaSub: { color: Colors.textMuted, fontSize: Typography.xs },
  metaIntro: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20, textAlign: 'center', marginTop: 4 },
  section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,77,166,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  sectionContent: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 22 },
  footer: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', marginTop: 24 },
});
