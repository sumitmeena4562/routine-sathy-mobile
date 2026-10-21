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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export interface HabitCheckControlProps {
  completed: boolean;
  onToggle: (completed: boolean) => void;
  size?: number;
  streakCount?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function HabitCheckControl({
  completed,
  onToggle,
  size = 48,
  streakCount,
  style,
  accessibilityLabel = 'Habit completion control',
}: HabitCheckControlProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Spring pop micro-interaction
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );

    if (Platform.OS !== 'web') {
      if (!completed) {
        // Successful habit completion haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }

    onToggle(!completed);
  };

  const iconSize = Math.round(size * 0.52);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: completed }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: theme.radius.full,
            backgroundColor: completed ? theme.colors.success : theme.colors.backgroundElement,
            borderColor: completed ? theme.colors.successBorder : theme.colors.border,
            borderWidth: theme.borderWidth.thin,
          },
          completed ? theme.shadows.sm : undefined,
        ]}>
        {completed ? (
          <Ionicons name="checkmark-sharp" size={iconSize} color={theme.colors.successForeground} />
        ) : (
          <Ionicons
            name="checkmark"
            size={iconSize}
            color={theme.colors.textMuted}
            style={{ opacity: 0.5 }}
          />
        )}
      </Animated.View>

      {streakCount !== undefined && streakCount > 0 && (
        <View
          style={[
            styles.streakBadge,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.borderSubtle,
              borderWidth: theme.borderWidth.hairline,
            },
            theme.shadows.sm,
          ]}>
          <Ionicons name="flame" size={10} color={theme.colors.warning} />
          <Text style={[styles.streakText, { color: theme.colors.text }]}>{streakCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
