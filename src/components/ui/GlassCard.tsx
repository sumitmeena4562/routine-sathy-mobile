import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export interface GlassCardProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  intensity?: number;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function GlassCard({
  children,
  padding,
  radius,
  intensity,
  onPress,
  style,
  accessibilityLabel,
}: GlassCardProps) {
  const theme = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPress(e);
    }
  };

  const cardPadding = padding ?? theme.spacing.lg;
  const cardRadius = radius ?? theme.radius.xl;
  const blurIntensity = intensity ?? theme.glass.intensity;

  const content = (
    <View
      style={[
        styles.outerContainer,
        {
          borderRadius: cardRadius,
          borderColor: theme.colors.glassBorder,
          borderWidth: theme.borderWidth.thin,
          backgroundColor: theme.colors.glassSurface,
          ...(Platform.OS === 'web'
            ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any)
            : {}),
        },
        theme.shadows.sm,
        style,
      ]}>
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={blurIntensity}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={{ padding: cardPadding }}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
});
