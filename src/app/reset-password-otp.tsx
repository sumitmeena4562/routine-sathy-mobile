import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '@/utils/haptics';

import {
  AuthScreenLayout,
  Button,
  TextField,
} from '@/components/ui';
import { authService } from '@/services/auth';
import {
  ComponentTokens,
  PrimitiveTokens,
} from '@/theme/tokens.generated';

export default function ResetPasswordOtpScreen() {
  const router = useRouter();
  const { email, devOtp } = useLocalSearchParams<{ email?: string; devOtp?: string }>();

  const [otp, setOtp] = useState(devOtp || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(
    devOtp
      ? {
          visible: true,
          type: 'info',
          message: `Dev Mode OTP: ${devOtp}`,
        }
      : null
  );

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
      const res = await authService.sendPasswordResetOtp(email.trim().toLowerCase());
      setCountdown(45);
      if (res.otp) {
        setOtp(res.otp);
      }
      setToast({
        visible: true,
        type: 'success',
        message: res.otp
          ? `Code resent! (Dev OTP: ${res.otp})`
          : 'A fresh 6-digit code has been sent to your email.',
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
    <AuthScreenLayout
      title="Verify & Reset"
      subtitle={`Enter the 6-digit code sent to ${email || 'your email'}.`}
      fallbackRoute="/forgot-password"
      toast={
        toast
          ? {
              visible: toast.visible,
              type: toast.type,
              message: toast.message,
              onDismiss: () => setToast(null),
            }
          : null
      }
      footer={
        <View style={styles.footerContainer}>
          {/* Submit CTA */}
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            variant="primary"
            size="md"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Back to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
            </Text>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                router.replace('/login');
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go to Login">
              <Text style={styles.footerLink}>
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      {/* Form Fields */}
      <View style={styles.formContainer}>
        <TextField
          label="6-Digit Verification Code"
          placeholder="123456"
          value={otp}
          tone="dark"
          disabled={loading || resending}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
            setOtp(cleaned);
            if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
          }}
          keyboardType="number-pad"
          maxLength={6}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
          errorMessage={errors.otp}
          inputStyle={styles.otpInputText}
          leftIcon={
            <Ionicons
              name="keypad-outline"
              size={19}
              color={errors.otp ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        <TextField
          ref={newPasswordRef}
          label="New Password"
          placeholder="At least 8 characters"
          value={password}
          tone="dark"
          disabled={loading || resending}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          helperText="Must contain at least 8 characters"
          errorMessage={errors.password}
          leftIcon={
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={errors.password ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        <TextField
          ref={confirmPasswordRef}
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          tone="dark"
          disabled={loading || resending}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={handleResetPassword}
          errorMessage={errors.confirmPassword}
          leftIcon={
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={errors.confirmPassword ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        {/* Resend OTP Row */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>
            Didn&apos;t get the code?{' '}
          </Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          ) : (
            <Pressable
              onPress={handleResendOtp}
              disabled={resending}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Resend code">
              <Text style={styles.resendLink}>
                {resending ? 'Sending...' : 'Resend Code'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    gap: 12,
  },
  otpInputText: {
    letterSpacing: 4,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  resendText: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: 13,
    color: 'rgba(207, 227, 214, 0.70)',
  },
  countdownText: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(207, 227, 214, 0.45)',
  },
  resendLink: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: 13,
    fontWeight: '700',
    color: PrimitiveTokens.color.amber[400],
    textDecorationLine: 'underline',
  },
  footerContainer: {
    width: '100%',
  },
  submitButton: {
    height: ComponentTokens.button.heightMd,
    borderRadius: ComponentTokens.button.heightMd / 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: 14,
    color: 'rgba(207, 227, 214, 0.70)',
  },
  footerLink: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: 14,
    fontWeight: '700',
    color: PrimitiveTokens.color.amber[400],
    textDecorationLine: 'underline',
  },
});
