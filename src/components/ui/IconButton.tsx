import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export type IconButtonVariant = 'filled' | 'tinted' | 'outline' | 'ghost' | 'glass';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonShape = 'circle' | 'squircle';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  disabled?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  variant = 'tinted',
  size = 'md',
  shape = 'circle',
  disabled = false,
  haptic = true,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const theme = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  const dimension = size === 'sm' ? 34 : size === 'lg' ? 50 : 42;
  const borderRadius =
    shape === 'circle'
      ? theme.radius.full
      : size === 'sm'
      ? theme.radius.sm
      : theme.radius.md;

  let backgroundColor: string = theme.colors.backgroundElement;
  let borderColor: string = 'transparent';
  let borderWidth: number = 0;

  switch (variant) {
    case 'filled':
      backgroundColor = theme.colors.primary;
      break;
    case 'tinted':
      backgroundColor = theme.colors.primaryMuted;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      borderColor = theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'glass':
      backgroundColor = theme.colors.glassSurface;
      borderColor = theme.colors.glassBorder;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      break;
  }

  if (disabled) {
    backgroundColor = theme.colors.disabledBackground;
    borderColor = 'transparent';
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: pressed ? 0.75 : disabled ? 0.4 : 1,
        },
        variant === 'glass' ? theme.shadows.sm : undefined,
        style,
      ]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
