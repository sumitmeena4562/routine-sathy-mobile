import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'glass'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  // Dimensions based on size token
  const height =
    size === 'sm'
      ? theme.heights.buttonSm
      : size === 'lg'
      ? theme.heights.buttonLg
      : theme.heights.buttonMd;

  const paddingHorizontal =
    size === 'sm'
      ? theme.spacing.md
      : size === 'lg'
      ? theme.spacing['2xl']
      : theme.spacing.lg;

  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 17 : 15;
  const borderRadius = size === 'sm' ? theme.radius.md : theme.radius.lg;

  // Variant styling
  let backgroundColor: string = theme.colors.primary;
  let textColor: string = theme.colors.primaryForeground;
  let borderColor: string = 'transparent';
  let borderWidth: number = 0;

  switch (variant) {
    case 'primary':
      backgroundColor = theme.colors.primary;
      textColor = theme.colors.primaryForeground;
      break;
    case 'secondary':
      backgroundColor = theme.colors.secondaryMuted;
      textColor = theme.colors.primary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = theme.colors.primary;
      borderColor = theme.colors.primaryBorder;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'glass':
      backgroundColor = theme.colors.glassSurface;
      textColor = theme.colors.text;
      borderColor = theme.colors.glassBorder;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.colors.text;
      break;
    case 'danger':
      backgroundColor = theme.colors.error;
      textColor = theme.colors.errorForeground;
      break;
    case 'success':
      backgroundColor = theme.colors.success;
      textColor = theme.colors.successForeground;
      break;
  }

  if (disabled) {
    backgroundColor = theme.colors.disabledBackground;
    textColor = theme.colors.disabled;
    borderColor = 'transparent';
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          paddingHorizontal,
          borderRadius,
          backgroundColor,
          borderColor,
          borderWidth,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.8 : 1,
        },
        variant === 'primary' && !disabled ? theme.shadows.sm : undefined,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize,
              },
              textStyle,
            ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
