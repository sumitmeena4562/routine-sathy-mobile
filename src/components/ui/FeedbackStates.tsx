import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { Button } from './Button';

// ----------------------------------------------------------------------------
// 1. Loading State
// ----------------------------------------------------------------------------
export interface LoadingStateProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({
  message = 'Loading your routines...',
  style,
}: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.centered, style]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.md },
          ]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

// ----------------------------------------------------------------------------
// 2. Empty State
// ----------------------------------------------------------------------------
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.centered, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.backgroundElement,
            borderRadius: theme.radius.full,
          },
        ]}>
        {icon ?? (
          <Ionicons
            name="sparkles-outline"
            size={36}
            color={theme.colors.primary}
          />
        )}
      </View>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, marginTop: theme.spacing.lg },
        ]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
          ]}>
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: theme.spacing.xl }}
        />
      )}
    </View>
  );
}

// ----------------------------------------------------------------------------
// 3. Error State
// ----------------------------------------------------------------------------
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryTitle = 'Try Again',
  style,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.centered, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.errorMuted,
            borderRadius: theme.radius.full,
          },
        ]}>
        <Ionicons name="alert-circle-outline" size={36} color={theme.colors.error} />
      </View>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, marginTop: theme.spacing.lg },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
        ]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="md"
          style={{ marginTop: theme.spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
