import '@/global.css';

import { Platform, StyleSheet } from 'react-native';

/**
 * ============================================================================
 * ROUTINE SATHY CENTRALIZED DESIGN SYSTEM TOKENS
 * ============================================================================
 * Single Source of Truth for all styling, colors, typography, layout,
 * shapes, shadows, and glassmorphism effects across the mobile app.
 *
 * Modern White Lifestyle Canvas:
 * - Pure white background (#FFFFFF)
 * - Deep midnight navy typography & pill CTAs (#0F172A)
 * - Warm sunrise amber/orange accents (#F97316)
 * - Clean slate subtitles & borders (#64748B, #E2E8F0, #F1F5F9)
 */

// ----------------------------------------------------------------------------
// 1. Primitive Palette
// ----------------------------------------------------------------------------
export const Palette = {
  // Midnight Navy & Slate Neutrals
  slate950: '#090D16',
  slate900: '#0F172A', // Deep midnight navy
  slate850: '#141D30',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B', // Clean secondary text
  slate400: '#94A3B8', // Muted text
  slate300: '#CBD5E1', // Inactive dots / light borders
  slate200: '#E2E8F0', // Card borders
  slate100: '#F1F5F9', // Subtle surface elements
  slate50: '#F8FAFC',  // Light element background

  // Warm Sunrise / Amber Lifestyle Accents
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange400: '#FB923C',
  orange500: '#F97316', // Primary Warm Sunrise Accent

  // Emerald / Mint Habit Success
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald400: '#10B981',
  emerald500: '#059669',
  emerald600: '#047857',

  // Sky Blue Auxiliary Accent
  sky100: '#E0F2FE',
  sky200: '#BAE6FD',
  sky400: '#38BDF8',
  sky500: '#0EA5E9',

  // Rose Error
  rose400: '#F87171',
  rose500: '#EF4444',
  rose600: '#DC2626',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ----------------------------------------------------------------------------
// 2. Semantic Theme Colors (Light & Dark)
// ----------------------------------------------------------------------------
export const Colors = {
  light: {
    // Brand - Deep midnight navy pill & text
    primary: '#0F172A',
    primaryForeground: Palette.white,
    primaryMuted: 'rgba(15, 23, 42, 0.06)',
    primaryBorder: 'rgba(15, 23, 42, 0.12)',

    // Secondary - Warm sunrise orange matching character illustrations
    secondary: '#F97316',
    secondaryForeground: '#0F172A',
    secondaryMuted: 'rgba(249, 115, 22, 0.10)',

    // Habit Progress & Success
    success: '#10B981',
    successForeground: Palette.white,
    successMuted: 'rgba(16, 185, 129, 0.12)',
    successBorder: 'rgba(16, 185, 129, 0.22)',

    // Status Colors
    warning: '#F59E0B',
    warningForeground: Palette.white,
    warningMuted: 'rgba(245, 158, 11, 0.12)',

    error: Palette.rose500,
    errorForeground: Palette.white,
    errorMuted: 'rgba(239, 68, 68, 0.12)',

    info: '#0284C7',
    infoForeground: Palette.white,
    infoMuted: 'rgba(2, 132, 199, 0.12)',

    // Surfaces & Backgrounds - Premium Lifestyle Canvas with Clear Depth
    background: '#F4F6F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(255, 255, 255, 0.94)',

    // Background Elements & Interactive Containers
    backgroundElement: '#EAEFF5',
    backgroundSelected: '#E2E8F0',

    // Text & Content
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: Palette.white,

    // Borders & Dividers
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    borderFocus: '#0F172A',

    // Glassmorphism
    glassSurface: 'rgba(255, 255, 255, 0.85)',
    glassSurfaceHeavy: 'rgba(255, 255, 255, 0.95)',
    glassSurfaceSubtle: 'rgba(255, 255, 255, 0.60)',
    glassBorder: 'rgba(15, 23, 42, 0.08)',
    glassBorderSubtle: 'rgba(15, 23, 42, 0.05)',

    // Warm Ambient Auras
    ambientOrb1: '#FED7AA',
    ambientOrb2: '#FFEDD5',
    ambientOrb3: '#F8FAFC',

    // Interactive States
    disabled: 'rgba(100, 116, 139, 0.40)',
    disabledBackground: 'rgba(15, 23, 42, 0.04)',
    ripple: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    // Brand
    primary: '#F8FAFC',
    primaryForeground: '#0F172A',
    primaryMuted: 'rgba(248, 250, 252, 0.12)',
    primaryBorder: 'rgba(248, 250, 252, 0.24)',

    // Secondary Accent
    secondary: '#FB923C',
    secondaryForeground: '#FFFFFF',
    secondaryMuted: 'rgba(251, 146, 60, 0.16)',

    // Habit Progress & Success
    success: '#34D399',
    successForeground: '#090D16',
    successMuted: 'rgba(52, 211, 153, 0.16)',
    successBorder: 'rgba(52, 211, 153, 0.30)',

    // Status Colors
    warning: '#FBBF24',
    warningForeground: '#090D16',
    warningMuted: 'rgba(251, 191, 36, 0.16)',

    error: '#F87171',
    errorForeground: Palette.white,
    errorMuted: 'rgba(248, 113, 113, 0.16)',

    info: '#38BDF8',
    infoForeground: '#090D16',
    infoMuted: 'rgba(56, 189, 248, 0.16)',

    // Surfaces & Backgrounds
    background: '#090D16',
    surface: '#111827',
    surfaceElevated: '#1E293B',
    surfaceOverlay: 'rgba(9, 13, 22, 0.92)',

    // Secondary Background Elements
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',

    // Text & Content
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#090D16',

    // Borders & Dividers
    border: 'rgba(255, 255, 255, 0.12)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderFocus: '#F8FAFC',

    // Glassmorphism
    glassSurface: 'rgba(17, 24, 39, 0.70)',
    glassSurfaceHeavy: 'rgba(17, 24, 39, 0.90)',
    glassSurfaceSubtle: 'rgba(17, 24, 39, 0.45)',
    glassBorder: 'rgba(255, 255, 255, 0.14)',
    glassBorderSubtle: 'rgba(255, 255, 255, 0.08)',

    // Ambient Atmosphere Orbs
    ambientOrb1: '#1E1B4B',
    ambientOrb2: '#1F2937',
    ambientOrb3: '#0F172A',

    // Interactive States
    disabled: 'rgba(148, 163, 184, 0.35)',
    disabledBackground: 'rgba(255, 255, 255, 0.05)',
    ripple: 'rgba(248, 250, 252, 0.10)',
  },
};

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  primaryBorder: string;
  secondary: string;
  secondaryForeground: string;
  secondaryMuted: string;
  success: string;
  successForeground: string;
  successMuted: string;
  successBorder: string;
  warning: string;
  warningForeground: string;
  warningMuted: string;
  error: string;
  errorForeground: string;
  errorMuted: string;
  info: string;
  infoForeground: string;
  infoMuted: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceOverlay: string;
  backgroundElement: string;
  backgroundSelected: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  glassSurface: string;
  glassSurfaceHeavy: string;
  glassSurfaceSubtle: string;
  glassBorder: string;
  glassBorderSubtle: string;
  ambientOrb1: string;
  ambientOrb2: string;
  ambientOrb3: string;
  disabled: string;
  disabledBackground: string;
  ripple: string;
}

