import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { RoutineSathyEmblem } from './RoutineSathyEmblem';

export interface CircadianRhythmDialProps {
  size?: number;
}

/**
 * CircadianRhythmDial - The Signature Visual Hero for Routine Sathy.
 *
 * An interactive, biological 24-hour circadian clock displaying:
 * 1. The 4 Natural Cycles: Dawn (06:00), Solar Peak (12:00), Twilight Sunset (18:00), Deep Rest (24:00)
 * 2. Luminous multi-gradient flowing arcs with tick marks
 * 3. The Sacred Routine Sathy Awakening Lotus floating in the frosted glass center
 * 4. Micro orbital celestial markers with soft animated breathing motion
 */
export function CircadianRhythmDial({ size = 220 }: CircadianRhythmDialProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    // Gentle continuous celestial rotation (slow, relaxing 60s orbit)
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 48000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Subtle mindful breathing motion
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.97, { duration: 3200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 2800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [rotation, pulse, glow]);

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Ambient Celestial Halo */}
      <Animated.View
        style={[
          styles.ambientHalo,
          { width: size * 1.15, height: size * 1.15 },
          animatedGlowStyle,
        ]}
      />

      {/* 2. Rotating Circadian Ring SVG */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedOrbitStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
          <Defs>
            {/* Dawn to Midday Gradient (Gold to Sky) */}
            <LinearGradient id="dawnPeak" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#FBBF24" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </LinearGradient>

            {/* Midday to Sunset Gradient (Sky to Twilight Lavender) */}
            <LinearGradient id="peakSunset" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#8B7CF6" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
            </LinearGradient>

            {/* Sunset to Night Gradient (Lavender to Indigo) */}
            <LinearGradient id="sunsetNight" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
              <Stop offset="60%" stopColor="#7C3AED" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#4338CA" stopOpacity="0.9" />
            </LinearGradient>

            {/* Night to Dawn Gradient (Indigo to Sunrise) */}
            <LinearGradient id="nightDawn" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4338CA" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#6366F1" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          {/* Outer Track Ring */}
          <Circle
            cx="100"
            cy="100"
            r="82"
            stroke="rgba(139, 124, 246, 0.15)"
            strokeWidth="3"
            strokeDasharray="2, 6"
          />

          {/* 4 Circadian Arcs */}
          {/* Top-Right Arc: Midday (12:00 - 18:00) */}
          <Path
            d="M 100 18 A 82 82 0 0 1 182 100"
            stroke="url(#peakSunset)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Bottom-Right Arc: Evening Wind-Down (18:00 - 24:00) */}
          <Path
            d="M 182 100 A 82 82 0 0 1 100 182"
            stroke="url(#sunsetNight)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Bottom-Left Arc: Deep Night Rest (00:00 - 06:00) */}
          <Path
            d="M 100 182 A 82 82 0 0 1 18 100"
            stroke="url(#nightDawn)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Top-Left Arc: Morning Dawn Awakening (06:00 - 12:00) */}
          <Path
            d="M 18 100 A 82 82 0 0 1 100 18"
            stroke="url(#dawnPeak)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* 4 Sacred Celestial Orbit Nodes */}
          {/* Midday Peak (Top) */}
          <Circle cx="100" cy="18" r="5" fill="#F59E0B" />
          <Circle cx="100" cy="18" r="8" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.5" />

          {/* Twilight Sunset (Right) */}
          <Circle cx="182" cy="100" r="4.5" fill="#EC4899" />
          <Circle cx="182" cy="100" r="7" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.4" />

          {/* Night Midnight (Bottom) */}
          <Circle cx="100" cy="182" r="5" fill="#6366F1" />
          <Circle cx="100" cy="182" r="8" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.5" />

          {/* Dawn Sunrise (Left) */}
          <Circle cx="18" cy="100" r="4.5" fill="#FBBF24" />
          <Circle cx="18" cy="100" r="7" stroke="#FBBF24" strokeWidth="1" strokeOpacity="0.4" />

          {/* 4 Hour Micro Labels (Cardinal Points) */}
          <G opacity="0.65">
            <SvgText x="100" y="36" fontSize="8" fill="#F59E0B" fontWeight="bold" textAnchor="middle">12 PM</SvgText>
            <SvgText x="166" y="103" fontSize="8" fill="#EC4899" fontWeight="bold" textAnchor="middle">6 PM</SvgText>
            <SvgText x="100" y="172" fontSize="8" fill="#6366F1" fontWeight="bold" textAnchor="middle">12 AM</SvgText>
            <SvgText x="34" y="103" fontSize="8" fill="#FBBF24" fontWeight="bold" textAnchor="middle">6 AM</SvgText>
          </G>
        </Svg>
      </Animated.View>

      {/* 3. Luminous Frosted Glass Center Core with Routine Sathy Emblem */}
      <Animated.View style={[styles.centerCoreWrapper, animatedCenterStyle]}>
        <View style={styles.centerGlassBadge}>
          {/* Internal Specular Glass Highlight */}
          <View style={styles.centerGlassSheen} />
          {/* Sacred Brand Insignia */}
          <RoutineSathyEmblem size={44} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 14,
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(139, 124, 246, 0.22)',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(36px)',
          WebkitFilter: 'blur(36px)',
        } as any)
      : {}),
  },
  centerCoreWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerGlassBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 18,
    elevation: 8,
  },
  centerGlassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
  },
});
