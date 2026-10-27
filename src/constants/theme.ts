import '@/global.css';

import { Platform, StyleSheet } from 'react-native';

/**
 * ============================================================================
 * ROUTINE SATHY CENTRALIZED DESIGN SYSTEM TOKENS
 * ============================================================================
 * Single Source of Truth for all styling, colors, typography, layout,
 * shapes, shadows, and glassmorphism effects across the mobile app.
 *
 * Rule: Modifying a token value here propagates instantly across all
 * components and screens without manual edits.
 */

// ----------------------------------------------------------------------------
// 1. Primitive Palette
// ----------------------------------------------------------------------------
export const Palette = {
  // Soft Lavender / Violet Primary Brand
  lavender50: '#F7F6FF',
  lavender100: '#EFEAFF',
  lavender200: '#DDD5FE',
  lavender300: '#C4B5FD',
  lavender400: '#A78BFA',
  lavender500: '#8B7CF6', // Primary Brand Accent
  lavender600: '#7C3AED',
  lavender700: '#6D28D9',
  lavender800: '#5B21B6',
  lavender900: '#4C1D95',

  // Sky Blue Secondary Accent
  sky100: '#E0F2FE',
  sky200: '#BAE6FD',
  sky300: '#A9C8FF', // Secondary Accent
  sky400: '#38BDF8',
  sky500: '#0EA5E9',

  // Emerald / Mint Habit Success
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald400: '#45B794', // Habit Complete Accent
  emerald500: '#10B981',
  emerald600: '#059669',

  // Amber Warning
  amber400: '#FBBF24',
  amber500: '#F59E0B',

  // Rose Error
  rose400: '#F87171',
  rose500: '#EF4444',
  rose600: '#DC2626',

  // Slate Neutral Text & Dark Theme Neutrals
  slate950: '#0D0C15', // Pure deep dark background
  slate900: '#151322', // Dark surface
  slate850: '#1C192E', // Dark elevated surface
  slate800: '#25233A', // Primary light-mode text
  slate700: '#3D3A54',
  slate600: '#54516D',
  slate500: '#77758B', // Secondary text
  slate400: '#9B99AD',
  slate300: '#C7C5D5',
  slate200: '#E4E2EE',
  slate100: '#F1F0F7',
  slate50: '#FAFAFD',

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
    // Brand
    primary: Palette.lavender500, // #8B7CF6
    primaryForeground: Palette.white,
    primaryMuted: 'rgba(139, 124, 246, 0.12)',
    primaryBorder: 'rgba(139, 124, 246, 0.28)',

    // Secondary Accent
    secondary: Palette.sky300, // #A9C8FF
    secondaryForeground: Palette.slate800,
    secondaryMuted: 'rgba(169, 200, 255, 0.20)',

    // Habit Progress & Success
    success: Palette.emerald400, // #45B794
    successForeground: Palette.white,
    successMuted: 'rgba(69, 183, 148, 0.14)',
    successBorder: 'rgba(69, 183, 148, 0.25)',

    // Status Colors
    warning: Palette.amber500,
    warningForeground: Palette.white,
    warningMuted: 'rgba(245, 158, 11, 0.14)',

    error: Palette.rose500,
    errorForeground: Palette.white,
    errorMuted: 'rgba(239, 68, 68, 0.14)',

    info: Palette.sky400,
    infoForeground: Palette.white,
    infoMuted: 'rgba(56, 189, 248, 0.14)',

    // Surfaces & Backgrounds
    background: Palette.lavender50, // #F7F6FF - Pale calming lavender
    surface: Palette.white, // #FFFFFF - Clean white card
    surfaceElevated: Palette.white,
    surfaceOverlay: 'rgba(247, 246, 255, 0.88)',

    // Secondary Background Elements (Preserving backward compatibility)
    backgroundElement: '#EFEAFF', // Subtle lavender element
    backgroundSelected: '#E3DCFC', // Selected lavender state

    // Text & Content
    text: Palette.slate800, // #25233A - High contrast readable dark
    textSecondary: Palette.slate500, // #77758B - Muted subtitle text
    textMuted: Palette.slate400,
    textInverse: Palette.white,

    // Borders & Dividers
    border: 'rgba(139, 124, 246, 0.15)',
    borderSubtle: 'rgba(37, 35, 58, 0.08)',
    borderFocus: Palette.lavender500,

    // Glassmorphism Tokens
    glassSurface: 'rgba(255, 255, 255, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.65)',

    // Interactive States
    disabled: 'rgba(119, 117, 139, 0.38)',
    disabledBackground: 'rgba(37, 35, 58, 0.05)',
    ripple: 'rgba(139, 124, 246, 0.15)',
  },
  dark: {
    // Brand
    primary: '#9D8FFA', // Slightly brighter lavender for dark mode readability
    primaryForeground: Palette.white,
    primaryMuted: 'rgba(157, 143, 250, 0.16)',
    primaryBorder: 'rgba(157, 143, 250, 0.32)',

    // Secondary Accent
    secondary: Palette.sky300,
    secondaryForeground: Palette.slate900,
    secondaryMuted: 'rgba(169, 200, 255, 0.15)',

    // Habit Progress & Success
    success: '#4ED6AD', // Glowing emerald for dark mode
    successForeground: Palette.slate900,
    successMuted: 'rgba(78, 214, 173, 0.16)',
    successBorder: 'rgba(78, 214, 173, 0.30)',

    // Status Colors
    warning: '#FBBF24',
    warningForeground: Palette.slate900,
    warningMuted: 'rgba(251, 191, 36, 0.16)',

    error: '#F87171',
    errorForeground: Palette.white,
    errorMuted: 'rgba(248, 113, 113, 0.16)',

    info: '#60A5FA',
    infoForeground: Palette.slate900,
    infoMuted: 'rgba(96, 165, 250, 0.16)',

    // Surfaces & Backgrounds
    background: Palette.slate950, // #0D0C15 - Deep night routine background
    surface: Palette.slate900, // #151322 - Card surface
    surfaceElevated: Palette.slate850, // #1C192E - Floating modal / elevated card
    surfaceOverlay: 'rgba(13, 12, 21, 0.90)',

    // Secondary Background Elements (Preserving backward compatibility)
    backgroundElement: '#1F1C33',
    backgroundSelected: '#2B2747',

    // Text & Content
    text: Palette.slate50, // #FAFAFD - Crisp white/lavender text
    textSecondary: Palette.slate400, // #9B99AD - Subtle secondary text
    textMuted: Palette.slate600,
    textInverse: Palette.slate900,

    // Borders & Dividers
    border: 'rgba(157, 143, 250, 0.18)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderFocus: '#9D8FFA',

    // Glassmorphism Tokens
    glassSurface: 'rgba(21, 19, 34, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',

    // Interactive States
    disabled: 'rgba(155, 153, 173, 0.35)',
    disabledBackground: 'rgba(255, 255, 255, 0.05)',
    ripple: 'rgba(157, 143, 250, 0.20)',
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
  glassBorder: string;
  disabled: string;
  disabledBackground: string;
  ripple: string;
}

export type ThemeColorName = keyof ThemeColors;
export type ThemeColor = ThemeColorName; // Preserves backward compatibility

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  heading: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;

// ----------------------------------------------------------------------------
// 4. Layout & Spacing Scale
// ----------------------------------------------------------------------------
export const Spacing = {
  // Named scale
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

  // Numeric scale for backward compatibility with existing components
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const ComponentHeights = {
  buttonSm: 34,
  buttonMd: 46,
  buttonLg: 54,
  input: 50,
  tabBar: 64,
  header: 56,
  badge: 24,
  progressBar: 8,
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
  '2xl': 28,
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
    shadowColor: '#25233A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#25233A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#25233A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// ----------------------------------------------------------------------------
// 6. Glassmorphism & Animations
// ----------------------------------------------------------------------------
export const GlassTokens = {
  intensity: 30,
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
