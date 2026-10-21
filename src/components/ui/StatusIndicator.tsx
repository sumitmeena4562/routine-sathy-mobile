import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type StatusType = 'online' | 'offline' | 'active' | 'syncing' | 'completed';

export interface StatusIndicatorProps {
  status: StatusType;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function StatusIndicator({
  status,
  size = 8,
  style,
}: StatusIndicatorProps) {
  const theme = useTheme();

  let color: string = theme.colors.primary;
  switch (status) {
    case 'online':
    case 'completed':
      color = theme.colors.success;
      break;
    case 'offline':
      color = theme.colors.disabled;
      break;
    case 'active':
      color = theme.colors.primary;
      break;
    case 'syncing':
      color = theme.colors.warning;
      break;
  }

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'center',
  },
});
