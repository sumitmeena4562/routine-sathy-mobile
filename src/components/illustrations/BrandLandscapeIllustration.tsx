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
   * Whether to display the habit trail.
   * Default: true
   */
  withTrail?: boolean;
  /**
   * Trail path placement: 'side' routes cleanly along the right hill flank away from center text/buttons,
   * 'classic' uses the original sweeping curve across the lower canvas.
   * Default: 'side'
   */
  trailVariant?: 'side' | 'classic';
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
  /**
   * Warm sunrise ambient glow intensity:
   * - 'subtle': Warm amber morning glow calibrated for low opacity (landing page aesthetic,
   *             doesn't bleed behind buttons or turn muddy olive).
   * - 'none': Turns off the ambient glow layer completely.
   * Default: 'subtle'
   */
  glowIntensity?: 'subtle' | 'none';
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
  withTrail = true,
  trailVariant = 'side',
  style,
  aspectRatioMode = 'slice',
  glowIntensity = 'subtle',
}: BrandLandscapeIllustrationProps) {
  const glowOpacity = useSharedValue(0.45);

  useEffect(() => {
    if (!animated || glowIntensity === 'none') return;

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animated, glowIntensity, glowOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity:
      glowIntensity === 'none'
        ? 0
        : animated
        ? glowOpacity.value
        : 0.45,
  }));

  const preserveAspectRatio =
    aspectRatioMode === 'slice'
      ? 'xMidYMid slice'
      : aspectRatioMode === 'meet'
      ? 'xMidYMid meet'
      : 'none';

  // Perspective Tapering Habit Trail:
  // - Stays purely on the rolling hills (y = 338..416), well above the bottom actions and legal text.
  // - Starts smoothly at base (width ~8px) on the right hill flank (x = 182..190), far from screen edges.
  // - Ascends along the contour of the green rolling hills, narrowing progressively (tapering to ~2.6px).
  // - Arrives right at the dawn ridge directly below the rising sun half-disc.
  const trailD =
    trailVariant === 'side'
      ? 'M 182 412 C 182 395, 175 375, 168.8 355 C 166.5 348, 165.2 342, 164.7 338 C 164.7 336.5, 167.3 336.5, 167.3 338 C 168.2 342, 170 348, 173.2 355 C 180 375, 190 395, 190 412 C 190 416, 182 416, 182 412 Z'
    : 'M 63 505 C 115 455, 36 424, 108 404 C 160 390, 122 372, 158.5 342 C 158.5 340.5, 161.5 340.5, 161.5 342 C 126 372, 168 390, 116 404 C 44 424, 125 455, 77 505 Z';

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
              <Stop offset="0%" stopColor={tokens.sunGlow} stopOpacity={0.25} />
              <Stop offset="35%" stopColor={tokens.sunGlow} stopOpacity={0.10} />
              <Stop offset="70%" stopColor={tokens.sunGlow} stopOpacity={0.02} />
              <Stop offset="100%" stopColor={tokens.sunGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {/* Warm sunrise amber aura tightly centered at dawn (r=76), preventing any bleed behind buttons */}
          <Circle cx="168" cy="306" r="76" fill="url(#sunGlowGrad)" />
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
            <Stop offset="65%" stopColor={tokens.sunBottom} />
            <Stop offset="100%" stopColor={tokens.sunBottom} />
          </LinearGradient>
          <LinearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFF1AA" stopOpacity={0.88} />
            <Stop offset="30%" stopColor={tokens.trail} stopOpacity={0.72} />
            <Stop offset="100%" stopColor={tokens.trail} stopOpacity={0.48} />
          </LinearGradient>
        </Defs>

        {/* Rising Sun - Iconic half-disc emerging prominently above the rolling hill crest */}
        <Circle cx="168" cy="306" r="30" fill="url(#risingSunGrad)" />

        {/* Back Rolling Hill Wave (extends past bottom edge) */}
        <Path d="M 0 338 C 60 310, 120 330, 236 296 V 500 H 0 Z" fill={tokens.hillBack} />

        {/* Front Foreground Hill Wave (extends past bottom edge) */}
        <Path d="M 0 390 C 80 360, 150 392, 236 350 V 500 H 0 Z" fill={tokens.hillFront} />

        {/* The Winding Habit Trail - Tapering sunlit path ascending the hills */}
        {withTrail && (
          <Path
            d={trailD}
            fill="url(#trailGrad)"
            stroke={tokens.trail}
            strokeOpacity={0.3}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
}
