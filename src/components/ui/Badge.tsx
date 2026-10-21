import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  outline = false,
  style,
  textStyle,
}: BadgeProps) {
  const theme = useTheme();

  let backgroundColor: string = theme.colors.primaryMuted;
  let textColor: string = theme.colors.primary;
  let borderColor: string = 'transparent';

  switch (variant) {
    case 'primary':
      backgroundColor = outline ? 'transparent' : theme.colors.primaryMuted;
      textColor = theme.colors.primary;
      borderColor = theme.colors.primaryBorder;
      break;
    case 'secondary':
      backgroundColor = outline ? 'transparent' : theme.colors.secondaryMuted;
      textColor = theme.colors.secondaryForeground;
      borderColor = theme.colors.secondary;
      break;
    case 'success':
      backgroundColor = outline ? 'transparent' : theme.colors.successMuted;
      textColor = theme.colors.success;
      borderColor = theme.colors.successBorder;
      break;
    case 'warning':
      backgroundColor = outline ? 'transparent' : theme.colors.warningMuted;
      textColor = theme.colors.warning;
      borderColor = theme.colors.warning;
      break;
    case 'error':
      backgroundColor = outline ? 'transparent' : theme.colors.errorMuted;
      textColor = theme.colors.error;
      borderColor = theme.colors.error;
      break;
    case 'neutral':
      backgroundColor = outline ? 'transparent' : theme.colors.backgroundElement;
      textColor = theme.colors.textSecondary;
      borderColor = theme.colors.border;
      break;
  }

  const height = size === 'sm' ? 22 : 28;
  const paddingHorizontal = size === 'sm' ? theme.spacing.sm : theme.spacing.md;
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View
      style={[
        styles.badge,
        {
          height,
          paddingHorizontal,
          backgroundColor,
          borderColor,
          borderWidth: outline ? theme.borderWidth.thin : 0,
          borderRadius: theme.radius.full,
        },
        style,
      ]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
          },
          textStyle,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});
