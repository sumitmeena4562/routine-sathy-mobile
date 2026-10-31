import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
import { useAuth } from '@/context/AuthContext';
import {
  ComponentTokens,
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export default function SignUpScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
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

  const validate = () => {
    const nextErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      nextErrors.name = 'Full name is required';
    } else if (name.trim().length > 100) {
      nextErrors.name = 'Name cannot exceed 100 characters';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignUp = async () => {
    triggerHaptic('light');

    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setToast({
        visible: true,
        type: 'success',
        message: response.message || 'User registered successfully',
      });

      setTimeout(() => {
        router.replace('/add-routine');
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
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

  return (
    <AuthScreenLayout
      title="Create an Account"
      subtitle="Begin your mindful daily rhythm and build lasting daily habits."
      fallbackRoute="/welcome"
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
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            variant="primary"
            size="md"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                router.replace('/login');
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go to Login">
              <Text style={styles.footerLink}>
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      {/* Form Fields Area */}
      <View style={styles.formContainer}>
        <TextField
          label="Full Name"
          placeholder="e.g. Sumit Meena"
          value={name}
          tone="dark"
          disabled={loading}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          errorMessage={errors.name}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={19}
              color={errors.name ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        <TextField
          ref={emailRef}
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          tone="dark"
          disabled={loading}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          errorMessage={errors.email}
          leftIcon={
            <Ionicons
              name="mail-outline"
              size={19}
              color={errors.email ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        <TextField
          ref={passwordRef}
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          tone="dark"
          disabled={loading}
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
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          tone="dark"
          disabled={loading}
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
          onSubmitEditing={handleSignUp}
          errorMessage={errors.confirmPassword}
          leftIcon={
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={errors.confirmPassword ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        {/* Terms & Privacy Note */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.termsLink}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    gap: 12,
  },
  termsText: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: TypographyScale.captionSm.fontSize,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    color: 'rgba(207, 227, 214, 0.70)',
  },
  termsLink: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontWeight: '600',
    color: ComponentTokens.brandLandscape.trail,
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
    marginTop: 16,
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
