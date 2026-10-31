import React, { useState } from 'react';
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
import { triggerHaptic } from '@/utils/haptics';

import {
  BrandLandscapeIllustration,
} from '@/components/illustrations';
import { RoutineSathyEmblem } from '@/components/ui';
import {
  ComponentTokens,
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

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
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Multi-device responsive metrics
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;

  const containerMaxWidth = isTablet ? 480 : 380;
  const horizontalPadding = isTablet ? 32 : isCompact ? 20 : 24;
  const emblemSize = isCompact ? 72 : isTablet ? 92 : 80;
  const buttonHeight = isCompact ? 44 : ComponentTokens.button.heightMd;

  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

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
    <View style={[styles.root, { backgroundColor: PrimitiveTokens.color.forest[950] }]}>
      <StatusBar style="light" />

      {/* 1. Signature Brand Landscape Background Canvas */}
      <BrandLandscapeIllustration animated />

      {/* 2. Scrollable Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
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
          {/* Hero Brand Identity Section */}
          <View style={styles.heroSection}>
            <View style={styles.emblemContainer}>
              <RoutineSathyEmblem size={emblemSize} withTile={true} />
            </View>

            <Text
              style={[
                styles.brandTitle,
                isCompact && styles.brandTitleCompact,
                isTablet && styles.brandTitleTablet,
              ]}>
              Routine Sathy
            </Text>

            <Text
              style={[
                styles.brandTagline,
                isCompact && styles.brandTaglineCompact,
              ]}>
              Small steps. Big changes.
            </Text>

            <Text
              style={[
                styles.heroDescription,
                isCompact && styles.heroDescriptionCompact,
              ]}>
              Wake up early, drink water, get your work done.
            </Text>
          </View>

          {/* Authentication Actions Gateway */}
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
                },
                pressed && styles.buttonPressed,
              ]}>
              <GoogleLogoIcon size={18} />
              <Text style={styles.socialButtonText}>
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
                  },
                  pressed && styles.buttonPressed,
                ]}>
                <Ionicons
                  name="logo-apple"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                  {socialLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
                </Text>
              </Pressable>
            )}

            {/* Subtle Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign up with Email */}
            <Pressable
              onPress={() => router.push('/signup')}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Email"
              style={({ pressed }) => [
                styles.emailButton,
                { height: buttonHeight, borderRadius: buttonHeight / 2 },
                pressed && styles.buttonPressed,
              ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={SemanticDarkTokens.color.action.primary.fg}
                style={styles.buttonIcon}
              />
              <Text style={styles.emailButtonText}>Sign up with Email</Text>
            </Pressable>

            {/* Existing User Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <Pressable
                onPress={() => router.push('/login')}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Log In">
                <Text style={styles.loginLink}>Log In</Text>
              </Pressable>
            </View>
          </View>

          {/* Legal Footer in Clean Protected Container */}
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text>{' '}
              and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
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
    paddingTop: PrimitiveTokens.space[2],
    marginBottom: PrimitiveTokens.space[6],
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PrimitiveTokens.space[5],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  brandTitle: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: TypographyScale.h1.fontSize,
    fontWeight: TypographyScale.h1.fontWeight,
    letterSpacing: TypographyScale.h1.letterSpacing,
    lineHeight: TypographyScale.h1.lineHeight,
    textAlign: 'center',
    color: SemanticDarkTokens.color.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandTitleCompact: {
    fontFamily: TypographyScale.h2.fontFamily,
    fontSize: TypographyScale.h2.fontSize,
    letterSpacing: -0.5,
  },
  brandTitleTablet: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: TypographyScale.body.fontSize,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: -0.2,
    textAlign: 'center',
    color: ComponentTokens.brandLandscape.brandMint,
  },
  brandTaglineCompact: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: TypographyScale.bodySm.fontSize,
    marginTop: 4,
  },
  heroDescription: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: TypographyScale.bodySm.fontSize,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: PrimitiveTokens.space[2],
    maxWidth: 320,
    letterSpacing: -0.1,
    color: SemanticDarkTokens.color.text.secondary,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroDescriptionCompact: {
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 290,
  },
  actionsSection: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 10,
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    shadowOpacity: 0.05,
  },
  socialButtonText: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: SemanticDarkTokens.color.action.primary.fg,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 2,
    gap: PrimitiveTokens.space[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SemanticDarkTokens.color.border.default,
  },
  dividerText: {
    fontFamily: PrimitiveTokens.font.family.medium,
    fontSize: TypographyScale.caption.fontSize,
    fontWeight: '500',
    textTransform: 'lowercase',
    color: 'rgba(207, 227, 214, 0.65)',
  },
  emailButton: {
    width: '100%',
    backgroundColor: SemanticDarkTokens.color.action.primary.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 3,
  },
  emailButtonText: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: SemanticDarkTokens.color.action.primary.fg,
  },
  buttonIcon: {
    marginRight: PrimitiveTokens.space[2],
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginPrompt: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: TypographyScale.bodySm.fontSize,
    color: SemanticDarkTokens.color.text.secondary,
  },
  loginLink: {
    fontFamily: PrimitiveTokens.font.family.bold,
    fontSize: TypographyScale.bodySm.fontSize,
    fontWeight: '700',
    color: PrimitiveTokens.color.amber[400],
    textDecorationLine: 'underline',
  },
  legalContainer: {
    maxWidth: 320,
    marginTop: 14,
    paddingHorizontal: PrimitiveTokens.space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalText: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: TypographyScale.captionSm.fontSize,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(207, 227, 214, 0.70)',
  },
  legalLink: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontWeight: '600',
    color: ComponentTokens.brandLandscape.trail,
    textDecorationLine: 'underline',
  },
});
