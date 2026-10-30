import '@/global.css';

import { Platform, StyleSheet } from 'react-native';
import {
  PrimitiveTokens,
  SemanticLightTokens,
  SemanticDarkTokens,
  LayoutTokens,
  ComponentTokens,
} from '@/theme/tokens.generated';

export { PrimitiveTokens, LayoutTokens, ComponentTokens };

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
    // Brand & CTAs - Derived from design tokens
    primary: SemanticLightTokens.color.action.primary.bg, // #FBBF24 (Sunrise Amber)
    primaryForeground: SemanticLightTokens.color.action.primary.fg, // #0B3D2E
    primaryMuted: 'rgba(251, 191, 36, 0.15)',
    primaryBorder: 'rgba(251, 191, 36, 0.35)',

    brand: SemanticLightTokens.color.text.primary, // #0B3D2E (Deep Forest Ink)
    brandForeground: '#FFFFFF',

    // Secondary - Mint & Leaf
    secondary: SemanticLightTokens.color.action.secondary.bg, // #E3F3E9
    secondaryForeground: SemanticLightTokens.color.action.secondary.fg, // #0B3D2E
    secondaryMuted: 'rgba(30, 158, 90, 0.12)',

    // Habit Progress & Success (Fern #1E9E5A)
    success: SemanticLightTokens.color.state.success,
    successForeground: '#FFFFFF',
    successMuted: SemanticLightTokens.color.state.successBg,
    successBorder: 'rgba(30, 158, 90, 0.22)',

    // Status Colors
    warning: SemanticLightTokens.color.state.warning,
    warningForeground: '#FFFFFF',
    warningMuted: SemanticLightTokens.color.state.warningBg,

    error: SemanticLightTokens.color.state.error,
    errorForeground: '#FFFFFF',
    errorMuted: SemanticLightTokens.color.state.errorBg,

    info: SemanticLightTokens.color.state.info,
    infoForeground: '#FFFFFF',
    infoMuted: SemanticLightTokens.color.state.infoBg,

    // Surfaces & Backgrounds - Peace Canvas #F7F8F6
    background: SemanticLightTokens.color.bg.app,
    surface: SemanticLightTokens.color.bg.surface,
    surfaceElevated: SemanticLightTokens.color.bg.surface,
    surfaceAlt: SemanticLightTokens.color.bg.surfaceAlt,
    surfaceOverlay: 'rgba(247, 248, 246, 0.95)',

    // Background Elements & Interactive Containers
    backgroundElement: SemanticLightTokens.color.bg.surfaceAlt,
    backgroundSelected: SemanticLightTokens.color.border.default,

    // Text & Content - Forest Ink #0B3D2E
    text: SemanticLightTokens.color.text.primary,
    textSecondary: SemanticLightTokens.color.text.secondary,
    textMuted: SemanticLightTokens.color.text.muted,
    textInverse: SemanticLightTokens.color.text.inverse,

    // Borders & Dividers - Forest Line #DFE7E1
    border: SemanticLightTokens.color.border.default,
    borderSubtle: SemanticLightTokens.color.border.subtle,
    borderFocus: SemanticLightTokens.color.border.focus,

    // Glassmorphism
    glassSurface: 'rgba(255, 255, 255, 0.85)',
    glassSurfaceHeavy: 'rgba(255, 255, 255, 0.95)',
    glassSurfaceSubtle: 'rgba(255, 255, 255, 0.60)',
    glassBorder: 'rgba(11, 61, 46, 0.08)',
    glassBorderSubtle: 'rgba(11, 61, 46, 0.05)',

    // Warm Ambient Auras
    ambientOrb1: '#FEF3C7',
    ambientOrb2: '#E3F3E9',
    ambientOrb3: '#F7F8F6',

    // Interactive States
    disabled: 'rgba(79, 101, 91, 0.40)',
    disabledBackground: 'rgba(11, 61, 46, 0.04)',
    ripple: 'rgba(11, 61, 46, 0.06)',
  },
  dark: {
    // Brand & CTAs - Derived from design tokens
    primary: SemanticDarkTokens.color.action.primary.bg,
    primaryForeground: SemanticDarkTokens.color.action.primary.fg,
    primaryMuted: 'rgba(251, 191, 36, 0.20)',
    primaryBorder: 'rgba(251, 191, 36, 0.40)',

    brand: SemanticDarkTokens.color.text.primary,
    brandForeground: '#052418',

    secondary: SemanticDarkTokens.color.action.secondary.bg,
    secondaryForeground: SemanticDarkTokens.color.action.secondary.fg,
    secondaryMuted: 'rgba(255, 255, 255, 0.08)',

    success: SemanticDarkTokens.color.state.success,
    successForeground: '#052418',
    successMuted: SemanticDarkTokens.color.state.successBg,
    successBorder: 'rgba(91, 219, 139, 0.30)',

    warning: SemanticDarkTokens.color.state.warning,
    warningForeground: '#052418',
    warningMuted: SemanticDarkTokens.color.state.warningBg,

    error: SemanticDarkTokens.color.state.error,
    errorForeground: '#FFFFFF',
    errorMuted: SemanticDarkTokens.color.state.errorBg,

    info: SemanticDarkTokens.color.state.info,
    infoForeground: '#052418',
    infoMuted: SemanticDarkTokens.color.state.infoBg,

    background: SemanticDarkTokens.color.bg.app,
    surface: SemanticDarkTokens.color.bg.surface,
    surfaceElevated: SemanticDarkTokens.color.bg.surfaceAlt,
    surfaceAlt: SemanticDarkTokens.color.bg.surfaceAlt,
    surfaceOverlay: 'rgba(5, 36, 24, 0.95)',

    backgroundElement: SemanticDarkTokens.color.bg.surfaceAlt,
    backgroundSelected: 'rgba(207, 227, 214, 0.20)',

    text: SemanticDarkTokens.color.text.primary,
    textSecondary: SemanticDarkTokens.color.text.secondary,
    textMuted: SemanticDarkTokens.color.text.muted,
    textInverse: SemanticDarkTokens.color.text.inverse,

    border: SemanticDarkTokens.color.border.default,
    borderSubtle: SemanticDarkTokens.color.border.subtle,
    borderFocus: SemanticDarkTokens.color.border.focus,

    glassSurface: 'rgba(7, 38, 27, 0.75)',
    glassSurfaceHeavy: 'rgba(7, 38, 27, 0.92)',
    glassSurfaceSubtle: 'rgba(7, 38, 27, 0.50)',
    glassBorder: 'rgba(207, 227, 214, 0.15)',
    glassBorderSubtle: 'rgba(207, 227, 214, 0.08)',

    ambientOrb1: '#07261B',
    ambientOrb2: '#0B3D2E',
    ambientOrb3: '#052418',

    disabled: 'rgba(207, 227, 214, 0.35)',
    disabledBackground: 'rgba(255, 255, 255, 0.05)',
    ripple: 'rgba(255, 255, 255, 0.10)',
  },
};

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  primaryBorder: string;
  brand: string;
  brandForeground: string;
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
  surfaceAlt: string;
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
