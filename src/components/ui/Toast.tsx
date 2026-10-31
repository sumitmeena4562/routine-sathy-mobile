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
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

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
 * Modern Compact Toast Pill
 * - Ultra-clean, slim ~40px stadium pill
 * - Native design system dark forest / light theme harmony
 * - Crisp inline vector indicator with concise copy
 * - Interactive tap-to-dismiss with haptic feedback
 */
export function Toast({
  visible,
  title,
  message,
  type = 'success',
  duration = 2800,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;

    if (Platform.OS !== 'web') {
      if (type === 'error') {
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

  // Resolve status icon and accent color based on toast type
  let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle';
  let accentColor = theme.isDark ? '#34D399' : '#059669';

  if (type === 'error') {
    iconName = 'alert-circle';
    accentColor = theme.isDark ? '#F87171' : '#DC2626';
  } else if (type === 'reminder') {
    iconName = 'time';
    accentColor = theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[600];
  } else if (type === 'info') {
    iconName = 'information-circle';
    accentColor = theme.isDark ? '#60A5FA' : '#2563EB';
  }

  const textColor = theme.isDark
    ? SemanticDarkTokens.color.text.primary
    : theme.colors.text;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          top: Math.max(insets.top + (Platform.OS === 'android' ? 12 : 8), 16),
        },
      ]}>
      <Animated.View
        entering={FadeInUp.springify().damping(22).stiffness(220)}
        exiting={FadeOutUp.duration(150)}
        style={[
          styles.pillContainer,
          {
            backgroundColor: theme.isDark
              ? 'rgba(7, 38, 27, 0.94)'
              : '#FFFFFF',
            borderColor: theme.isDark
              ? 'rgba(207, 227, 214, 0.18)'
              : 'rgba(11, 61, 46, 0.12)',
            maxWidth: Math.min(width - 32, 400),
          },
        ]}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            onDismiss();
          }}
          style={styles.pressableRow}
          accessibilityRole="alert"
          accessibilityLabel={`${title ? `${title}: ` : ''}${message}`}>
          {/* Status Indicator Icon */}
          <Ionicons name={iconName} size={17} color={accentColor} style={styles.icon} />

          {/* Compact Inline Message */}
          <View style={styles.textContainer}>
            <Text numberOfLines={2} style={[styles.messageText, { color: textColor }]}>
              {title ? (
                <Text style={styles.titlePrefix}>{title}: </Text>
              ) : null}
              {message}
            </Text>
          </View>

          {/* Dismiss Icon */}
          <Ionicons
            name="close"
            size={14}
            color={theme.isDark ? 'rgba(255, 255, 255, 0.40)' : 'rgba(11, 61, 46, 0.35)'}
            style={styles.closeIcon}
          />
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
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  pressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  textContainer: {
    flexShrink: 1,
  },
  titlePrefix: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  messageText: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.15,
    lineHeight: 17,
  },
  closeIcon: {
    marginLeft: 2,
    flexShrink: 0,
  },
});
