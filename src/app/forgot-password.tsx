import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  AmbientAtmosphere,
  Button,
  RoutineSathyEmblem,
  TextField,
  Toast,
} from '@/components/ui';
import { authService } from '@/services/auth';
import { useTheme } from '@/hooks/use-theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive breakpoints — same pattern as login/signup
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 420;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 24;
  const emblemSize = isCompact ? 44 : isTablet ? 56 : 50;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const triggerHaptic = useCallback((type: 'light' | 'warning') => {
    if (Platform.OS !== 'web') {
      if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, []);

  const validate = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSendLink = async () => {
    triggerHaptic('light');

    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await authService.forgotPassword(email.trim().toLowerCase());

      // Server always returns 200 (doesn't reveal if email exists).
      // Navigate to confirmation screen on success.
      router.replace({
        pathname: '/check-email',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setToast({ visible: true, type: 'error', message: msg });
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Floating Toast */}
      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.topBarInner, { maxWidth: containerMaxWidth }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.colors.backgroundElement,
                borderColor: theme.colors.borderSubtle,
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: containerMaxWidth,
              paddingBottom: Math.max(insets.bottom + 24, 36),
              paddingLeft: insets.left + horizontalPadding,
              paddingRight: insets.right + horizontalPadding,
            },
          ]}>

          {/* Brand Header */}
          <View style={[styles.headerContainer, isCompact && styles.headerContainerCompact]}>
            <View style={styles.emblemWrapper}>
              <RoutineSathyEmblem size={emblemSize} />
            </View>

            <Text
              style={[
                styles.title,
                { color: theme.colors.text },
                isCompact && styles.titleCompact,
                isTablet && styles.titleTablet,
              ]}>
              Forgot Password?
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
                isCompact && styles.subtitleCompact,
              ]}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Email Field */}
          <View style={styles.formContainer}>
            <TextField
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={handleSendLink}
              errorMessage={emailError}
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={emailError ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />
          </View>

          {/* CTA Button */}
          <Button
            title="Send Reset Link"
            onPress={handleSendLink}
            loading={loading}
            variant="primary"
            size={isCompact ? 'md' : 'lg'}
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Back to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <Pressable
              onPress={() => router.replace('/login')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go to Login">
              <Text style={[styles.footerLink, { color: theme.colors.text }]}>
                Log In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    zIndex: 10,
    height: 48,
    justifyContent: 'center',
  },
  topBarInner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerContainerCompact: {
    marginBottom: 20,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 23,
    lineHeight: 29,
  },
  titleTablet: {
    fontSize: 31,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    letterSpacing: -0.1,
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  formContainer: {
    width: '100%',
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
