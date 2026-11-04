import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '@/utils/haptics';

import {
  AuthScreenLayout,
  Button,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  ComponentTokens,
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const validate = () => {
    const nextErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    triggerHaptic('light');

    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      setToast({
        visible: true,
        type: 'success',
        message: response.message || 'Logged in successfully! Welcome back.',
      });

      setTimeout(() => {
        router.replace('/(tabs)/today');
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
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
      title="Welcome Back"
      subtitle="Sign in to continue your mindful daily rhythm and habits."
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
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="md"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Switch to Sign Up */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                router.replace('/signup');
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go to Sign Up">
              <Text style={styles.footerLink}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      }>
      {/* Form Inputs Area */}
      <View style={styles.formContainer}>
        <TextField
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
          placeholder="Enter your password"
          value={password}
          tone="dark"
          disabled={loading}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          isPassword
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          errorMessage={errors.password}
          leftIcon={
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={errors.password ? '#F87171' : 'rgba(207, 227, 214, 0.65)'}
            />
          }
        />

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordContainer}>
          <Pressable
            onPress={() => {
              triggerHaptic('light');
              router.push('/forgot-password');
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Forgot Password">
            <Text style={styles.forgotPasswordText}>
              Forgot password?
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    gap: 14,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: PrimitiveTokens.color.amber[400],
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
