import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const triggerHaptic = useCallback((type: 'light' | 'success' | 'warning') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (type === 'warning') {
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
    setSuccessMessage(null);

    // Simulated network authentication flow
    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      setSuccessMessage('Account created successfully! Welcome to Routine Sathy.');
    }, 1000);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8),
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}>
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

        <View style={styles.topBarPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom + 24, 36),
              paddingLeft: insets.left + 24,
              paddingRight: insets.right + 24,
            },
          ]}>
          {/* Brand Header */}
          <View style={styles.headerContainer}>
            <View style={styles.emblemWrapper}>
              <RoutineSathyEmblem size={48} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create an Account
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Begin your mindful daily rhythm and build lasting daily habits with Routine Sathy.
            </Text>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: theme.colors.successMuted,
                  borderColor: theme.colors.successBorder,
                },
              ]}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
                style={styles.successIcon}
              />
              <Text style={[styles.successText, { color: theme.colors.success }]}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <TextField
              label="Full Name"
              placeholder="e.g. Sumit Meena"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              autoCapitalize="words"
              errorMessage={errors.name}
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={errors.name ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />

            <TextField
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={errors.email}
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={errors.email ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />

            <TextField
              label="Password"
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
              label="Confirm Password"
              placeholder="Re-enter your password"
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

          {/* Terms & Privacy Note */}
          <Text style={[styles.termsText, { color: theme.colors.textMuted }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.termsLink, { color: theme.colors.text }]}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.termsLink, { color: theme.colors.text }]}>
              Privacy Policy
            </Text>
            .
          </Text>

          {/* Submit CTA */}
          <Button
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            variant="primary"
            size="lg"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/login')}
              hitSlop={8}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    height: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarPlaceholder: {
    width: 40,
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
    maxWidth: 440,
    alignSelf: 'center',
    paddingTop: 8,
  },
  headerContainer: {
    marginBottom: 26,
  },
  emblemWrapper: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 8,
    letterSpacing: -0.1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  successIcon: {
    marginRight: 10,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  termsText: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  termsLink: {
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14.5,
  },
  footerLink: {
    fontSize: 14.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
