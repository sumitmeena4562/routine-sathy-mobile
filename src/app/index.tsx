import React, { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AmbientAtmosphere, GlassCard } from '@/components/ui';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Three subtle, elegant breathing dots in a smooth continuous wave.
 */
function MinimalPulsingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.25, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.75 + dot1.value * 0.35 }],
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.75 + dot2.value * 0.35 }],
  }));

  const style3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.75 + dot3.value * 0.35 }],
  }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, style1]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, style2]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, style3]} />
    </View>
  );
}

export default function SplashScreen() {
  const theme = useTheme();

  // Subtle breathing animation for brand emblem
  const scale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.35);

  useEffect(() => {
    // Gentle emblem breathing pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.98, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Soft ambient aura pulse
    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.25, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [scale, auraOpacity]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedAuraStyle = useAnimatedStyle(() => ({
    opacity: auraOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {/* 1. Bright, Luminous Morning Canvas (No dim/grey tint) */}
      <LinearGradient
        colors={['#F6F4FE', '#FAF9FF', '#F0F6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Optical Pastel Atmospheric Glow Mesh */}
      <AmbientAtmosphere />

      {/* 3. Subtle Ethereal Abstract Glass Circles (Soft depth without distraction) */}
      <View pointerEvents="none" style={styles.abstractRingsContainer}>
        <View style={styles.ringOuter} />
        <View style={styles.ringMiddle} />
      </View>

      {/* 4. Center Brand Identity (Clean, Refined & Balanced) */}
      <View style={styles.centerContainer}>
        {/* Animated Brand Emblem */}
        <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
          {/* Radiant Soft Lavender Aura behind glass */}
          <Animated.View style={[styles.emblemAura, animatedAuraStyle]} />

          {/* Refined Frosted Glass Emblem Box with Specular Rim Highlight */}
          <GlassCard
            variant="heavy"
            padding={0}
            radius={26}
            specularHighlight
            style={styles.glassEmblemBox}>
            <LinearGradient
              colors={['#8B7CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerGlyphGradient}>
              <Ionicons name="sparkles" size={36} color="#FFFFFF" />
            </LinearGradient>
          </GlassCard>
        </Animated.View>

        {/* Routine Sathy App Name */}
        <Text style={styles.brandTitle}>Routine Sathy</Text>

        {/* Small Elegant Tagline */}
        <Text style={styles.brandTagline}>Your Mindful Daily Rhythm</Text>
      </View>

      {/* 5. Minimal Breathing Dots Loader (• • •) */}
      <View style={styles.bottomLoaderContainer}>
        <MinimalPulsingDots color={theme.colors.primary} />
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
  abstractRingsContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  ringOuter: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 246, 0.12)',
  },
  ringMiddle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 246, 0.08)',
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
    marginBottom: 20,
  },
  emblemAura: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(139, 124, 246, 0.24)',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(28px)',
          WebkitFilter: 'blur(28px)',
        } as any)
      : {}),
  },
  glassEmblemBox: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  innerGlyphGradient: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#25233A',
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#77758B',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomLoaderContainer: {
    position: 'absolute',
    bottom: 48,
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
