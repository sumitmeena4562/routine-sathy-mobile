import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  AuthScreenLayout,
  Button,
  TextField,
} from '@/components/ui';
import { authService } from '@/services/auth';
import {
  ComponentTokens,
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export default function ForgotPasswordScreen() {
  const router = useRouter();

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
      const res = await authService.sendPasswordResetOtp(email.trim().toLowerCase());

      router.replace({
        pathname: '/reset-password-otp',
        params: {
          email: email.trim().toLowerCase(),
          ...(res.otp ? { devOtp: res.otp } : {}),
        },
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
    <AuthScreenLayout
      title="Forgot Password?"
      subtitle="Enter your registered email and we'll send you a 6-digit verification code."
      fallbackRoute="/login"
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
          {/* CTA Button */}
          <Button
            title="Send Verification Code"
            onPress={handleSendLink}
            loading={loading}
            variant="primary"
            size="md"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Back to Login */}
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
              accessibilityLabel="Back to Login">
              <Text style={styles.footerLink}>
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      {/* Email Field */}
      <View style={styles.formContainer}>
        <TextField
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          tone="dark"
          disabled={loading}
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
              color={emailError ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
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
    fontSize: TypographyScale.bodySm.fontSize,
    color: SemanticDarkTokens.color.text.secondary,
  },
  footerLink: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: TypographyScale.bodySm.fontSize,
    fontWeight: '700',
    color: PrimitiveTokens.color.amber[400],
    textDecorationLine: 'underline',
  },
});
