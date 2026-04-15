// Shopitt Design System — LOCKED BRAND TOKENS

export const Colors = {
  // Brand
  gradientStart: '#FF4DA6',
  gradientEnd: '#7B5CFF',
  gradientMid: '#C44ED0',

  // Background
  background: '#0E0E0E',
  surface: '#1A1A1A',
  surfaceElevated: '#232323',
  surfaceGlass: 'rgba(255,255,255,0.06)',
  surfaceGlassBorder: 'rgba(255,255,255,0.10)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textOnGradient: '#FFFFFF',

  // Semantic
  success: '#00C851',
  warning: '#FF8C00',
  error: '#FF3B30',
  notificationBadge: '#FF3B30',
  sold: '#00C851',
  verified: '#4FC3F7',

  // Accent
  orange: '#FF8C00',
  gold: '#FFD700',
  pink: '#FF4DA6',
  purple: '#7B5CFF',

  // UI
  border: '#2A2A2A',
  divider: '#1E1E1E',
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
};

export const Gradients = {
  primary: ['#FF4DA6', '#7B5CFF'] as const,
  primaryLR: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
  primaryTB: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  purple: ['#7B5CFF', '#5A3FD4'] as const,
  dark: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)'] as const,
  darkFull: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)'] as const,
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,
  sold: ['#003B00', '#00C851'] as const,
  revenue: ['#FF4DA6', '#7B5CFF'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
  circle: 999,
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
  hero: 42,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const Shadow = {
  glow: {
    shadowColor: '#FF4DA6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  purpleGlow: {
    shadowColor: '#7B5CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
};
