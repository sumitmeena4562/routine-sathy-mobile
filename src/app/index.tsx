import React, { useCallback, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Three subtle pill dots matching the modern onboarding pagination style.
 */
function ModernPillLoader() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.quad) })
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
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.quad) })
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
    <View style={styles.loaderRow}>
      <Animated.View style={[styles.pillActive, style1]} />
      <Animated.View style={[styles.dotSmall, style2]} />
      <Animated.View style={[styles.dotSmall, style3]} />
    </View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 700 || windowWidth < 380;

  const { hasCompletedOnboarding, isLoading } = useOnboarding();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Gentle breathing motion
  const scale = useSharedValue(1);

  const handleProceed = useCallback(() => {
    if (isLoading || isAuthLoading) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/today');
    } else if (hasCompletedOnboarding) {
      router.replace('/welcome');
    } else {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading, isAuthLoading, router]);

  useEffect(() => {
    if (isLoading || isAuthLoading) return;
    const timer = setTimeout(() => {
      handleProceed();
    }, 1200);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthLoading, handleProceed]);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [scale]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconTileSize = isCompact ? 104 : 120;

  return (
    <Pressable onPress={handleProceed} style={styles.root}>
      {/* Native Dark Status Bar on Pure White Canvas */}
      <StatusBar style="dark" />

      {/* Main Center Content */}
      <View style={styles.centerContainer}>
        {/* Animated Lifestyle Brand Insignia (Warm Amber Sun + Midnight Navy Emblem) */}
        <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
          <Svg width={iconTileSize} height={iconTileSize} viewBox="0 0 120 120" fill="none">
            <Defs>
              <RadialGradient id="splashSunGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#FFF7ED" stopOpacity="1" />
                <Stop offset="70%" stopColor="#FFEDD5" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#FED7AA" stopOpacity="0.3" />
              </RadialGradient>
            </Defs>

            {/* Warm Sunrise Sun Backdrop */}
            <Circle cx="60" cy="60" r="54" fill="url(#splashSunGrad)" />
            <Circle cx="60" cy="60" r="54" stroke="#FED7AA" strokeWidth="1.5" />

            {/* Gentle Radiating Dawn Rays */}
            <G stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
              <Path d="M 60 12 L 60 4" />
              <Path d="M 94 26 L 100 20" />
              <Path d="M 108 60 L 116 60" />
              <Path d="M 94 94 L 100 100" />
              <Path d="M 26 26 L 20 20" />
              <Path d="M 12 60 L 4 60" />
              <Path d="M 26 94 L 20 100" />
            </G>

            {/* Sacred Sathy Lotus & Circadian Rhythm Curves (Deep Midnight Navy #0F172A) */}
            {/* Outer Circadian Arc */}
            <Path
              d="M 60 28 C 76 28, 88 40, 88 60 C 88 74, 78 86, 60 86"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <Path
              d="M 60 86 C 44 86, 32 74, 32 60 C 32 46, 42 34, 52 30"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Sunrise Habit Anchor Dots */}
            <Circle cx="60" cy="28" r="4" fill="#F97316" />
            <Circle cx="88" cy="60" r="3.5" fill="#F97316" />
            <Circle cx="60" cy="86" r="4" fill="#F97316" />
            <Circle cx="32" cy="60" r="3.5" fill="#F97316" />

            {/* Central Awakening Lotus Petal */}
            <Path
              d="M 60 38 C 55 48, 54 58, 60 70 C 66 58, 65 48, 60 38 Z"
              fill="#0F172A"
            />
            {/* Left Petal */}
            <Path
              d="M 60 70 C 52 64, 46 58, 44 52 C 43 47, 47 45, 50 47 C 55 50, 58 58, 60 70 Z"
              fill="#0F172A"
            />
            {/* Right Petal */}
            <Path
              d="M 60 70 C 68 64, 74 58, 76 52 C 77 47, 73 45, 70 47 C 65 50, 62 58, 60 70 Z"
              fill="#0F172A"
            />

            {/* Golden Core Dawn Spark */}
            <Circle cx="60" cy="60" r="3" fill="#F97316" />
          </Svg>
        </Animated.View>

        {/* Brand App Title */}
        <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact]}>
          Routine Sathy
        </Text>

        {/* Brand Subtitle Tagline */}
        <Text style={[styles.brandTagline, isCompact && styles.brandTaglineCompact]}>
          Your Mindful Daily Rhythm
        </Text>
      </View>

      {/* Bottom Modern Pill Loader (Docked above physical bottom) */}
      <View
        style={[
          styles.bottomLoaderContainer,
          { bottom: Math.max(insets.bottom + 28, 48) },
        ]}>
        <ModernPillLoader />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure crisp white canvas
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 440,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: '#0F172A', // Deep midnight navy
    textAlign: 'center',
  },
  brandTitleCompact: {
    fontSize: 25,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#64748B', // Clean slate gray
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  brandTaglineCompact: {
    fontSize: 13.5,
    marginTop: 6,
  },
  bottomLoaderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
});
