import React, { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RoutineSathyEmblem } from './RoutineSathyEmblem';
import { Toast, ToastType } from './Toast';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export interface AuthToastConfig {
  visible: boolean;
  type: ToastType;
  message: string;
  onDismiss: () => void;
}

export interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  emblemSize?: number;
  onBack?: () => void;
  fallbackRoute?: string;
  topRight?: React.ReactNode;
  toast?: AuthToastConfig | null;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Centralized, fully responsive layout component for Authentication screens.
 * Provides the signature Dark Forest background canvas, top crown sunrise glow,
 * notch-safe header, brand emblem, responsive typography, and bottom-anchored actions.
 */
export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
  emblemSize: customEmblemSize,
  onBack,
  fallbackRoute = '/welcome',
  topRight,
  toast,
  contentStyle,
}: AuthScreenLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive device breakpoints
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  // Responsive layout dimensions
  const maxWidth = isTablet ? 440 : 380;
  const horizontalPadding = isTablet ? 32 : isCompact ? 20 : 24;
  const emblemSize = customEmblemSize ?? (isCompact ? 52 : isTablet ? 66 : 58);

  const handleBackPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  }, [onBack, router, fallbackRoute]);

  return (
    <View style={[styles.root, { backgroundColor: PrimitiveTokens.color.forest[950] }]}>
      <StatusBar style="light" />
      {Platform.OS === 'android' && <NavigationBar hidden={true} style="dark" />}

      {/* Atmospheric Forest Canvas with Whisper-Soft Crown Sunrise Glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="authSkyGradientGlobal" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#0A3326" />
              <Stop offset="65%" stopColor="#07261B" />
              <Stop offset="100%" stopColor="#052418" />
            </LinearGradient>
            <RadialGradient id="crownGlowGradientGlobal" cx="50%" cy="0%" rx="65%" ry="45%">
              <Stop offset="0%" stopColor="#FFC94D" stopOpacity={0.12} />
              <Stop offset="60%" stopColor="#FFC94D" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="#FFC94D" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#authSkyGradientGlobal)" />
          <Rect width="100%" height="100%" fill="url(#crownGlowGradientGlobal)" />
        </Svg>
      </View>

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onDismiss={toast.onDismiss}
        />
      )}

      {/* Top Header Bar with Notch / Safe Area Clearance */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.topBarInner, { maxWidth }]}>
          <Pressable
            onPress={handleBackPress}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          {topRight ? <View>{topRight}</View> : null}
        </View>
      </View>

      {/* Scrollable Form Body with Keyboard Avoidance & Zero-Gap Structure */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingLeft: insets.left + horizontalPadding,
              paddingRight: insets.right + horizontalPadding,
              paddingBottom: Math.max(insets.bottom + 16, 28),
            },
          ]}>
          <View style={[styles.mainColumn, { maxWidth }, contentStyle]}>
            {/* Top Form Zone: Emblem + Brand Header + Input Fields */}
            <View style={styles.topZone}>
              <View style={[styles.headerContainer, isCompact && styles.headerContainerCompact]}>
                <View style={styles.emblemWrapper}>
                  <RoutineSathyEmblem size={emblemSize} withTile={true} />
                </View>

                <Text
                  style={[
                    styles.title,
                    isCompact && styles.titleCompact,
                    isTablet && styles.titleTablet,
                  ]}>
                  {title}
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    isCompact && styles.subtitleCompact,
                  ]}>
                  {subtitle}
                </Text>
              </View>

              {/* Form Fields / Content */}
              <View style={styles.formFieldsArea}>
                {children}
              </View>
            </View>

            {/* Bottom Form Zone: CTA Buttons + Secondary Links (Anchored Without Gap) */}
            {footer ? (
              <View style={[styles.bottomZone, isCompact && styles.bottomZoneCompact]}>
                {footer}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    zIndex: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  topBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(207, 227, 214, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  mainColumn: {
    width: '100%',
    flexGrow: 1,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  topZone: {
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContainerCompact: {
    marginBottom: 14,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: TypographyScale.h2.fontSize,
    fontWeight: TypographyScale.h1.fontWeight,
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
    color: SemanticDarkTokens.color.text.primary,
  },
  titleCompact: {
    fontSize: 23,
    lineHeight: 28,
  },
  titleTablet: {
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: TypographyScale.bodySm.fontSize,
    lineHeight: 20,
    marginTop: 6,
    letterSpacing: -0.1,
    textAlign: 'center',
    maxWidth: 320,
    color: SemanticDarkTokens.color.text.secondary,
  },
  subtitleCompact: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  formFieldsArea: {
    width: '100%',
  },
  bottomZone: {
    width: '100%',
    marginTop: 20,
  },
  bottomZoneCompact: {
    marginTop: 14,
  },
});
