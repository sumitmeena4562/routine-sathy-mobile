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
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'surface' | 'elevated' | 'outline' | 'muted' | 'mint' | 'dark';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  radius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = 'surface',
  padding,
  radius,
  shadow = 'sm',
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
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

  let backgroundColor: string = theme.colors.surface;
  let borderColor: string = theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border;
  let borderWidth: number = theme.borderWidth.thin;

  switch (variant) {
    case 'surface':
      backgroundColor = theme.colors.surface;
      borderColor = theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'elevated':
      backgroundColor = theme.colors.surfaceElevated;
      borderColor = theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'outline':
      backgroundColor = theme.colors.surface;
      borderColor = theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'muted':
      backgroundColor = theme.colors.backgroundElement;
      borderColor = 'transparent';
      borderWidth = 0;
      break;
    case 'mint':
      backgroundColor = theme.isDark ? 'rgba(30, 158, 90, 0.18)' : '#E3F3E9';
      borderColor = theme.isDark ? 'rgba(91, 219, 139, 0.25)' : theme.colors.border;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'dark':
      backgroundColor = theme.isDark ? '#07261B' : '#0B3D2E';
      borderColor = 'rgba(207, 227, 214, 0.15)';
      borderWidth = theme.borderWidth.thin;
      break;
  }

  const shadowStyle = shadow !== 'none' && variant !== 'muted' ? theme.shadows[shadow] : undefined;

  const cardStyles: ViewStyle = {
    backgroundColor,
    borderRadius: cardRadius,
    padding: cardPadding,
    borderColor,
    borderWidth,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.card,
          cardStyles,
          shadowStyle,
          style,
          { opacity: pressed ? 0.9 : 1 },
        ]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, cardStyles, shadowStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
