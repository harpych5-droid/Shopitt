import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius, Typography } from '@/constants/theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using Shopitt, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
  },
  {
    title: '2. User Accounts',
    content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '3. Seller Responsibilities',
    content: 'Sellers are solely responsible for the accuracy of their listings, product quality, timely dispatch, and honest communication with buyers. AETHØN Inc. reserves the right to remove any listing or suspend any seller account at any time.',
  },
  {
    title: '4. Buyer Responsibilities',
    content: 'Buyers agree to pay for items they commit to purchasing. Fraudulent chargebacks or false dispute claims are prohibited and may result in account suspension and legal action.',
  },
  {
    title: '5. Prohibited Items',
    content: 'Users may not list or sell counterfeit goods, stolen items, illegal products, weapons, or any item that violates applicable law. Violations result in immediate account termination.',
  },
  {
    title: '6. Payment & Fees',
    content: 'Shopitt currently charges no listing fees. Transaction fees may apply in future and will be communicated in advance. All payments must be made through approved channels.',
  },
  {
    title: '7. Dispute Resolution',
    content: 'In the event of a dispute between buyer and seller, both parties agree to first attempt resolution through the in-app messaging system. Unresolved disputes may be escalated to AETHØN Inc. support.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'AETHØN Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
  },
  {
    title: '9. Modifications',
    content: 'AETHØN Inc. reserves the right to modify these terms at any time. We will notify users of significant changes. Continued use of the platform after changes constitutes acceptance.',
  },
  {
    title: '10. Governing Law',
    content: 'These Terms shall be governed by and construed in accordance with the laws of the Republic of Zambia, without regard to its conflict of law provisions.',
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>Shopitt Terms of Service</Text>
          <Text style={styles.metaMeta}>AETHØN Inc. — Last updated: April 2026</Text>
          <Text style={styles.metaIntro}>
            Please read these Terms of Service carefully before using the Shopitt platform operated by AETHØN Inc.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionContent}>{s.content}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          For questions about these Terms, contact legal@shopitt.com
        </Text>
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
    gap: 6, borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  metaTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  metaMeta: { color: Colors.textMuted, fontSize: Typography.xs },
  metaIntro: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20, marginTop: 4 },
  section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 6 },
  sectionTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  sectionContent: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 22 },
  footer: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', marginTop: 24 },
});
