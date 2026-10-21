import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  GlassCard,
  HabitCheckControl,
  IconButton,
  ProgressBar,
  ScreenContainer,
  ScreenHeader,
  StatusIndicator,
  TextField,
} from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/hooks/use-theme';

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();

  // Component state demonstrations
  const [inputText, setInputText] = useState('Drink 2L Water');
  const [passwordText, setPasswordText] = useState('secure-routine-123');
  const [hasError, setHasError] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [habitCompleted, setHabitCompleted] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const simulateLoading = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handleOpenOnboarding = async () => {
    try {
      await resetOnboarding();
    } catch {
      // ignore
    }
    router.replace('/onboarding');
  };

  const colorTokens = [
    { name: 'Primary', color: theme.colors.primary, role: 'Brand accent / active' },
    { name: 'Secondary', color: theme.colors.secondary, role: 'Subtle sky tint' },
    { name: 'Success', color: theme.colors.success, role: 'Habit completed' },
    { name: 'Warning', color: theme.colors.warning, role: 'Streak warning / sync' },
    { name: 'Error', color: theme.colors.error, role: 'Validation / missed' },
    { name: 'Background', color: theme.colors.background, role: 'Screen canvas' },
    { name: 'Surface', color: theme.colors.surface, role: 'Cards / containers' },
    { name: 'Text', color: theme.colors.text, role: 'Primary headings' },
    { name: 'Text Muted', color: theme.colors.textSecondary, role: 'Subtitles & meta' },
  ];

  return (
    <ScreenContainer scrollable>
      {/* 1. Header */}
      <ScreenHeader
        title="Design System"
        subtitle="Single Source of Truth tokens & components"
        showBack
        onBack={handleOpenOnboarding}
        rightAction={
          <IconButton
            variant="glass"
            shape="circle"
            size="md"
            onPress={theme.toggleTheme}
            accessibilityLabel="Toggle Theme Mode"
            icon={
              <Ionicons
                name={theme.isDark ? 'sunny' : 'moon'}
                size={20}
                color={theme.colors.primary}
              />
            }
          />
        }
      />

      {/* Quick Access to Onboarding Flow */}
      <View style={{ marginTop: Spacing.md, marginBottom: Spacing.sm }}>
        <Button
          title="✨ Test Onboarding Flow (Reset & Open)"
          variant="primary"
          size="md"
          icon={<Ionicons name="sparkles" size={16} color={theme.colors.primaryForeground} />}
          onPress={handleOpenOnboarding}
        />
      </View>

      {/* 2. Color Tokens Palette */}
      <View style={styles.section}>
        <ThemedText type="heading">1. Semantic Color Tokens</ThemedText>
        <ThemedText type="caption" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Change any value in <ThemedText type="code">src/constants/theme.ts</ThemedText> to rebrand globally.
        </ThemedText>

        <View style={styles.tokenGrid}>
          {colorTokens.map((item) => (
            <Card key={item.name} variant="surface" style={styles.tokenCard}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: item.color, borderColor: theme.colors.borderSubtle },
                ]}
              />
              <View style={styles.tokenMeta}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="code" style={{ color: theme.colors.textSecondary }}>
                  {item.color}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.colors.textMuted, fontSize: 11 }}>
                  {item.role}
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* 3. Typography Hierarchy */}
      <View style={styles.section}>
        <ThemedText type="heading">2. Typography Scale</ThemedText>
        <Card variant="surface" style={styles.typeCard}>
          <ThemedText type="display">Display Title</ThemedText>
          <ThemedText type="title">Screen Title 28px</ThemedText>
          <ThemedText type="subtitle">Section Subtitle 22px</ThemedText>
          <ThemedText type="heading">Component Heading 18px</ThemedText>
          <ThemedText type="body">Body regular 16px - Calm and readable text.</ThemedText>
          <ThemedText type="bodyBold">Body Bold 16px - Emphasized information.</ThemedText>
          <ThemedText type="caption">Caption 14px - Routine metadata and timestamps.</ThemedText>
          <ThemedText type="label">LABEL 12px UPPERCASE</ThemedText>
          <ThemedText type="code">code: font-family: monospace; 12px</ThemedText>
        </Card>
      </View>

      {/* 4. Buttons */}
      <View style={styles.section}>
        <ThemedText type="heading">3. Buttons & Actions</ThemedText>
        <Card variant="surface" style={styles.cardContent}>
          <View style={styles.rowWrap}>
            <Button
              title="Primary"
              variant="primary"
              size="md"
              icon={<Ionicons name="sparkles" size={16} color={theme.colors.primaryForeground} />}
            />
            <Button title="Secondary" variant="secondary" size="md" />
            <Button title="Outline" variant="outline" size="md" />
            <Button title="Glass" variant="glass" size="md" />
            <Button title="Success" variant="success" size="md" />
            <Button title="Danger" variant="danger" size="md" />
          </View>

          <View style={[styles.rowWrap, { marginTop: 12 }]}>
            <Button
              title={buttonLoading ? 'Saving...' : 'Simulate Loading'}
              variant="primary"
              size="sm"
              loading={buttonLoading}
              onPress={simulateLoading}
            />
            <Button title="Disabled Button" variant="primary" size="sm" disabled />
          </View>

          {/* Icon Buttons */}
          <ThemedText type="smallBold" style={{ marginTop: 16 }}>
            Icon Buttons:
          </ThemedText>
          <View style={[styles.rowWrap, { marginTop: 8 }]}>
            <IconButton
              variant="filled"
              icon={<Ionicons name="add" size={20} color={theme.colors.primaryForeground} />}
            />
            <IconButton
              variant="tinted"
              icon={<Ionicons name="heart" size={20} color={theme.colors.primary} />}
            />
            <IconButton
              variant="outline"
              icon={<Ionicons name="share-outline" size={20} color={theme.colors.text} />}
            />
            <IconButton
              variant="glass"
              icon={<Ionicons name="settings-outline" size={20} color={theme.colors.text} />}
            />
            <IconButton
              shape="squircle"
              variant="tinted"
              icon={<Ionicons name="bookmark-outline" size={20} color={theme.colors.primary} />}
            />
          </View>
        </Card>
      </View>

      {/* 5. Form Fields */}
      <View style={styles.section}>
        <ThemedText type="heading">4. Form Inputs</ThemedText>
        <Card variant="surface" style={styles.cardContent}>
          <TextField
            label="Routine Title"
            value={inputText}
            onChangeText={setInputText}
            placeholder="e.g. Read 10 pages"
            leftIcon={
              <Ionicons
                name="book-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <View style={{ height: 16 }} />

          <TextField
            label="Encrypted Token / Password"
            value={passwordText}
            onChangeText={setPasswordText}
            isPassword
            helperText="Tap the eye icon to preview secure entry"
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <View style={{ height: 16 }} />

          <TextField
            label="Validation State Demo"
            value="Invalid input"
            errorMessage={hasError ? 'Daily habit frequency must be greater than 0' : undefined}
            helperText={!hasError ? 'Toggle the error below to test validation' : undefined}
          />
          <Button
            title={hasError ? 'Clear Error State' : 'Trigger Error State'}
            variant="outline"
            size="sm"
            onPress={() => setHasError((prev) => !prev)}
            style={{ marginTop: 8 }}
          />
        </Card>
      </View>

      {/* 6. Habit Completion & Checkboxes */}
      <View style={styles.section}>
        <ThemedText type="heading">5. Habit Controls & Checkboxes</ThemedText>
        <Card variant="surface" style={styles.cardContent}>
          <View style={styles.habitDemoRow}>
            <HabitCheckControl
              completed={habitCompleted}
              streakCount={7}
              onToggle={setHabitCompleted}
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <ThemedText type="bodyBold">
                {habitCompleted ? 'Habit Completed! (+15 pts)' : 'Tap circle to complete'}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                Spring animation with Haptic Notification Feedback
              </ThemedText>
            </View>
          </View>

          <Checkbox
            checked={checkboxChecked}
            onToggle={setCheckboxChecked}
            label="Enable daily reminder at 07:00 AM"
          />

          <View style={{ height: 16 }} />

          <ThemedText type="smallBold">Daily Completion Progress (75%):</ThemedText>
          <ProgressBar progress={0.75} height={8} style={{ marginTop: 8 }} />
        </Card>
      </View>

      {/* 7. Glassmorphism vs Standard Card */}
      <View style={styles.section}>
        <ThemedText type="heading">6. Card & Glassmorphism</ThemedText>
        <GlassCard style={styles.glassDemo}>
          <ThemedText type="heading" style={{ color: theme.colors.primary }}>
            GlassCard Component
          </ThemedText>
          <ThemedText type="body" style={{ marginTop: 4 }}>
            Subtle translucency, restrained blur, thin border token, and soft shadow.
          </ThemedText>
          <Badge
            label="Glassmorphic Accent"
            variant="primary"
            size="sm"
            style={{ marginTop: 10 }}
          />
        </GlassCard>
      </View>

      {/* 8. Badges & Status Indicators */}
      <View style={styles.section}>
        <ThemedText type="heading">7. Badges & Status Indicators</ThemedText>
        <Card variant="surface" style={styles.cardContent}>
          <View style={styles.rowWrap}>
            <Badge label="Primary" variant="primary" />
            <Badge label="Secondary" variant="secondary" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Error" variant="error" />
            <Badge label="Neutral" variant="neutral" />
            <Badge label="Outlined" variant="primary" outline />
          </View>

          <ThemedText type="smallBold" style={{ marginTop: 16 }}>
            Status Indicators:
          </ThemedText>
          <View style={[styles.rowWrap, { marginTop: 8 }]}>
            <View style={styles.statusRow}>
              <StatusIndicator status="online" size={10} />
              <ThemedText type="caption" style={{ marginLeft: 6 }}>
                Active / Online
              </ThemedText>
            </View>
            <View style={styles.statusRow}>
              <StatusIndicator status="syncing" size={10} />
              <ThemedText type="caption" style={{ marginLeft: 6 }}>
                Syncing
              </ThemedText>
            </View>
            <View style={styles.statusRow}>
              <StatusIndicator status="offline" size={10} />
              <ThemedText type="caption" style={{ marginLeft: 6 }}>
                Offline
              </ThemedText>
            </View>
          </View>
        </Card>
      </View>

      {/* 9. Feedback States */}
      <View style={styles.section}>
        <ThemedText type="heading">8. Feedback States</ThemedText>
        <Card variant="surface" style={styles.cardContent}>
          <EmptyState
            title="No Past Archival Routines"
            description="All active habits are seamlessly synced to your local offline storage."
            actionTitle="Create Habit"
            onAction={() => {}}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing['2xl'],
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tokenCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: Spacing.md,
  },
  colorSwatch: {
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tokenMeta: {
    marginTop: Spacing.sm,
  },
  typeCard: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  cardContent: {
    marginTop: Spacing.md,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  habitDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassDemo: {
    marginTop: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
});
