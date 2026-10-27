import React, { useCallback } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AmbientAtmosphere, Button } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export default function CheckEmailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { email } = useLocalSearchParams<{ email: string }>();

  // Responsive breakpoints
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 420;
  const horizontalPadding = isTablet ? 32 : isCompact ? 20 : 24;

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const handleOpenEmailApp = useCallback(() => {
    triggerHaptic();
    Linking.openURL('mailto:').catch(() => {
      // If no email client configured, do nothing gracefully
    });
  }, [triggerHaptic]);

  const handleBackToLogin = useCallback(() => {
    triggerHaptic();
    router.replace('/login');
  }, [triggerHaptic, router]);

  // Safely display the email — fallback if param is missing
  const displayEmail = email || 'your email address';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top + (isCompact ? 24 : 40), 56),
            paddingBottom: Math.max(insets.bottom + 24, 36),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.contentWrapper, { maxWidth: containerMaxWidth }]}>

          {/* Mail Icon Container */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(248, 250, 252, 0.06)'
                  : theme.colors.backgroundElement,
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : theme.colors.borderSubtle,
              },
            ]}>
            <Ionicons
              name="mail-open-outline"
              size={isCompact ? 52 : 60}
              color={theme.colors.secondary}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textBlock}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.text },
                isCompact && styles.titleCompact,
                isTablet && styles.titleTablet,
              ]}>
              Check your Inbox
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
                isCompact && styles.subtitleCompact,
              ]}>
              We sent a password reset link to
            </Text>

            {/* Email highlighted */}
            <Text
              style={[styles.emailText, { color: theme.colors.text }]}
              numberOfLines={1}
              ellipsizeMode="middle">
              {displayEmail}
            </Text>

            {/* Expiry note */}
            <View
              style={[
                styles.expiryBadge,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(245, 158, 11, 0.10)',
                  borderColor: theme.isDark
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(245, 158, 11, 0.20)',
                },
              ]}>
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.warning}
                style={styles.expiryIcon}
              />
              <Text style={[styles.expiryText, { color: theme.colors.warning }]}>
                Link expires in 10 minutes
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.actionsBlock}>
            <Button
              title="Open Email App"
              onPress={handleOpenEmailApp}
              variant="primary"
              size={isCompact ? 'md' : 'lg'}
              pill
              fullWidth
              icon={<Ionicons name="open-outline" size={18} color="#FFFFFF" />}
              iconPosition="right"
            />

            <Pressable
              onPress={handleBackToLogin}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back to Login"
              style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
              <Ionicons
                name="arrow-back"
                size={15}
                color={theme.colors.textSecondary}
                style={styles.backLinkIcon}
              />
              <Text style={[styles.backLinkText, { color: theme.colors.textSecondary }]}>
                Back to Login
              </Text>
            </Pressable>
          </View>

          {/* Helper note */}
          <Text style={[styles.helperNote, { color: theme.colors.textMuted }]}>
            Didn&apos;t receive the email? Check your spam folder, or{' '}
            <Text
              style={[styles.helperLink, { color: theme.colors.text }]}
              onPress={() => router.replace('/forgot-password')}
              accessibilityRole="button">
              try again
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 112,
    height: 112,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  textBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 10,
  },
  titleCompact: {
    fontSize: 23,
    lineHeight: 29,
    marginBottom: 8,
  },
  titleTablet: {
    fontSize: 31,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    maxWidth: 300,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  expiryIcon: {
    marginRight: 5,
  },
  expiryText: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  actionsBlock: {
    width: '100%',
    gap: 14,
    alignItems: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backLinkPressed: {
    opacity: 0.6,
  },
  backLinkIcon: {
    marginRight: 5,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperNote: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 28,
    maxWidth: 290,
  },
  helperLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