export type ThemeColorName = keyof ThemeColors;
export type ThemeColor = ThemeColorName;

// ----------------------------------------------------------------------------
// 3. Typography Scale & Font Families
// ----------------------------------------------------------------------------
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    serif: 'var(--font-serif, Georgia, serif)',
    rounded: 'var(--font-rounded, sans-serif)',
    mono: 'var(--font-mono, monospace)',
  },
});

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  captionMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  captionBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  code: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontWeight: (Platform.select({ android: '700' }) ?? '500') as '500' | '700',
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;

// ----------------------------------------------------------------------------
// 4. Layout & Spacing Scale
// ----------------------------------------------------------------------------
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,

  // Numeric scale for backward compatibility
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const ComponentHeights = {
  buttonSm: 36,
  buttonMd: 48,
  buttonLg: 56, // Onboarding CTA pill height
  input: 52,
  tabBar: 64,
  header: 56,
  badge: 24,
  progressBar: 6,
  habitCheck: 48,
} as const;

export const MaxContentWidth = 800;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

// ----------------------------------------------------------------------------
// 5. Shapes, Borders & Elevation
// ----------------------------------------------------------------------------
export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28, // Modern Onboarding pill radius
  full: 9999,
} as const;

export const BorderWidth = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 5,
  },
  glass: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

// ----------------------------------------------------------------------------
// 6. Glassmorphism & Animations
// ----------------------------------------------------------------------------
export const GlassTokens = {
  intensity: 25,
  tint: 'default' as const,
  borderWidth: BorderWidth.thin,
} as const;

export const AnimationTokens = {
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 400,
} as const;

// ----------------------------------------------------------------------------
// 7. Complete Theme Bundle Type
// ----------------------------------------------------------------------------
export interface ThemeBundle {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof Radius;
  borderWidth: typeof BorderWidth;
  shadows: typeof Shadows;
  heights: typeof ComponentHeights;
  glass: typeof GlassTokens;
  animation: typeof AnimationTokens;
}
