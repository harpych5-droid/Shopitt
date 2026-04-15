import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  Dimensions, KeyboardAvoidingView, Platform, TextInput, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const btnsTranslate = useRef(new Animated.Value(40)).current;
  const btnsOpacity = useRef(new Animated.Value(0)).current;

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8, delay: 200 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true, delay: 200 }),
    ]).start();

    Animated.parallel([
      Animated.timing(btnsOpacity, { toValue: 1, duration: 600, useNativeDriver: true, delay: 700 }),
      Animated.timing(btnsTranslate, { toValue: 0, duration: 600, useNativeDriver: true, delay: 700 }),
    ]).start();

    // Glow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding');
    }, 1000);
  };

  const handleEmailLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('the_joystreet_shop', 'Livingstone');
      router.replace('/(tabs)');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image
        source={require('@/assets/images/auth-bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,14,14,0.7)' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.inner, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
          {/* LOGO */}
          <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
            {/* Mascot */}
            <Image
              source={{ uri: 'https://cdn-ai.onspace.ai/onspace/files/hqoPFyysTQXXFDYLWTgamJ/file_00000000a83071fba04af85181c18e75.png' }}
              style={styles.mascot}
              contentFit="contain"
            />
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.logoBadge}
            >
              <Text style={styles.logoText}>Shopitt</Text>
            </LinearGradient>
            <Text style={styles.tagline}>Discover. Share. Buy. Instantly.</Text>
          </Animated.View>

          {/* BUTTONS */}
          <Animated.View style={[styles.btns, { opacity: btnsOpacity, transform: [{ translateY: btnsTranslate }] }]}>
            {!showEmail ? (
              <>
                <SocialButton
                  icon="logo-google"
                  label="Continue with Google"
                  onPress={() => handleSocialLogin('google')}
                  loading={loading}
                />
                <SocialButton
                  icon="logo-facebook"
                  label="Continue with Facebook"
                  color="#1877F2"
                  onPress={() => handleSocialLogin('facebook')}
                  loading={loading}
                />
                <Pressable onPress={() => setShowEmail(true)} style={styles.emailLink}>
                  <Text style={styles.emailLinkText}>Continue with Email</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.emailForm}>
                <Text style={styles.emailTitle}>Sign in</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Pressable onPress={handleEmailLogin} style={{ width: '100%' }}>
                  <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.signInBtn}
                  >
                    <Text style={styles.signInText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={() => setShowEmail(false)} style={styles.backLink}>
                  <Text style={styles.backLinkText}>← Back</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialButton({ icon, label, color = '#fff', onPress, loading }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 60 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.socialBtn}
        disabled={loading}
      >
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.socialBtnText, { color }]}>{label}</Text>
        <View style={{ width: 22 }} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  mascot: { width: 110, height: 110, marginBottom: 8 },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    borderWidth: 40,
    borderColor: 'rgba(255,77,166,0.15)',
    top: -60,
  },
  logoBadge: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    marginBottom: 16,
    ...Shadow.glow,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: Typography.black,
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  btns: { width: '100%', alignItems: 'center', gap: 12 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  socialBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    flex: 1,
    textAlign: 'center',
  },
  emailLink: { marginTop: 8, padding: 8 },
  emailLinkText: { color: Colors.textSecondary, fontSize: Typography.base, textDecorationLine: 'underline' },
  emailForm: { width: '100%', gap: 12 },
  emailTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: '#fff',
    fontSize: Typography.base,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  signInBtn: { borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center', ...Shadow.glow },
  signInText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  backLink: { alignItems: 'center', padding: 8 },
  backLinkText: { color: Colors.textSecondary, fontSize: Typography.base },
  terms: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', marginTop: 32, lineHeight: 20 },
  termsLink: { color: Colors.pink, textDecorationLine: 'underline' },
});
