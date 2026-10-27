import React from 'react';
import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  let backgroundColor: string;
  if (theme.isDark && darkColor) {
    backgroundColor = darkColor;
  } else if (!theme.isDark && lightColor) {
    backgroundColor = lightColor;
  } else {
    backgroundColor = theme.colors[type];
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
