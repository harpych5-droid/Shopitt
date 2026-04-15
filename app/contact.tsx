import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(''); setMessage(''); }, 2000);
  };

  const CONTACT_INFO = [
    { icon: 'mail-outline', label: 'Email', value: 'support@shopitt.com' },
    { icon: 'globe-outline', label: 'Website', value: 'www.shopitt.com' },
    { icon: 'location-outline', label: 'Headquarters', value: 'Lusaka, Zambia' },
    { icon: 'time-outline', label: 'Response Time', value: 'Within 24 hours' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Contact AETHØN Inc.</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.brandCard}>
            <Text style={styles.brandName}>AETHØN Inc.</Text>
            <Text style={styles.brandTagline}>The company behind Shopitt</Text>
          </LinearGradient>

          {/* Contact info */}
          <View style={styles.infoCard}>
            {CONTACT_INFO.map(item => (
              <View key={item.label} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.pink} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Message form */}
          <Text style={styles.formTitle}>Send a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={Colors.textMuted}
            value={subject}
            onChangeText={setSubject}
            color="#fff"
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe your issue or question..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            color="#fff"
            textAlignVertical="top"
          />

          <Pressable onPress={handleSend} disabled={!subject || !message}>
            <LinearGradient
              colors={sent ? ['#00C851', '#00A040'] : Gradients.primary as any}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={[styles.sendBtn, (!subject || !message) && { opacity: 0.5 }]}
            >
              <Ionicons name={sent ? 'checkmark-circle' : 'send'} size={18} color="#fff" />
              <Text style={styles.sendBtnText}>{sent ? 'Message Sent!' : 'Send Message'}</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  brandCard: { borderRadius: Radius.xl, padding: 28, alignItems: 'center', gap: 6 },
  brandName: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black, letterSpacing: 2 },
  brandTagline: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.base },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,77,166,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { color: Colors.textMuted, fontSize: Typography.xs, marginBottom: 2 },
  infoValue: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.medium },
  formTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: Typography.base,
  },
  textarea: { minHeight: 110 },
  sendBtn: { borderRadius: Radius.pill, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sendBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
});
