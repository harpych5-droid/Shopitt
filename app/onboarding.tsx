import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const COUNTRIES = ['Zambia', 'Zimbabwe', 'South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Tanzania', 'Uganda'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Zambia');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (step === 1) {
      if (!username.trim()) return;
      setStep(2);
    } else {
      setLoading(true);
      setTimeout(() => {
        login(username || 'the_joystreet_shop', selectedCountry);
        router.replace('/(tabs)');
      }, 800);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>Shopitt</Text>
          </LinearGradient>

          {step === 1 ? (
            <View style={styles.section}>
              <Text style={styles.title}>Choose your username</Text>
              <Text style={styles.subtitle}>This is how people will find and follow you on Shopitt</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your_username"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.hint}>Use letters, numbers, and underscores only</Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.title}>Where are you based?</Text>
              <Text style={styles.subtitle}>We use this to show you local sellers and set delivery zones</Text>
              <View style={styles.countryGrid}>
                {COUNTRIES.map(c => (
                  <Pressable
                    key={c}
                    onPress={() => setSelectedCountry(c)}
                    style={[styles.countryBtn, selectedCountry === c && styles.countryBtnSelected]}
                  >
                    {selectedCountry === c ? (
                      <LinearGradient
                        colors={Gradients.primary}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.countryGrad}
                      >
                        <Text style={[styles.countryText, { color: '#fff' }]}>{c}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.countryText}>{c}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable onPress={handleContinue} disabled={loading}>
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.continueBtn, Shadow.glow]}
            >
              <Text style={styles.continueBtnText}>
                {loading ? 'Setting up...' : step === 1 ? 'Continue →' : 'Start Shopping 🔥'}
              </Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.dots}>
            <View style={[styles.dot, step === 1 && styles.dotActive]} />
            <View style={[styles.dot, step === 2 && styles.dotActive]} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40, alignItems: 'center' },
  badge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: Radius.pill, marginBottom: 40 },
  badgeText: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  section: { width: '100%', marginBottom: 32, gap: 12 },
  title: { color: '#fff', fontSize: Typography.xxl, fontWeight: Typography.black },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.pink,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  atSign: { color: Colors.pink, fontSize: Typography.lg, fontWeight: Typography.bold, marginRight: 4 },
  input: { flex: 1, color: '#fff', fontSize: Typography.lg, paddingVertical: 14 },
  hint: { color: Colors.textMuted, fontSize: Typography.sm },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  countryBtn: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  countryBtnSelected: { borderColor: Colors.pink },
  countryGrad: { paddingHorizontal: 16, paddingVertical: 10 },
  countryText: { color: Colors.textSecondary, fontSize: Typography.base, paddingHorizontal: 16, paddingVertical: 10 },
  continueBtn: { width: '100%', borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  continueBtnText: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.bold },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.pink, width: 20 },
});
