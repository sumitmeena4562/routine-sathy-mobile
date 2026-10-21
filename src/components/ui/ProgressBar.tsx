import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export interface ProgressBarProps {
  progress: number; // 0.0 to 1.0
  height?: number;
  color?: string;
  gradientColors?: [string, string, ...string[]];
  trackColor?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  height,
  color,
  gradientColors,
  trackColor,
  animated = true,
  style,
}: ProgressBarProps) {
  const theme = useTheme();

  // Clamp progress between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressAnim = useSharedValue(clampedProgress);

  useEffect(() => {
    if (animated) {
      progressAnim.value = withTiming(clampedProgress, {
        duration: theme.animation.durationNormal,
      });
    } else {
      progressAnim.value = clampedProgress;
    }
  }, [clampedProgress, animated, theme.animation.durationNormal, progressAnim]);

  const barHeight = height ?? theme.heights.progressBar;
  const isComplete = clampedProgress >= 1;
  const barTrackColor = trackColor ?? (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(139, 124, 246, 0.12)');

  const effectiveGradients: [string, string, ...string[]] = gradientColors ?? (
    isComplete
      ? [theme.colors.success, '#6EE7B7']
      : [theme.colors.primary, theme.colors.secondaryForeground]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height: barHeight,
          backgroundColor: barTrackColor,
          borderRadius: theme.radius.full,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.fill,
          animatedStyle,
          {
            height: barHeight,
            borderRadius: theme.radius.full,
            overflow: 'hidden',
          },
          color ? { backgroundColor: color } : undefined,
        ]}>
        {!color && (
          <LinearGradient
            colors={effectiveGradients}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
