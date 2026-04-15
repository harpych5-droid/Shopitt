import React, { useRef, useEffect } from 'react';
import { StyleSheet, Pressable, Animated, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: object;
  disabled?: boolean;
}

export function GradientButton({ label, onPress, size = 'md', style, disabled }: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }).start();
  };

  const heights = { sm: 38, md: 48, lg: 56 };
  const fontSizes = { sm: Typography.sm, md: Typography.base, lg: Typography.md };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
        <LinearGradient
          colors={Gradients.primary}
          start={Gradients.primaryLR.start}
          end={Gradients.primaryLR.end}
          style={[
            styles.btn,
            { height: heights[size], borderRadius: Radius.pill, opacity: disabled ? 0.5 : 1 },
            Shadow.glow,
          ]}
        >
          <Text style={[styles.label, { fontSize: fontSizes[size] }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

interface BuyNowButtonProps {
  label?: string;
  onPress: () => void;
  compact?: boolean;
}

export function BuyNowButton({ label = 'Buy Now', onPress, compact = false }: BuyNowButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 60 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 16 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient
          colors={Gradients.primary}
          start={Gradients.primaryLR.start}
          end={Gradients.primaryLR.end}
          style={[
            styles.buyNow,
            compact ? styles.buyNowCompact : {},
            Shadow.glow,
          ]}
        >
          <Text style={[styles.buyNowLabel, compact ? { fontSize: Typography.sm } : {}]}>
            {label} 🛍️
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textOnGradient,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },
  buyNow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  buyNowCompact: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 100,
  },
  buyNowLabel: {
    color: Colors.textOnGradient,
    fontWeight: Typography.bold,
    fontSize: Typography.base,
    letterSpacing: 0.3,
  },
});
