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
import { LinearGradient } from 'expo-linear-gradient';
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

  const isPrimary = variant === 'primary' && !disabled;

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
          backgroundColor: isPrimary ? 'transparent' : backgroundColor,
          borderColor,
          borderWidth,
          width: fullWidth ? '100%' : 'auto',
          opacity: pressed ? 0.90 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          overflow: 'hidden',
          ...(variant === 'glass' && Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              } as any)
            : {}),
        },
        isPrimary
          ? {
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.28,
              shadowRadius: 14,
              elevation: 4,
            }
          : undefined,
        style,
      ]}>
      {/* Primary Gradient Fill */}
      {isPrimary && (
        <LinearGradient
          colors={
            theme.isDark
              ? ['#9D8FFA', '#7C3AED', '#6D28D9']
              : ['#8B7CF6', '#7C3AED', '#6D28D9']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Top Specular Rim Light for Glass Variant */}
      {variant === 'glass' && !disabled && (
        <LinearGradient
          colors={[
            theme.isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.85)',
            theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.1)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.specularRim}
        />
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.leftIcon}>{icon}</View>
          )}
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
          {icon && iconPosition === 'right' && (
            <View style={styles.rightIcon}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 1,
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  spinner: {
    zIndex: 2,
  },
});
