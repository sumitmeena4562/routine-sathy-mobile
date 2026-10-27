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

/**
 * Minimalist Floating Capsule Toast
 * Inspired by Apple Dynamic Island & Linear's high-contrast micro notifications.
 */
export function Toast({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;

    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      ? '#34D399' // Vibrant emerald mint
      : type === 'error'
      ? '#F87171' // Clean soft coral rose
      : '#38BDF8'; // Sky blue

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
        entering={FadeInUp.springify().damping(18).stiffness(160)}
        exiting={FadeOutUp.duration(180)}
        style={[
          styles.capsule,
          {
            backgroundColor: theme.isDark ? '#1E293B' : '#0F172A',
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.10)',
            maxWidth: Math.min(width - 40, 420),
          },
        ]}>
        <Pressable
          onPress={onDismiss}
          style={styles.pressableContent}
          accessibilityRole="alert"
          accessibilityLabel={message}>
          {/* Crisp Micro Icon */}
          <Ionicons name={iconName} size={17} color={iconColor} style={styles.icon} />

          {/* Clean Message */}
          <Text numberOfLines={2} style={styles.messageText}>
            {message}
          </Text>
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
    paddingHorizontal: 20,
  },
  capsule: {
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
    alignSelf: 'center',
  },
  pressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    gap: 8,
  },
  icon: {
    marginTop: 0.5,
  },
  messageText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 18,
    flexShrink: 1,
  },
});
