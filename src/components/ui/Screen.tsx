import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withKeyboardAvoidance?: boolean;
  padded?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * Universal Screen Primitive - Routine Sathy Design System
 * Manages safe areas, status bar style, background canvas, and keyboard avoidance.
 */
export function Screen({
  children,
  scrollable = false,
  withKeyboardAvoidance = false,
  padded = true,
  statusBarStyle,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const barStyle = statusBarStyle ?? (theme.isDark ? 'light-content' : 'dark-content');

  const containerPadding: ViewStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: padded ? Math.max(insets.left, theme.spacing.lg) : insets.left,
    paddingRight: padded ? Math.max(insets.right, theme.spacing.lg) : insets.right,
  };

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const inner = withKeyboardAvoidance ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.fill}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background },
        containerPadding,
        style,
      ]}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={theme.colors.background}
        translucent
      />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
