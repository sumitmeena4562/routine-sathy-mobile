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

export type ToastType = 'success' | 'error' | 'info' | 'reminder';

export interface ToastProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

/**
 * Clean iOS/macOS Notification Pill Toast
 * Styled with soft tinted concentric circular badge, two-line bold title + subtitle typography,
 * pure white stadium pill container, and diffuse ambient drop shadow.
 */
export function Toast({
  visible,
  title,
  message,
  type = 'success',
  duration = 3200,
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

  // Resolve visual configuration based on toast type
  let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';
  let badgeBg = '#F5EEFD';       // Soft lavender (Build Complete style)
  let badgeBorder = '#E9D5FF';
  let iconColor = '#9333EA';     // Vibrant purple
  let defaultTitle = 'Success';

  if (type === 'error') {
    iconName = 'alert-circle-outline';
    badgeBg = '#FEF2F2';         // Soft rose
    badgeBorder = '#FECACA';
    iconColor = '#E11D48';       // Crimson rose
    defaultTitle = 'Notice';
  } else if (type === 'reminder') {
    iconName = 'time-outline';
    badgeBg = '#FFF4EB';         // Soft peach amber
    badgeBorder = '#FED7AA';
    iconColor = '#EA580C';       // Sunrise amber orange
    defaultTitle = 'Reminder';
  } else if (type === 'info') {
    iconName = 'chatbubble-ellipses-outline';
    badgeBg = '#EBF5FF';         // Soft sky blue
    badgeBorder = '#BFDBFE';
    iconColor = '#2563EB';       // Vibrant royal blue
    defaultTitle = 'Notice';
  } else {
    // Success: Soft emerald mint or lilac
    iconName = 'checkmark-circle-outline';
    badgeBg = '#ECFDF5';
    badgeBorder = '#A7F3D0';
    iconColor = '#059669';
    defaultTitle = 'Success';
  }

  const displayTitle = title || defaultTitle;

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
        entering={FadeInUp.springify().damping(17).stiffness(150)}
        exiting={FadeOutUp.duration(180)}
        style={[
          styles.pillContainer,
          {
            backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
            maxWidth: Math.min(width - 32, 440),
          },
        ]}>
        <Pressable
          onPress={onDismiss}
          style={styles.pressableRow}
          accessibilityRole="alert"
          accessibilityLabel={`${displayTitle}: ${message}`}>
          {/* Left Circular Tinted Badge */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : badgeBg,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : badgeBorder,
              },
            ]}>
            <Ionicons name={iconName} size={21} color={iconColor} />
          </View>

          {/* Two-Line Typography Hierarchy */}
          <View style={styles.textColumn}>
            <Text
              numberOfLines={1}
              style={[
                styles.titleText,
                { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              {displayTitle}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.messageText,
                { color: theme.isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {message}
            </Text>
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
    paddingHorizontal: 16,
  },
  pillContainer: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 8,
  },
  pressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    lineHeight: 18,
    marginTop: 1,
  },
});
