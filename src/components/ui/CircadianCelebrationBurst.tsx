import React, { useEffect, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export interface CircadianCelebrationBurstProps {
  visible: boolean;
  onComplete?: () => void;
}

interface ParticleConfig {
  id: number;
  angle: number; // in radians
  distance: number;
  size: number;
  color: string;
  shape: 'circle' | 'pill' | 'sparkle';
  rotation: number;
  delayMs: number;
}

const PARTICLE_COLORS = [
  PrimitiveTokens.color.amber[400], // Golden Sunrise
  PrimitiveTokens.color.fern[300],  // Mint Green
  '#FFFFFF',                       // Pure White
  PrimitiveTokens.color.amber[300], // Soft Gold
  PrimitiveTokens.color.fern[200],  // Light Mint
];

// 28 deterministic particles for silky smooth UI-thread rendering
const PARTICLES: ParticleConfig[] = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + ((i % 3) * 0.15 - 0.1);
  const distance = 80 + ((i * 37) % 130);
  const size = 5 + ((i * 13) % 7);
  const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
  const shape = i % 3 === 0 ? 'sparkle' : i % 3 === 1 ? 'pill' : 'circle';
  const rotation = ((i * 47) % 360) - 180;
  const delayMs = (i % 4) * 20;

  return { id: i, angle, distance, size, color, shape, rotation, delayMs };
});

function AnimatedParticle({
  config,
  progress,
}: {
  config: ParticleConfig;
  progress: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    'worklet';
    const p = progress.value;

    // Radial distance expansion
    const currentDist = config.distance * p;
    const x = Math.cos(config.angle) * currentDist;
    // Slight downward arc (gravitational settling)
    const y = Math.sin(config.angle) * currentDist + p * p * 38;

    // Scale blooms then tapers off
    const scale = p < 0.25 ? p * 4 : Math.max(0, 1 - (p - 0.25) * 1.33);

    // Fade out towards the end
    const opacity = p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) / 0.3);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${config.rotation * p}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const isSparkle = config.shape === 'sparkle';
  const isPill = config.shape === 'pill';

  return (
    <Animated.View
      style={[
        styles.particleBase,
        {
          width: isPill ? config.size * 0.6 : config.size,
          height: isPill ? config.size * 1.8 : config.size,
          borderRadius: isPill ? 3 : isSparkle ? 2 : config.size / 2,
          backgroundColor: config.color,
          transform: isSparkle ? [{ rotate: '45deg' }] : undefined,
        },
        animStyle,
      ]}
    />
  );
}

export function CircadianCelebrationBurst({
  visible,
  onComplete,
}: CircadianCelebrationBurstProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const progress = useSharedValue(0);
  const bannerScale = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const notifyComplete = () => {
    onCompleteRef.current?.();
  };

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      bannerScale.value = 0;
      bannerOpacity.value = 0;
      return;
    }

    // 1. Success Haptic Vibration sequence
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    // 2. Animate Particles radially outward over 1400ms
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: 1400,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(notifyComplete)();
        }
      }
    );

    // 3. Animate Celebration Banner into view
    bannerScale.value = 0.5;
    bannerOpacity.value = 0;

    bannerScale.value = withSequence(
      withSpring(1, { damping: 14, stiffness: 180 }),
      withDelay(1200, withTiming(0.9, { duration: 300 }))
    );

    bannerOpacity.value = withSequence(
      withTiming(1, { duration: 250 }),
      withDelay(1150, withTiming(0, { duration: 350 }))
    );
  }, [visible, progress, bannerScale, bannerOpacity]);

  const bannerAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: bannerScale.value }],
      opacity: bannerOpacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Radial Particle Explosion Origin (Aligned with hero card area) */}
      <View style={styles.origin}>
        {PARTICLES.map((item) => (
          <AnimatedParticle key={item.id} config={item} progress={progress} />
        ))}
      </View>

      {/* Floating Circadian Celebration Badge */}
      <Animated.View
        style={[
          styles.banner,
          {
            backgroundColor: theme.isDark
              ? 'rgba(7, 38, 27, 0.95)'
              : 'rgba(255, 255, 255, 0.97)',
            borderColor: theme.isDark
              ? PrimitiveTokens.color.amber[400]
              : PrimitiveTokens.color.amber[500],
            maxWidth: Math.min(screenWidth - 48, 360),
          },
          bannerAnimStyle,
        ]}>
        <View style={styles.bannerIconBox}>
          <Ionicons name="sunny" size={20} color={PrimitiveTokens.color.amber[400]} />
        </View>
        <View style={styles.bannerTextCol}>
          <Text
            style={[
              styles.bannerTitle,
              {
                color: theme.isDark
                  ? PrimitiveTokens.color.amber[300]
                  : PrimitiveTokens.color.amber[700],
              },
            ]}>
            100 / 100 • CIRCADIAN MASTERY
          </Text>
          <Text style={[styles.bannerSubtitle, { color: theme.colors.textSecondary }]}>
            All 3 biological rhythm anchors achieved!
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  origin: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleBase: {
    position: 'absolute',
    shadowColor: PrimitiveTokens.color.amber[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  banner: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  bannerSubtitle: {
    fontSize: 11.5,
    fontFamily: TypographyScale.bodySm.fontFamily,
    marginTop: 1,
  },
});
