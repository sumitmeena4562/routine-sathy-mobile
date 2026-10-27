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

export type CardVariant = 'surface' | 'elevated' | 'outline' | 'muted';

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
  let borderColor: string = 'transparent';
  let borderWidth: number = 0;

  switch (variant) {
    case 'surface':
      backgroundColor = theme.colors.surface;
      break;
    case 'elevated':
      backgroundColor = theme.colors.surfaceElevated;
      break;
    case 'outline':
      backgroundColor = theme.colors.surface;
      borderColor = theme.colors.borderSubtle;
      borderWidth = theme.borderWidth.thin;
      break;
    case 'muted':
      backgroundColor = theme.colors.backgroundElement;
      break;
  }

  const shadowStyle = shadow !== 'none' && variant !== 'muted' ? theme.shadows[shadow] : undefined;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderRadius: cardRadius,
          padding: cardPadding,
          borderColor,
          borderWidth,
        },
        shadowStyle,
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
