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
import { useTheme } from '@/hooks/use-theme';
import { triggerHaptic } from '@/utils/haptics';
import { PrimitiveTokens } from '@/theme/tokens.generated';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'dark'
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
  pill?: boolean;
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
  pill = true,
  haptic = true,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (haptic) {
      triggerHaptic('light');
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
      : theme.spacing.xl;

  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 16.5 : 15;
  const borderRadius = pill ? theme.radius.full : theme.radius.xl;

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
    case 'dark':
      backgroundColor = theme.colors.brand;
      textColor = theme.colors.brandForeground;
      break;
    case 'secondary':
      backgroundColor = theme.colors.backgroundElement;
      textColor = theme.colors.text;
      borderColor = theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = theme.colors.text;
      borderColor = theme.colors.border;
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
          backgroundColor,
          borderColor,
          borderWidth,
          width: fullWidth ? '100%' : 'auto',
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
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
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.isDark ? 0.3 : 0.12,
              shadowRadius: 10,
              elevation: 3,
            }
          : undefined,
        style,
      ]}>
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
    minHeight: 48,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontWeight: '700',
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
