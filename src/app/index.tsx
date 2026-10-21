import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import {
  AmbientAtmosphere,
  Badge,
  Button,
  GlassCard,
  IconButton,
  ProgressBar,
  StatusIndicator,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SplashScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Launch Simulation State
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0.35);
  const [statusMessage, setStatusMessage] = useState('Encrypted Storage • Ready');

  const isCompactHeight = height < 740;
  const contentMaxWidth = Math.min(width * 0.92, 460);

  const handleLaunch = () => {
    if (launching) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    setLaunching(true);
    setLaunchProgress(0.65);
    setStatusMessage('Synchronizing Sacred Habits...');

    setTimeout(() => {
      setLaunchProgress(0.90);
      setStatusMessage('Preparing Mindful Sanctuary...');
    }, 700);

    setTimeout(() => {
      setLaunchProgress(1.0);
      setStatusMessage('Welcome to Routine Sathy ✨');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    }, 1400);

    setTimeout(() => {
      setLaunching(false);
    }, 2400);
  };

  const handleExplore = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push('/explore');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* 1. Optical Gradient Mesh Atmosphere for authentic glass refraction */}
      <AmbientAtmosphere />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: height,
            justifyContent: isCompactHeight ? 'flex-start' : 'space-between',
            paddingVertical: Platform.OS === 'ios' ? 56 : 40,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
          {/* 2. Top Header Status Bar */}
          <View style={styles.topBar}>
            <GlassCard
              variant="subtle"
              padding={Spacing.xs + 2}
              radius={Radius.full}
              specularHighlight
              style={styles.osBadge}>
              <View style={styles.statusRow}>
                <StatusIndicator status="online" size={8} />
                <ThemedText
                  type="label"
                  style={[styles.osText, { color: theme.colors.textSecondary }]}>
                  ROUTINE SATHY OS
                </ThemedText>
              </View>
            </GlassCard>

            <IconButton
              variant="glass"
              shape="circle"
              size="md"
              onPress={theme.toggleTheme}
              accessibilityLabel="Toggle Day/Night Mode"
              icon={
                <Ionicons
                  name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
                  size={18}
                  color={theme.colors.primary}
                />
              }
            />
          </View>

          {/* 3. Center Brand Identity & Emblem */}
          <View style={[styles.brandHero, isCompactHeight && { marginVertical: Spacing.lg }]}>
            {/* Outer Radiant Glowing Glass Emblem */}
            <View
              style={[
                styles.emblemAura,
                {
                  shadowColor: theme.colors.primary,
                  backgroundColor: theme.isDark
                    ? 'rgba(157, 143, 250, 0.15)'
                    : 'rgba(139, 124, 246, 0.15)',
                },
              ]}>
              <GlassCard
                variant="heavy"
                padding={Spacing.lg}
                radius={36}
                specularHighlight
                style={styles.emblemGlassContainer}>
                {/* Core Gradient Glyph */}
                <LinearGradient
                  colors={
                    theme.isDark
                      ? ['#9D8FFA', '#7C3AED', '#4F46E5']
                      : ['#8B7CF6', '#6D28D9', '#4F46E5']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glyphCircle}>
                  <Ionicons name="sparkles" size={44} color="#FFFFFF" />
                </LinearGradient>
              </GlassCard>
            </View>

            {/* Brand Typography */}
            <ThemedText type="display" style={styles.brandTitle}>
              Routine Sathy
            </ThemedText>

            {/* Tagline Pill */}
            <GlassCard
              variant="subtle"
              padding={Spacing.xs + 2}
              radius={Radius.full}
              style={styles.taglinePill}>
              <ThemedText
                type="label"
                style={[styles.taglineText, { color: theme.colors.primary }]}>
                SACRED DAILY RHYTHM & HABIT FLOW
              </ThemedText>
            </GlassCard>

            {/* Value Proposition */}
            <ThemedText
              type="body"
              style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
              Your mindful sanctuary for unbroken focus, stress-free micro-habits, and sacred daily momentum.
            </ThemedText>
          </View>

          {/* 4. Brand Value Pillars (Frosted Glass Chips) */}
          <View style={styles.pillarsGrid}>
            <GlassCard variant="default" padding={Spacing.sm + 2} radius={Radius.lg} style={styles.pillarCard}>
              <Ionicons name="leaf-outline" size={18} color={theme.colors.success} />
              <ThemedText type="smallBold" style={{ marginTop: 4, fontSize: 13 }}>
                Mindful Presence
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 1 }}>
                Pranayama & focus
              </ThemedText>
            </GlassCard>

            <GlassCard variant="default" padding={Spacing.sm + 2} radius={Radius.lg} style={styles.pillarCard}>
              <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
              <ThemedText type="smallBold" style={{ marginTop: 4, fontSize: 13 }}>
                Streak Shield
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 1 }}>
                Offline resilience
              </ThemedText>
            </GlassCard>

            <GlassCard variant="default" padding={Spacing.sm + 2} radius={Radius.lg} style={styles.pillarCard}>
              <Ionicons name="flash-outline" size={18} color={theme.colors.warning} />
              <ThemedText type="smallBold" style={{ marginTop: 4, fontSize: 13 }}>
                Energy Rhythm
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 1 }}>
                Zero anxiety flow
              </ThemedText>
            </GlassCard>
          </View>

          {/* 5. App Launch Engine (Glassmorphic Launch Console) */}
          <GlassCard variant="default" specularHighlight padding={Spacing.lg} radius={Radius['2xl']} style={styles.launchCard}>
            <View style={styles.launchHeader}>
              <ThemedText type="smallBold" style={{ letterSpacing: -0.2 }}>
                App Launch Console
              </ThemedText>
              <Badge
                label={launching ? 'Initializing...' : 'Engine Ready'}
                variant={launching ? 'primary' : 'success'}
                size="sm"
              />
            </View>

            {/* Launch Progress & Telemetry */}
            <View style={styles.progressSection}>
              <View style={styles.telemetryRow}>
                <ThemedText type="caption" style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  {statusMessage}
                </ThemedText>
                <ThemedText type="code" style={{ color: theme.colors.primary, fontSize: 11 }}>
                  {Math.round(launchProgress * 100)}%
                </ThemedText>
              </View>

              <ProgressBar
                progress={launchProgress}
                height={8}
                animated
                style={{ marginTop: 6 }}
              />
            </View>

            {/* Primary Launch Action */}
            <Button
              title={launching ? 'Entering Sanctuary...' : 'Launch Routine Sathy'}
              variant="primary"
              size="lg"
              fullWidth
              loading={launching}
              onPress={handleLaunch}
              icon={
                <Ionicons
                  name={launching ? 'sparkles' : 'arrow-forward'}
                  size={18}
                  color={theme.colors.primaryForeground}
                />
              }
              iconPosition="right"
              style={{ marginTop: Spacing.md }}
            />

            {/* Design System Reference Link */}
            <Button
              title="Explore Design System Tokens"
              variant="glass"
              size="sm"
              fullWidth
              onPress={handleExplore}
              icon={<Ionicons name="color-palette-outline" size={14} color={theme.colors.textSecondary} />}
              style={{ marginTop: Spacing.sm }}
            />
          </GlassCard>

          {/* 6. Brand Trust & Privacy Footer */}
          <View style={styles.footerRow}>
            <Ionicons name="lock-closed-outline" size={12} color={theme.colors.textMuted} />
            <ThemedText type="caption" style={[styles.footerText, { color: theme.colors.textMuted }]}>
              100% On-Device Privacy • Offline-First • Routine Sathy 2026
            </ThemedText>
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
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  osBadge: {
    paddingHorizontal: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  osText: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  brandHero: {
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.xl,
  },
  emblemAura: {
    borderRadius: 44,
    padding: 6,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 36,
    elevation: 12,
  },
  emblemGlassContainer: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphCircle: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  taglinePill: {
    marginTop: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
  },
  taglineText: {
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  brandSubtitle: {
    textAlign: 'center',
    marginTop: Spacing.sm + 2,
    lineHeight: 22,
    fontSize: 14,
    paddingHorizontal: Spacing.sm,
  },
  pillarsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  pillarCard: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  launchCard: {
    width: '100%',
  },
  launchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: Spacing.md,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
