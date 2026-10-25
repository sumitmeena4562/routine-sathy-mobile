import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  visible,
  message,
  type = 'success',
  duration = 3500,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;

    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss, type]);

  if (!visible) return null;

  const iconName =
    type === 'success'
      ? 'checkmark-circle'
      : type === 'error'
      ? 'alert-circle'
      : 'information-circle';

  const iconColor =
    type === 'success'
      ? theme.colors.success
      : type === 'error'
      ? theme.colors.error
      : theme.colors.info;

  const badgeBg =
    type === 'success'
      ? theme.colors.successMuted
      : type === 'error'
      ? theme.colors.errorMuted
      : theme.colors.infoMuted;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          top: Math.max(insets.top + (Platform.OS === 'android' ? 14 : 10), 20),
        },
      ]}>
      <Animated.View
        entering={FadeInUp.springify().damping(15).stiffness(120)}
        exiting={FadeOutUp.duration(200)}
        style={[
          styles.pill,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSubtle,
            maxWidth: Math.min(width - 32, 440),
            shadowOpacity: theme.isDark ? 0.35 : 0.12,
          },
        ]}>
        <Pressable
          onPress={onDismiss}
          style={styles.pressableRow}
          accessibilityRole="alert"
          accessibilityLabel={message}>
          {/* Icon Badge */}
          <View style={[styles.iconWrapper, { backgroundColor: badgeBg }]}>
            <Ionicons name={iconName} size={18} color={iconColor} />
          </View>

          {/* Message Text */}
          <Text
            numberOfLines={2}
            style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>

          {/* Close Action */}
          <View style={styles.closeButton}>
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  pill: {
    width: '92%',
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
  pressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  closeButton: {
    padding: 4,
  },
});
