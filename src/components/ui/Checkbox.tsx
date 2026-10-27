import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export interface CheckboxProps {
  checked: boolean;
  onToggle: (nextChecked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  disabled = false,
  size = 'md',
  color,
  style,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onToggle(!checked);
  };

  const boxSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const borderRadius = size === 'sm' ? 5 : 7;
  const activeColor = color ?? theme.colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.container, style]}>
      <View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            borderRadius,
            backgroundColor: checked
              ? activeColor
              : disabled
              ? theme.colors.disabledBackground
              : 'transparent',
            borderColor: checked
              ? activeColor
              : disabled
              ? theme.colors.disabled
              : theme.colors.border,
            borderWidth: theme.borderWidth.medium,
          },
        ]}>
        {checked && <Ionicons name="checkmark" size={iconSize} color={theme.colors.primaryForeground} />}
      </View>

      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? theme.colors.disabled : theme.colors.text,
              marginLeft: theme.spacing.sm,
              fontSize: size === 'sm' ? 13 : 15,
            },
          ]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
});
