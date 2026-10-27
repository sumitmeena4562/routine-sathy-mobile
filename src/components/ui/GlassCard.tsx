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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export type GlassCardVariant = 'default' | 'heavy' | 'subtle';

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  padding?: number;
  radius?: number;
  intensity?: number;
  specularHighlight?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  padding,
  radius,
  intensity,
  specularHighlight = true,
  onPress,
  style,
  contentStyle,
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

  let backgroundColor = theme.colors.glassSurface;
  if (variant === 'heavy') {
    backgroundColor = theme.colors.glassSurfaceHeavy;
  } else if (variant === 'subtle') {
    backgroundColor = theme.colors.glassSurfaceSubtle;
  }

  const cardStyles: ViewStyle = {
    borderRadius: cardRadius,
    borderColor: theme.colors.glassBorder,
    borderWidth: theme.borderWidth.thin,
    backgroundColor,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {}),
  };

  const innerContent = (
    <>
      {/* 1. Native Blur Layer */}
      {Platform.OS !== 'web' && (
        <BlurView
          intensity={blurIntensity}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* 2. Specular Top Rim Highlight Line (Simulates Light Reflection on Glass edge) */}
      {specularHighlight && (
        <LinearGradient
          colors={[
            theme.isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.90)',
            theme.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.15)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.specularRim}
        />
      )}

      {/* 3. Card Content */}
      <View style={[{ padding: cardPadding }, contentStyle]}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.outerContainer,
          cardStyles,
          theme.shadows.glass,
          style,
          { opacity: pressed ? 0.92 : 1 },
        ]}>
        {innerContent}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.outerContainer,
        cardStyles,
        theme.shadows.glass,
        style,
      ]}>
      {innerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 1,
  },
});
