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

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
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
    setSuccessMessage(null);

    // Simulated network authentication flow
    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      setSuccessMessage('Logged in successfully! Welcome back.');
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
              Welcome Back
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to continue your mindful circadian rhythm and habits.
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
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              isPassword
              autoCapitalize="none"
              errorMessage={errors.password}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={errors.password ? theme.colors.error : theme.colors.textSecondary}
                />
              }
            />
          </View>

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Forgot Password">
              <Text style={[styles.forgotPasswordText, { color: theme.colors.secondary }]}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* Submit CTA */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            pill
            fullWidth
            style={styles.submitButton}
          />

          {/* Bottom Switch to Sign Up */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              {"Don't have an account? "}
            </Text>
            <Pressable
              onPress={() => router.push('/signup')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go to Sign Up">
              <Text style={[styles.footerLink, { color: theme.colors.text }]}>
                Sign Up
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
    paddingTop: 12,
  },
  headerContainer: {
    marginBottom: 28,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
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
