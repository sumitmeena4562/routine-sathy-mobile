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
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive device breakpoints
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 420;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 24;
  const emblemSize = isCompact ? 44 : isTablet ? 56 : 50;

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setToast({
        visible: true,
        type: 'error',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Floating Animated Toast Notification */}
      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Top Header Bar with Consistent Horizontal Alignment */}
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
              Create an Account
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
                isCompact && styles.subtitleCompact,
              ]}>
              Begin your mindful daily rhythm and build lasting daily habits with Routine Sathy.
            </Text>
          </View>

          {/* Form Fields with Adaptive Gap */}
          <View style={[styles.formContainer, { gap: isCompact ? 12 : 16 }]}>
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
            size={isCompact ? 'md' : 'lg'}
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
    maxWidth: 340,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  formContainer: {
    width: '100%',
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  termsLink: {
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 4,
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
