import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  AmbientAtmosphere,
  Button,
  RoutineSathyEmblem,
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

/**
 * Official 4-Color Google 'G' vector logo.
 */
function GoogleLogoIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Multi-device responsive metrics
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 420;
  const horizontalPadding = isTablet ? 32 : isCompact ? 20 : 24;
  const emblemSize = isCompact ? 64 : isTablet ? 84 : 76;
  const buttonHeight = isCompact ? 50 : 54;

  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const triggerHaptic = useCallback((type: 'light' | 'success') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, []);

  const handleGoogleSignIn = () => {
    triggerHaptic('light');
    setSocialLoading('google');
    setTimeout(() => {
      setSocialLoading(null);
      triggerHaptic('success');
      // For future live Google OAuth token flow
    }, 1200);
  };

  const handleAppleSignIn = () => {
    triggerHaptic('light');
    setSocialLoading('apple');
    setTimeout(() => {
      setSocialLoading(null);
      triggerHaptic('success');
      // For future live Apple OAuth token flow
    }, 1200);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top + (isCompact ? 16 : 28), 36),
            paddingBottom: Math.max(insets.bottom + 16, 28),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.contentWrapper, { maxWidth: containerMaxWidth }]}>
          {/* 1. Hero Brand Identity Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.emblemContainer,
                {
                  width: emblemSize + 28,
                  height: emblemSize + 28,
                  borderRadius: (emblemSize + 28) / 2,
                  backgroundColor: theme.isDark
                    ? 'rgba(248, 250, 252, 0.05)'
                    : '#FFF7ED',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#FED7AA',
                },
              ]}>
              <RoutineSathyEmblem size={emblemSize} />
            </View>

            <Text
              style={[
                styles.brandTitle,
                { color: theme.colors.text },
                isCompact && styles.brandTitleCompact,
                isTablet && styles.brandTitleTablet,
              ]}>
              Routine Sathy
            </Text>

            <Text
              style={[
                styles.brandTagline,
                { color: theme.colors.textSecondary },
                isCompact && styles.brandTaglineCompact,
              ]}>
              Your Mindful Daily Rhythm
            </Text>

            <Text
              style={[
                styles.heroDescription,
                { color: theme.colors.textSecondary },
                isCompact && styles.heroDescriptionCompact,
              ]}>
              Align your mornings, deep work flow, and evening recovery with natural biological rhythm.
            </Text>
          </View>

          {/* 2. Authentication Actions Gateway */}
          <View style={styles.actionsSection}>
            {/* Continue with Google */}
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={socialLoading !== null}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={({ pressed }) => [
                styles.socialButton,
                {
                  height: buttonHeight,
                  borderRadius: buttonHeight / 2,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                pressed && styles.buttonPressed,
              ]}>
              <GoogleLogoIcon size={20} />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
              </Text>
            </Pressable>

            {/* Continue with Apple (Supported on iOS / Mac) */}
            {Platform.OS === 'ios' && (
              <Pressable
                onPress={handleAppleSignIn}
                disabled={socialLoading !== null}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.appleButton,
                  {
                    height: buttonHeight,
                    borderRadius: buttonHeight / 2,
                    backgroundColor: theme.isDark ? '#FFFFFF' : '#000000',
                    borderColor: 'transparent',
                  },
                  pressed && styles.buttonPressed,
                ]}>
                <Ionicons
                  name="logo-apple"
                  size={21}
                  color={theme.isDark ? '#000000' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.socialButtonText,
                    { color: theme.isDark ? '#000000' : '#FFFFFF' },
                  ]}>
                  {socialLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
                </Text>
              </Pressable>
            )}

            {/* Subtle Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.borderSubtle },
                ]}
              />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>
                or
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.borderSubtle },
                ]}
              />
            </View>

            {/* Sign up with Email */}
            <Button
              title="Sign up with Email"
              variant="primary"
              size={isCompact ? 'md' : 'lg'}
              pill
              fullWidth
              icon={<Ionicons name="mail-outline" size={19} color="#FFFFFF" />}
              onPress={() => router.push('/signup')}
              style={[styles.emailButton, { height: buttonHeight }]}
            />

            {/* Existing User Login Link */}
            <View style={styles.loginRow}>
              <Text style={[styles.loginPrompt, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Pressable
                onPress={() => router.push('/login')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Log In">
                <Text style={[styles.loginLink, { color: theme.colors.text }]}>
                  Log In
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 3. Legal Footer */}
          <Text style={[styles.legalText, { color: theme.colors.textMuted }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.legalLink, { color: theme.colors.textSecondary }]}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.legalLink, { color: theme.colors.textSecondary }]}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginBottom: 28,
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  brandTitleCompact: {
    fontSize: 25,
    letterSpacing: -0.5,
  },
  brandTitleTablet: {
    fontSize: 34,
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  brandTaglineCompact: {
    fontSize: 13.5,
    marginTop: 4,
  },
  heroDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
    letterSpacing: -0.1,
  },
  heroDescriptionCompact: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 290,
  },
  actionsSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  appleButton: {
    shadowOpacity: 0.1,
  },
  socialButtonText: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  emailButton: {
    width: '100%',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginPrompt: {
    fontSize: 14.5,
  },
  loginLink: {
    fontSize: 14.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    maxWidth: 340,
  },
  legalLink: {
    fontWeight: '600',
  },
});
