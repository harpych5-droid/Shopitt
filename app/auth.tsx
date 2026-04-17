import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  Dimensions, KeyboardAvoidingView, Platform, TextInput, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isLoggedIn, authLoading } = useApp();
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const btnsTranslate = useRef(new Animated.Value(40)).current;
  const btnsOpacity = useRef(new Animated.Value(0)).current;

  const [mode, setMode] = useState<'options' | 'signin' | 'signup'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isLoggedIn) router.replace('/(tabs)');
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8, delay: 200 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true, delay: 200 }),
    ]).start();
    Animated.parallel([
      Animated.timing(btnsOpacity, { toValue: 1, duration: 600, useNativeDriver: true, delay: 700 }),
      Animated.timing(btnsTranslate, { toValue: 0, duration: 600, useNativeDriver: true, delay: 700 }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error: e } = await signInWithGoogle();
    setLoading(false);
    if (e) setError(e);
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) { setError('Email and password required'); return; }
    setLoading(true);
    setError('');
    const { error: e } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (e) setError(e);
    else router.replace('/(tabs)');
  };

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) { setError('All fields required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const { error: e } = await signUpWithEmail(email.trim(), password, username.trim());
    setLoading(false);
    if (e) setError(e);
    else {
      setError('');
      setMode('signin');
      setEmail(email.trim());
      setPassword('');
    }
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.pink} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/auth-bg.png')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,14,14,0.72)' }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.inner, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
            <Image
              source={{ uri: 'https://cdn-ai.onspace.ai/onspace/files/hqoPFyysTQXXFDYLWTgamJ/file_00000000a83071fba04af85181c18e75.png' }}
              style={styles.mascot}
              contentFit="contain"
            />
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.logoBadge, Shadow.glow]}>
              <Text style={styles.logoText}>Shopitt</Text>
            </LinearGradient>
            <Text style={styles.tagline}>Discover. Share. Buy. Instantly.</Text>
          </Animated.View>

          <Animated.View style={[styles.btns, { opacity: btnsOpacity, transform: [{ translateY: btnsTranslate }] }]}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {mode === 'options' && (
              <>
                <SocialButton icon="logo-google" label="Continue with Google" onPress={handleGoogle} loading={loading} />
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>
                <Pressable onPress={() => { setMode('signin'); setError(''); }} style={styles.emailLink}>
                  <Text style={styles.emailLinkText}>Sign in with Email</Text>
                </Pressable>
                <Pressable onPress={() => { setMode('signup'); setError(''); }} style={styles.signupLink}>
                  <Text style={styles.signupLinkText}>Create Account</Text>
                </Pressable>
              </>
            )}

            {mode === 'signin' && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Sign In</Text>
                <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
                <Pressable onPress={handleEmailSignIn} disabled={loading} style={{ width: '100%' }}>
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.submitBtn}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Sign In</Text>}
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={() => { setMode('options'); setError(''); }} style={styles.backLink}>
                  <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <Pressable onPress={() => { setMode('signup'); setError(''); }}>
                  <Text style={styles.switchText}>No account? <Text style={{ color: Colors.pink }}>Create one</Text></Text>
                </Pressable>
              </View>
            )}

            {mode === 'signup' && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Create Account</Text>
                <TextInput style={styles.input} placeholder="Username (e.g. joy_street)" placeholderTextColor={Colors.textMuted} value={username} onChangeText={setUsername} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
                <Pressable onPress={handleEmailSignUp} disabled={loading} style={{ width: '100%' }}>
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.submitBtn}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Account</Text>}
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={() => { setMode('options'); setError(''); }} style={styles.backLink}>
                  <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <Pressable onPress={() => { setMode('signin'); setError(''); }}>
                  <Text style={styles.switchText}>Have account? <Text style={{ color: Colors.pink }}>Sign in</Text></Text>
                </Pressable>
              </View>
            )}
          </Animated.View>

          <Text style={styles.terms}>
            By continuing you agree to our{' '}
            <Text style={{ color: Colors.pink }}>Terms</Text>
            {' & '}
            <Text style={{ color: Colors.pink }}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialButton({ icon, label, onPress, loading }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
        style={styles.socialBtn}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Ionicons name={icon} size={22} color="#fff" />
              <Text style={styles.socialBtnText}>{label}</Text>
              <View style={{ width: 22 }} />
            </>
        }
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
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'transparent', borderWidth: 40,
    borderColor: 'rgba(255,77,166,0.15)', top: -60,
  },
  logoBadge: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.pill, marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 36, fontWeight: Typography.black, letterSpacing: 1 },
  tagline: { color: Colors.textSecondary, fontSize: Typography.base, letterSpacing: 0.5, textAlign: 'center' },
  btns: { width: '100%', alignItems: 'center', gap: 12 },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: Radius.md, padding: 12, width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)',
  },
  errorText: { color: Colors.error, fontSize: Typography.sm, flex: 1 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 24, paddingVertical: 16, width: '100%', minHeight: 54,
  },
  socialBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold, flex: 1, textAlign: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: Typography.sm },
  emailLink: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.border, paddingVertical: 15, alignItems: 'center',
  },
  emailLinkText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  signupLink: { paddingVertical: 8 },
  signupLinkText: { color: Colors.textSecondary, fontSize: Typography.base, textDecorationLine: 'underline' },
  form: { width: '100%', gap: 12 },
  formTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    color: '#fff', fontSize: Typography.base, paddingHorizontal: 16, paddingVertical: 14,
  },
  submitBtn: { borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center', minHeight: 54, justifyContent: 'center', ...Shadow.glow },
  submitText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  backLink: { alignItems: 'center', paddingVertical: 6 },
  backText: { color: Colors.textSecondary, fontSize: Typography.base },
  switchText: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center' },
  terms: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', marginTop: 32, lineHeight: 20 },
});
