import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { RoutineSathyEmblem } from './RoutineSathyEmblem';

export interface CircadianRhythmDialProps {
  size?: number;
}

/**
 * CircadianRhythmDial - Clean, Minimal Circadian Rhythm Orbit.
 * Elegant single-ring harmonic cycle with subtle breathing motion.
 */
export function CircadianRhythmDial({ size = 180 }: CircadianRhythmDialProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 40000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [rotation, pulse]);

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const haloSize = size * 1.15;
  const centerSize = Math.round(size * 0.38);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Subtle, Warm Sunrise Ambient Aura */}
      <View style={[styles.ambientHalo, { width: haloSize, height: haloSize }]}>
        <Svg width={haloSize} height={haloSize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="cleanDialHalo" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FED7AA" stopOpacity="0.30" />
              <Stop offset="60%" stopColor="#FFEDD5" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#cleanDialHalo)" />
        </Svg>
      </View>

      {/* 2. Minimalist Circadian Orbit Ring */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedOrbitStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <Defs>
            <LinearGradient id="minimalOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#0F172A" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#F97316" stopOpacity="0.2" />
            </LinearGradient>
          </Defs>

          {/* Clean Thin Track */}
          <Circle
            cx="100"
            cy="100"
            r="82"
            stroke={theme.colors.borderSubtle}
            strokeWidth="2"
          />

          {/* Dynamic Arc */}
          <Circle
            cx="100"
            cy="100"
            r="82"
            stroke="url(#minimalOrbitGrad)"
            strokeWidth="3.5"
            strokeDasharray="140 375"
            strokeLinecap="round"
          />

          {/* Flow Anchor Dot */}
          <Circle cx="100" cy="18" r="4.5" fill="#F97316" />
        </Svg>
      </Animated.View>

      {/* 3. Central Brand Emblem with Gentle Pulse */}
      <Animated.View style={[styles.centerEmblem, animatedCenterStyle]}>
        <RoutineSathyEmblem size={centerSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientHalo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  centerEmblem: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
