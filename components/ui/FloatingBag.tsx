import React, { useRef, useEffect } from 'react';
import { StyleSheet, Pressable, Animated, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Gradients, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';

/**
 * GLOBAL Floating Bag — rendered ONCE in BottomTabBar or root layout.
 * Position is fixed, never embedded per-post.
 */
export function GlobalFloatingBag() {
  const { bagCount } = useApp();
  const router = useRouter();
  const breathe = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(bagCount);

  // Breathing animation loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Pulse on item added
  useEffect(() => {
    if (bagCount > prevCount.current) {
      Animated.sequence([
        Animated.spring(pulse, { toValue: 1.35, useNativeDriver: true, speed: 80 }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 18 }),
      ]).start();
    }
    prevCount.current = bagCount;
  }, [bagCount]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: Animated.multiply(breathe, pulse) }] },
      ]}
    >
      <Pressable onPress={() => router.push('/bag')} style={styles.pressable}>
        <LinearGradient colors={Gradients.primary} style={[styles.bag, Shadow.glow]}>
          <MaterialIcons name="shopping-bag" size={26} color="#fff" />
        </LinearGradient>
        {bagCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{bagCount > 99 ? '99+' : bagCount}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** @deprecated Use GlobalFloatingBag instead. Kept for compatibility. */
export function FloatingBag() {
  return null;
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 999,
  },
  pressable: {
    position: 'relative',
  },
  bag: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.notificationBadge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
