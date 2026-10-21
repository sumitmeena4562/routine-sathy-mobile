import React, { useCallback, useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AmbientAtmosphere, RoutineSathyEmblem } from '@/components/ui';
import { useOnboarding } from '@/context/OnboardingContext';

/**
 * Three subtle, minimal breathing dots in a gentle continuous wave: • • •
 */
function MinimalPulsingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.25, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      220,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 650, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 650, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      440,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 650, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 650, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, style1]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, style2]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, style3]} />
    </View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  // Gentle breathing motion for emblem and ambient purple glow
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.35);

  const handleProceed = useCallback(() => {
    if (isLoading) return;
    if (hasCompletedOnboarding) {
      router.replace('/explore');
    } else {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, isLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      handleProceed();
    }, 2400);
    return () => clearTimeout(timer);
  }, [handleProceed, isLoading]);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.985, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [scale, glowOpacity]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Pressable onPress={handleProceed} style={styles.root}>
      {/* Native Dark Status Bar icons over bright canvas */}
      <StatusBar style="dark" />

      {/* 1. Luminous Pastel Morning Canvas (Bright, Pure, Non-dim) */}
      <LinearGradient
        colors={['#FAF9FF', '#FFFFFF', '#F3F7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft Lavender + Icy Blue Organic Blurred Glass Orbs */}
      <AmbientAtmosphere />

      {/* 3. Center Brand Identity */}
      <View style={styles.centerContainer}>
        {/* Animated Brand Emblem & Purple Glow */}
        <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
          {/* Soft Feathered Purple Radiant Glow behind the hero icon */}
          <Animated.View style={[styles.purpleGlowAura, animatedGlowStyle]}>
            <LinearGradient
              colors={['rgba(139, 124, 246, 0.50)', 'rgba(167, 139, 250, 0.20)', 'transparent']}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Unified Brand Hero App Icon (Clean, Luminous Purple Glass Jewel - No Double Box) */}
          <View style={styles.heroAppIconTile}>
            {/* Rich Royal Violet Gradient Base */}
            <LinearGradient
              colors={['#8B7CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Specular Top Rim Highlight Line for Glass Realism */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.15)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.specularRim}
            />

            {/* Official Brand Insignia: Circadian Rhythm Arcs + Sathy Dawn Lotus */}
            <RoutineSathyEmblem size={52} />
          </View>
        </Animated.View>

        {/* Routine Sathy App Name */}
        <Text style={styles.brandTitle}>Routine Sathy</Text>

        {/* Small Elegant Tagline */}
        <Text style={styles.brandTagline}>Your Mindful Daily Rhythm</Text>
      </View>

      {/* 4. Minimal Loading Wave Dots (• • •) */}
      <View style={styles.bottomLoaderContainer}>
        <MinimalPulsingDots color="#8B7CF6" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 24,
  },
  emblemWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  purpleGlowAura: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(32px)',
          WebkitFilter: 'blur(32px)',
        } as any)
      : {}),
  },
  heroAppIconTile: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 10,
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 1,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#222034',
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: '#716E89',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomLoaderContainer: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
