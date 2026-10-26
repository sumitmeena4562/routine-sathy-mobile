import React, { useCallback, useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordOtpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { email } = useLocalSearchParams<{ email?: string }>();

  // Responsive device breakpoints
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 420;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 24;
  const emblemSize = isCompact ? 44 : isTablet ? 56 : 50;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(45);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const triggerHaptic = useCallback((type: 'light' | 'warning' | 'success') => {
    if (Platform.OS !== 'web') {
      if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, []);

  const validate = () => {
    const nextErrors: typeof errors = {};

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      nextErrors.otp = 'Please enter the 6-digit code';
    } else if (!/^\d{6}$/.test(cleanOtp)) {
      nextErrors.otp = 'Code must be exactly 6 digits';
    }

    if (!password) {
      nextErrors.password = 'New password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleResetPassword = async () => {
    triggerHaptic('light');

    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    if (!email) {
      setToast({
        visible: true,
        type: 'error',
        message: 'Email address missing. Please request a new code.',
      });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const response = await authService.resetPasswordWithOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });

      triggerHaptic('success');
      setToast({
        visible: true,
        type: 'success',
        message: response.message || 'Password reset successfully! Please log in.',
      });

      // Redirect smoothly to login
      setTimeout(() => {
        router.replace('/login');
      }, 1600);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setToast({
        visible: true,
        type: 'error',
        message: msg,
      });
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending || !email) return;

    triggerHaptic('light');
    setResending(true);
    setToast(null);

    try {
      await authService.sendPasswordResetOtp(email.trim().toLowerCase());
      setCountdown(45);
      setToast({
        visible: true,
        type: 'success',
        message: 'A fresh 6-digit code has been sent to your email.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not resend code. Please try again.';
      setToast({
        visible: true,
        type: 'error',
        message: msg,
      });
      triggerHaptic('warning');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Floating Animated Toast */}
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
            onPress={() => router.replace('/forgot-password')}
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
          {/* Symmetrical Brand Header */}
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
              Verify &amp; Reset
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
                isCompact && styles.subtitleCompact,
              ]}>
              Enter the 6-digit code sent to{' '}
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>
                {email || 'your email'}
              </Text>
              .
            </Text>
          </View>

          {/* Form Fields */}
          <View style={[styles.formContainer, { gap: isCompact ? 12 : 16 }]}>
            <TextField
              label="6-Digit Verification Code"
              placeholder="123456"
              value={otp}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(cleaned);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
              errorMessage={errors.otp}
              inputStyle={styles.otpInputText}
              leftIcon={
                <Ionicons
                  name="keypad-outline"
                  size={19}
                  color={errors.otp ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />

            <TextField
              label="New Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              isPassword
              autoCapitalize="none"
              helperText="Must contain at least 8 characters"
              errorMessage={errors.password}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={errors.password ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />

            <TextField
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              isPassword
              autoCapitalize="none"
              errorMessage={errors.confirmPassword}
              leftIcon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={errors.confirmPassword ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />
          </View>

          {/* Resend OTP Row */}
          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
              Didn&apos;t get the code?{' '}
            </Text>
            {countdown > 0 ? (
              <Text style={[styles.countdownText, { color: theme.colors.textMuted }]}>
                Resend in {countdown}s
              </Text>
            ) : (
              <Pressable
                onPress={handleResendOtp}
                disabled={resending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Resend code">
                <Text style={[styles.resendLink, { color: theme.colors.secondary }]}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Submit CTA */}
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            variant="primary"
            size={isCompact ? 'md' : 'lg'}
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Back to Login */}
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
    marginBottom: 24,
  },
  headerContainerCompact: {
    marginBottom: 16,
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
  },
  otpInputText: {
    letterSpacing: 4,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  resendText: {
    fontSize: 13.5,
  },
  countdownText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
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
