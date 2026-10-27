import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
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
  trackColor?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  height,
  color,
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
  const barTrackColor =
    trackColor ??
    (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.borderSubtle);

  const fillColor = color ?? theme.colors.primary;

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
            backgroundColor: fillColor,
          },
        ]}
      />
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
