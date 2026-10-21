import React, { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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

import { AmbientAtmosphere } from '@/components/ui';

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
  // Gentle breathing motion for emblem and ambient purple glow
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.35);

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
    <View style={styles.root}>
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
          {/* Soft Feathered Purple Radiant Glow behind white glass container */}
          <Animated.View style={[styles.purpleGlowAura, animatedGlowStyle]}>
            <LinearGradient
              colors={['rgba(139, 124, 246, 0.50)', 'rgba(167, 139, 250, 0.20)', 'transparent']}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Frosted White Glass Container with Specular Top Rim */}
          <View style={styles.whiteGlassBox}>
            {/* Native Blur Layer */}
            {Platform.OS !== 'web' ? (
              <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
            ) : null}

            {/* Specular Top Rim Highlight Line */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.25)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.specularRim}
            />

            {/* Inner Vibrant Purple Gradient Glyph */}
            <LinearGradient
              colors={['#8B7CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerPurpleGlyph}>
              <Ionicons name="sparkles" size={34} color="#FFFFFF" />
            </LinearGradient>
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
    </View>
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
    width: 136,
    height: 136,
    borderRadius: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(30px)',
          WebkitFilter: 'blur(30px)',
        } as any)
      : {}),
  },
  whiteGlassBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 24,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as any)
      : {}),
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 1,
  },
  innerPurpleGlyph: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
