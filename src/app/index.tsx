import React, { useEffect } from 'react';
import {
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

/**
 * Three delicate, minimal breathing dots in a gentle continuous wave.
 * Kept ultra-light without heavy scaling or visual distraction.
 */
function MinimalPulsingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.2);
  const dot2 = useSharedValue(0.2);
  const dot3 = useSharedValue(0.2);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.2, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      220,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 650, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.2, { duration: 650, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      440,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 650, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.2, { duration: 650, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
  }));

  const style3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
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
  // Very gentle, almost imperceptible breathing pulse
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.99, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [scale]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.root}>
      {/* 1. Luminous, Airy Pastel Morning Canvas */}
      <LinearGradient
        colors={['#FAF9FF', '#FFFFFF', '#F5F8FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft Whispering Optical Pastel Glow Mesh */}
      <AmbientAtmosphere />

      {/* 3. Center Brand Identity (Light, Refined & Perfectly Balanced) */}
      <View style={styles.centerContainer}>
        {/* Animated Brand Emblem */}
        <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
          <GlassCard
            variant="default"
            padding={0}
            radius={24}
            specularHighlight
            style={styles.glassEmblemBox}>
            <LinearGradient
              colors={['#8B7CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerGlyphBox}>
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </LinearGradient>
          </GlassCard>
        </Animated.View>

        {/* Routine Sathy App Name */}
        <Text style={styles.brandTitle}>Routine Sathy</Text>

        {/* Small Elegant Tagline */}
        <Text style={styles.brandTagline}>Your Mindful Daily Rhythm</Text>
      </View>

      {/* 4. Minimal Breathing Dots Loader (• • •) */}
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  glassEmblemBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  innerGlyphBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: '#222034',
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 13.5,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: '#7C7994',
    marginTop: 6,
    textAlign: 'center',
  },
  bottomLoaderContainer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
