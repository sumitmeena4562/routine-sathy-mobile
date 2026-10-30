import React, { useEffect } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
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

import { ComponentTokens } from '@/theme/tokens.generated';

export interface BrandLandscapeIllustrationProps {
  /**
   * Whether to run subtle breathing animation on the sunrise aura.
   * Default: true
   */
  animated?: boolean;
  /**
   * Optional custom style applied to root container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Scaling behaviour: 'slice' fills edge-to-edge (for full-bleed wallpapers/screens),
   * 'meet' preserves the entire 236:480 viewbox without clipping.
   * Default: 'slice'
   */
  aspectRatioMode?: 'slice' | 'meet' | 'none';
}

const tokens = ComponentTokens.brandLandscape;

/**
 * BrandLandscapeIllustration - Official Routine Sathy Brand Artwork
 *
 * Core Concept:
 * - Deep evergreen forest sky gradient
 * - Gentle morning sun rising over rolling hills
 * - Winding habit trail ('S'-curve) guiding the user towards dawn
 * - Built completely from centralized design system tokens.
 */
export function BrandLandscapeIllustration({
  animated = true,
  style,
  aspectRatioMode = 'slice',
}: BrandLandscapeIllustrationProps) {
  const glowOpacity = useSharedValue(0.55);

  useEffect(() => {
    if (!animated) return;

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.48, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animated, glowOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: animated ? glowOpacity.value : 0.55,
  }));

  const preserveAspectRatio =
    aspectRatioMode === 'slice'
      ? 'xMidYMid slice'
      : aspectRatioMode === 'meet'
      ? 'xMidYMid meet'
      : 'none';

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {/* 1. Base Sky Background Canvas */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 236 480"
        preserveAspectRatio={preserveAspectRatio}
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={tokens.skyTop} />
            <Stop offset="70%" stopColor={tokens.skyMid} />
            <Stop offset="100%" stopColor={tokens.skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect width="236" height="480" fill="url(#skyGrad)" />
      </Svg>

      {/* 2. Reanimated Sunrise Ambient Glow Layer */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedGlowStyle]}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 236 480"
          preserveAspectRatio={preserveAspectRatio}
          style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="sunGlowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={tokens.sunGlow} stopOpacity={0.65} />
              <Stop offset="100%" stopColor={tokens.sunGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="168" cy="318" r="120" fill="url(#sunGlowGrad)" />
        </Svg>
      </Animated.View>

      {/* 3. Rising Sun, Rolling Hill Waves & Habit Trail */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 236 480"
        preserveAspectRatio={preserveAspectRatio}
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="risingSunGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={tokens.sunTop} />
            <Stop offset="100%" stopColor={tokens.sunBottom} />
          </LinearGradient>
        </Defs>

        {/* Rising Sun */}
        <Circle cx="168" cy="326" r="26" fill="url(#risingSunGrad)" />

        {/* Back Rolling Hill Wave (extends past bottom edge) */}
        <Path d="M 0 338 C 60 310, 120 330, 236 296 V 500 H 0 Z" fill={tokens.hillBack} />

        {/* Front Foreground Hill Wave (extends past bottom edge) */}
        <Path d="M 0 390 C 80 360, 150 392, 236 350 V 500 H 0 Z" fill={tokens.hillFront} />

        {/* The Winding Habit Path / Trail smoothly extending off the bottom edge */}
        <Path
          d="M 70 500 C 120 450, 40 424, 112 404 C 164 390, 124 372, 160 358"
          fill="none"
          stroke={tokens.trail}
          strokeOpacity={0.5}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
