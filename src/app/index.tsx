import React, { useCallback, useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/ui';
import { BrandLandscapeIllustration } from '@/components/illustrations';
import { ComponentTokens } from '@/theme/tokens.generated';

/**
 * Three delicate animated sunrise amber pulse dots.
 * Floating gently above the bottom gesture navigation bar.
 */
function SplashWaveLoader() {
  const dot1 = useSharedValue(0.35);
  const dot2 = useSharedValue(0.35);
  const dot3 = useSharedValue(0.35);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.28, { duration: 420, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      140,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.28, { duration: 420, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      280,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.28, { duration: 420, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.8 + dot1.value * 0.35 }],
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.8 + dot2.value * 0.35 }],
  }));

  const style3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.8 + dot3.value * 0.35 }],
  }));

  return (
    <View style={styles.loaderRow}>
      <Animated.View style={[styles.loaderDot, style1]} />
      <Animated.View style={[styles.loaderDot, style2]} />
      <Animated.View style={[styles.loaderDot, style3]} />
    </View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 700 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const { hasCompletedOnboarding, isLoading } = useOnboarding();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const isTransitioning = useRef(false);
  const fadeOpacity = useSharedValue(1);

  const navigateNext = useCallback(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/today');
    } else if (hasCompletedOnboarding) {
      router.replace('/welcome');
    } else {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasCompletedOnboarding, router]);

  const handleProceed = useCallback(() => {
    if (isLoading || isAuthLoading || isTransitioning.current) return;
    isTransitioning.current = true;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Smooth 240ms fade out transition to next screen
    fadeOpacity.value = withTiming(
      0,
      { duration: 240, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(navigateNext)();
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthLoading, navigateNext]);

  // Transition timing: Exactly in the 1.2s – 1.5s sweet spot (1350ms)
  useEffect(() => {
    if (isLoading || isAuthLoading) return;
    const timer = setTimeout(() => {
      handleProceed();
    }, 1350);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthLoading, handleProceed]);

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  // Camera notch / Dynamic Island safe distance:
  // Centers content harmoniously in the upper sky region across all screen sizes
  const topOffset = Math.max(
    insets.top + (isCompact ? 36 : isTablet ? 72 : 54),
    Math.round(windowHeight * (isCompact ? 0.18 : 0.22))
  );

  return (
    <Pressable
      onPress={handleProceed}
      style={[styles.root, { backgroundColor: ComponentTokens.brandLandscape.skyTop }]}
      accessibilityRole="button"
      accessibilityLabel="Routine Sathy Splash Screen - Tap to enter">
      <StatusBar style="light" />

      {/* Screen container wrapped in smooth fade transition */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedFadeStyle]}>
        {/* 1. Reusable Landscape Background (extends edge-to-edge behind bottom gesture bar) */}
        <BrandLandscapeIllustration animated />

        {/* 2. Reusable Central Brand Logo with Safe Notch Clearance */}
        <View style={[styles.contentContainer, { paddingTop: topOffset }]}>
          <BrandLogo
            size={isTablet ? 'heroLg' : isCompact ? 'lg' : 'hero'}
            layout="vertical"
            tone="dark"
            withTagline
            animated
          />
        </View>

        {/* 3. Bottom Animated Sunrise Amber Pulse Dots */}
        <View
          style={[
            styles.bottomLoaderContainer,
            { bottom: Math.max(insets.bottom + 18, 32) },
          ]}>
          <SplashWaveLoader />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  bottomLoaderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FBBF24', // Sunrise Amber
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
    elevation: 3,
  },
});
