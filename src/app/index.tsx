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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AmbientAtmosphere, GlassCard } from '@/components/ui';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SplashScreen() {
  const theme = useTheme();

  // Subtle breathing animation for brand emblem
  const scale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.4);
  const loaderTranslateX = useSharedValue(-60);

  useEffect(() => {
    // 1. Gentle emblem breathing pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.98, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 2. Soft ambient aura glow pulse
    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 3. Subtle horizontal loading glide
    loaderTranslateX.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
        withTiming(-60, { duration: 1600, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    );
  }, [scale, auraOpacity, loaderTranslateX]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedAuraStyle = useAnimatedStyle(() => ({
    opacity: auraOpacity.value,
  }));

  const animatedLoaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: loaderTranslateX.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* 1. Soft Lavender & Icy Blue Glassmorphism Background */}
      <AmbientAtmosphere />

      {/* 2. Abstract Floating Glass Rings (Depth Geometry) */}
      <View pointerEvents="none" style={styles.abstractRingsContainer}>
        <View
          style={[
            styles.abstractRing,
            styles.ringOuter,
            { borderColor: theme.colors.glassBorderSubtle },
          ]}
        />
        <View
          style={[
            styles.abstractRing,
            styles.ringMiddle,
            { borderColor: theme.colors.glassBorderSubtle },
          ]}
        />
      </View>

      {/* 3. Center Brand Visual & Typography */}
      <View style={styles.centerContainer}>
        {/* Animated Brand Emblem */}
        <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
          {/* Radiant Soft Lavender Aura behind glass */}
          <Animated.View
            style={[
              styles.emblemAura,
              animatedAuraStyle,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(157, 143, 250, 0.28)'
                  : 'rgba(139, 124, 246, 0.22)',
              },
            ]}
          />

          {/* Frosted Glass Emblem Box with Specular Rim Highlight */}
          <GlassCard
            variant="heavy"
            padding={0}
            radius={32}
            specularHighlight
            style={styles.glassEmblemBox}>
            <LinearGradient
              colors={
                theme.isDark
                  ? ['#9D8FFA', '#7C3AED', '#4F46E5']
                  : ['#8B7CF6', '#7C3AED', '#6D28D9']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerGlyphGradient}>
              <Ionicons name="sparkles" size={42} color="#FFFFFF" />
            </LinearGradient>
          </GlassCard>
        </Animated.View>

        {/* Routine Sathy App Name */}
        <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
          Routine Sathy
        </Text>

        {/* Small Elegant Tagline */}
        <Text style={[styles.brandTagline, { color: theme.colors.textSecondary }]}>
          Your Mindful Daily Rhythm
        </Text>
      </View>

      {/* 4. Subtle Minimal Loading Animation */}
      <View style={styles.bottomLoaderContainer}>
        <View
          style={[
            styles.loaderTrack,
            {
              backgroundColor: theme.isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(139, 124, 246, 0.12)',
            },
          ]}>
          <Animated.View style={[styles.loaderPill, animatedLoaderStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                theme.colors.primary,
                theme.colors.secondaryForeground,
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
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
  abstractRing: {
    position: 'absolute',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ringOuter: {
    width: 320,
    height: 320,
    opacity: 0.6,
  },
  ringMiddle: {
    width: 220,
    height: 220,
    opacity: 0.8,
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
    marginBottom: 24,
  },
  emblemAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: Radius.full,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(30px)',
          WebkitFilter: 'blur(30px)',
        } as any)
      : {}),
  },
  glassEmblemBox: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 10,
  },
  innerGlyphGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
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
  loaderTrack: {
    width: 64,
    height: 3,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  loaderPill: {
    width: 40,
    height: 3,
    position: 'absolute',
    top: 0,
    left: 12,
  },
});
