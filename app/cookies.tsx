import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';

const COOKIE_SECTIONS = [
  {
    title: '1. What Are Cookies?',
    content: 'Cookies are small text files stored on your device when you visit a website or use an app. They help us remember your preferences, keep you logged in, and understand how you use Shopitt.',
  },
  {
    title: '2. Essential Cookies',
    content: 'These cookies are necessary for Shopitt to function correctly. They enable core functionality such as security, network management, and account authentication. You cannot opt out of essential cookies.',
  },
  {
    title: '3. Analytics Cookies',
    content: 'We use analytics cookies to understand how users interact with our platform. This data helps us improve performance, fix bugs, and develop new features. All analytics data is anonymized.',
  },
  {
    title: '4. Personalization Cookies',
    content: 'These cookies allow us to remember your preferences and settings, such as language, location, and feed preferences, to provide a more personalized experience on Shopitt.',
  },
  {
    title: '5. Marketing Cookies',
    content: 'Marketing cookies track your activity across platforms to serve relevant advertisements and measure campaign effectiveness. You can opt out of marketing cookies at any time.',
  },
  {
    title: '6. Third-Party Cookies',
    content: 'Some third-party services integrated with Shopitt (e.g., payment processors, analytics providers) may set their own cookies. Please refer to their respective privacy policies for details.',
  },
  {
    title: '7. Managing Cookies',
    content: 'You can control cookie preferences through the settings below. Note that disabling certain cookies may affect app functionality. You can also manage cookies through your device settings.',
  },
];

export default function CookiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Cookie Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.metaCard}>
          <Ionicons name="receipt-outline" size={28} color={Colors.purple} />
          <Text style={styles.metaTitle}>Cookie Policy</Text>
          <Text style={styles.metaSub}>AETHØN Inc. — Effective April 2026</Text>
        </View>

        {/* Cookie Preferences */}
        <View style={styles.prefsCard}>
          <Text style={styles.prefsTitle}>Your Cookie Preferences</Text>
          {[
            { key: 'essential', label: 'Essential', desc: 'Required for app functionality', value: true, locked: true, setter: null },
            { key: 'analytics', label: 'Analytics', desc: 'Help us improve Shopitt', value: analytics, locked: false, setter: setAnalytics },
            { key: 'personalization', label: 'Personalization', desc: 'Remember your preferences', value: personalization, locked: false, setter: setPersonalization },
            { key: 'marketing', label: 'Marketing', desc: 'Relevant ads and promotions', value: marketing, locked: false, setter: setMarketing },
          ].map(pref => (
            <View key={pref.key} style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Text style={styles.prefDesc}>{pref.desc}</Text>
              </View>
              <Switch
                value={pref.value}
                onValueChange={pref.locked ? undefined : (pref.setter as any)}
                disabled={pref.locked}
                trackColor={{ false: Colors.border, true: Colors.pink }}
                thumbColor="#fff"
                ios_backgroundColor={Colors.border}
              />
            </View>
          ))}
          <Pressable onPress={handleSave}>
            <LinearGradient
              colors={saved ? ['#00C851', '#00A040'] : Gradients.primary as any}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{saved ? '✓ Preferences Saved' : 'Save Preferences'}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {COOKIE_SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
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
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  metaCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 20,
    gap: 6, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  metaTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  metaSub: { color: Colors.textMuted, fontSize: Typography.xs },
  prefsCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 16,
    gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  prefsTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold, marginBottom: 4 },
  prefRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  prefLabel: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  prefDesc: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
  saveBtn: { borderRadius: Radius.pill, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  section: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 6 },
  sectionTitle: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  sectionContent: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 22 },
  footer: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', marginTop: 12 },
});
