import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  Card,
  RoutineSathyEmblem,
  TextField,
  Toast,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth';
import { routineService } from '@/services/routine';
import { UserGoals } from '@/types/routine';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();
  const { user, logout, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 540 : 460;
  const horizontalPadding = isTablet ? 32 : 20;

  // Circadian & Targets State
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [hasGoalsChanged, setHasGoalsChanged] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  // Settings State
  const [morningReminder, setMorningReminder] = useState(
    user?.settings?.morningReminder ?? true
  );
  const [eveningReminder, setEveningReminder] = useState(
    user?.settings?.eveningReminder ?? true
  );
  const [hapticEnabled, setHapticEnabled] = useState(
    user?.settings?.vibration ?? true
  );
  const [soundEnabled, setSoundEnabled] = useState(
    user?.settings?.soundEffects ?? false
  );

  // Modals
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    title?: string;
    type: 'success' | 'error' | 'info' | 'reminder';
    message: string;
  } | null>(null);

  // Load user goals
  useEffect(() => {
    async function loadGoals() {
      try {
        const goalsRes = await routineService.getUserGoals();
        if (goalsRes) {
          setGoals(goalsRes);
        }
      } catch {
        // Fallback default
      }
    }
    loadGoals();
  }, []);

  const triggerHaptic = useCallback(
    (type: 'light' | 'success' | 'warning') => {
      if (Platform.OS !== 'web' && hapticEnabled) {
        if (type === 'warning') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        } else if (type === 'success') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
    },
    [hapticEnabled]
  );

  // Adjust routine targets locally
  const adjustGoalWake = (deltaMin: number) => {
    triggerHaptic('light');
    if (!goals) return;
    const [h, m] = (goals.targetWakeUp || '06:00').split(':').map(Number);
    let totalMins = (isNaN(h) ? 6 : h) * 60 + (isNaN(m) ? 0 : m) + deltaMin;
    totalMins = Math.max(240, Math.min(600, totalMins));
    const newH = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const newM = String(totalMins % 60).padStart(2, '0');
    setGoals({ ...goals, targetWakeUp: `${newH}:${newM}` });
    setHasGoalsChanged(true);
  };

  const adjustGoalWater = (delta: number) => {
    triggerHaptic('light');
    if (!goals) return;
    const cur = goals.targetWater || 3.0;
    const next = Math.max(1.0, Math.min(6.0, Math.round((cur + delta) * 10) / 10));
    setGoals({ ...goals, targetWater: next });
    setHasGoalsChanged(true);
  };

  const adjustGoalStudy = (delta: number) => {
    triggerHaptic('light');
    if (!goals) return;
    const cur = goals.targetStudy || 4.0;
    const next = Math.max(0.5, Math.min(12.0, Math.round((cur + delta) * 10) / 10));
    setGoals({ ...goals, targetStudy: next });
    setHasGoalsChanged(true);
  };

  const handleSaveGoals = async () => {
    if (!goals) return;
    setSavingGoals(true);
    triggerHaptic('light');
    try {
      await routineService.updateUserGoals(goals);
      setHasGoalsChanged(false);
      triggerHaptic('success');
      setToast({
        visible: true,
        title: 'Goals Saved',
        type: 'success',
        message: 'Your daily circadian targets have been updated.',
      });
    } catch {
      setToast({
        visible: true,
        title: 'Error',
        type: 'error',
        message: 'Could not save targets. Please try again.',
      });
    } finally {
      setSavingGoals(false);
    }
  };

  // Toggle Reminder Settings and sync with backend
  const handleToggleSetting = async (
    key: 'morning' | 'evening' | 'haptic' | 'sound',
    val: boolean
  ) => {
    triggerHaptic('light');
    if (key === 'morning') setMorningReminder(val);
    if (key === 'evening') setEveningReminder(val);
    if (key === 'haptic') setHapticEnabled(val);
    if (key === 'sound') setSoundEnabled(val);

    try {
      await authService.updateSettings({
        morningReminder: key === 'morning' ? val : morningReminder,
        eveningReminder: key === 'evening' ? val : eveningReminder,
      });
    } catch {
      // Background sync
    }
  };

  // Save updated profile name
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setToast({ visible: true, title: 'Notice', type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    setSavingProfile(true);
    triggerHaptic('light');
    try {
      await authService.updateProfile({ name: editName.trim() });
      await refreshUser();
      setEditProfileModal(false);
      triggerHaptic('success');
      setToast({ visible: true, title: 'Profile Updated', type: 'success', message: 'Your name was saved successfully.' });
    } catch {
      setToast({
        visible: true,
        title: 'Error',
        type: 'error',
        message: 'Could not update profile. Please try again.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password submit
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    triggerHaptic('light');
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerHaptic('success');
      setToast({
        visible: true,
        title: 'Security',
        type: 'success',
        message: 'Password changed successfully.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Current password incorrect.';
      setPasswordError(msg);
      triggerHaptic('warning');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    triggerHaptic('warning');

    const executeLogout = async () => {
      setLoggingOut(true);
      try {
        await logout();
        router.replace('/welcome');
      } catch {
        setToast({
          visible: true,
          title: 'Error',
          type: 'error',
          message: 'Failed to log out. Please try again.',
        });
      } finally {
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      executeLogout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of Routine Sathy?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: executeLogout },
      ]);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {toast && (
        <Toast
          visible={toast.visible}
          title={toast.title}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 14 : 10),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.headerBarInner, { maxWidth: containerMaxWidth }]}>
          <Text style={styles.eyebrow}>ACCOUNT &amp; SETTINGS</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Profile
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: containerMaxWidth,
            paddingBottom: Math.max(insets.bottom + 28, 44),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {/* ========================================================
            1. USER PROFILE IDENTITY HERO CARD
            ======================================================== */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            {/* Avatar Circle with Online Dot */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarInitials, { color: theme.colors.primaryForeground }]}>
                  {getInitials(user?.name)}
                </Text>
              </View>
              <View style={styles.avatarOnlineDot} />
            </View>

            {/* Name, Email, and Role Badge */}
            <View style={styles.userInfoCol}>
              <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
                {user?.name || 'Routine User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {user?.email || '—'}
              </Text>
              <View style={styles.roleChip}>
                <Ionicons name="shield-checkmark" size={12} color="#D97706" />
                <Text style={styles.roleChipText}>
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </Text>
              </View>
            </View>

            {/* Quick Edit Name Button */}
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                setEditName(user?.name || '');
                setEditProfileModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit Name"
              style={({ pressed }) => [
                styles.editPillBtn,
                {
                  backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                },
                pressed && { opacity: 0.75 },
              ]}>
              <Ionicons name="pencil" size={13} color={theme.colors.text} />
              <Text style={[styles.editPillBtnText, { color: theme.colors.text }]}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        {/* ========================================================
            2. DAILY RHYTHM TARGETS
            ======================================================== */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flag" size={16} color="#D97706" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Daily Targets
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Your standard goals used to calculate score
              </Text>
            </View>
          </View>

          {/* Wake-up Time Stepper */}
          <View style={styles.targetRow}>
            <View style={styles.targetInfo}>
              <Ionicons name="sunny-outline" size={17} color="#F59E0B" style={styles.targetIcon} />
              <View>
                <Text style={[styles.targetLabel, { color: theme.colors.text }]}>Wake-up Time</Text>
                <Text style={[styles.targetSub, { color: theme.colors.textSecondary }]}>Morning biological start</Text>
              </View>
            </View>
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => adjustGoalWake(-15)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="remove" size={14} color={theme.colors.text} />
              </Pressable>
              <Text style={[styles.stepperValText, { color: theme.colors.text }]}>
                {goals?.targetWakeUp || '06:00'}
              </Text>
              <Pressable
                onPress={() => adjustGoalWake(15)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="add" size={14} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* Water Goal Stepper */}
          <View style={styles.targetRow}>
            <View style={styles.targetInfo}>
              <Ionicons name="water-outline" size={17} color="#0284C7" style={styles.targetIcon} />
              <View>
                <Text style={[styles.targetLabel, { color: theme.colors.text }]}>Water Intake</Text>
                <Text style={[styles.targetSub, { color: theme.colors.textSecondary }]}>Daily hydration goal</Text>
              </View>
            </View>
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => adjustGoalWater(-0.5)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="remove" size={14} color={theme.colors.text} />
              </Pressable>
              <Text style={[styles.stepperValText, { color: theme.colors.text }]}>
                {(goals?.targetWater || 3.0).toFixed(1)} L
              </Text>
              <Pressable
                onPress={() => adjustGoalWater(0.5)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="add" size={14} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* Deep Work / Study Stepper */}
          <View style={styles.targetRow}>
            <View style={styles.targetInfo}>
              <Ionicons name="book-outline" size={17} color="#7C3AED" style={styles.targetIcon} />
              <View>
                <Text style={[styles.targetLabel, { color: theme.colors.text }]}>Deep Focus</Text>
                <Text style={[styles.targetSub, { color: theme.colors.textSecondary }]}>Dedicated daily study block</Text>
              </View>
            </View>
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => adjustGoalStudy(-0.5)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="remove" size={14} color={theme.colors.text} />
              </Pressable>
              <Text style={[styles.stepperValText, { color: theme.colors.text }]}>
                {(goals?.targetStudy || 4.0).toFixed(1)} h
              </Text>
              <Pressable
                onPress={() => adjustGoalStudy(0.5)}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="add" size={14} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Save Targets Button (Visible only when modified) */}
          {hasGoalsChanged && (
            <View style={styles.saveGoalsWrapper}>
              <Button
                title="Save Target Changes"
                onPress={handleSaveGoals}
                loading={savingGoals}
                variant="primary"
                size="md"
                pill
                fullWidth
              />
            </View>
          )}
        </Card>

        {/* ========================================================
            3. PREFERENCES & REMINDERS
            ======================================================== */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="notifications" size={16} color="#059669" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Preferences
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Notifications and sensory feedback
              </Text>
            </View>
          </View>

          {/* Morning Reminder Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                Morning Wake Alarm
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>
                Prompt at your biological wake-up time
              </Text>
            </View>
            <Switch
              value={morningReminder}
              onValueChange={(val) => handleToggleSetting('morning', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* Evening Review Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                Evening Habit Review
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>
                Gentle bedtime prompt to log routines
              </Text>
            </View>
            <Switch
              value={eveningReminder}
              onValueChange={(val) => handleToggleSetting('evening', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* Haptic Vibration Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                Tactile Vibration
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>
                Crisp haptic feedback on toggles
              </Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={(val) => handleToggleSetting('haptic', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* Sound Effects Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                Completion Sounds
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>
                Gentle audio chime on task completion
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => handleToggleSetting('sound', val)}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* ========================================================
            4. APPEARANCE & THEME
            ======================================================== */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Ionicons name="moon" size={16} color="#0284C7" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Appearance
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Choose between system, light, or dark mode
              </Text>
            </View>
          </View>

          <View style={styles.themeOptionsRow}>
            {(['system', 'light', 'dark'] as const).map((mode) => {
              const active = preference === mode;
              const label = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';
              const iconName =
                mode === 'system'
                  ? 'phone-portrait-outline'
                  : mode === 'light'
                  ? 'sunny'
                  : 'moon';

              return (
                <Pressable
                  key={mode}
                  onPress={() => {
                    triggerHaptic('light');
                    setPreference(mode);
                  }}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      backgroundColor: active
                        ? theme.colors.primary
                        : theme.isDark
                        ? '#1E293B'
                        : '#F8FAFC',
                      borderColor: active
                        ? theme.colors.primary
                        : theme.isDark
                        ? '#334155'
                        : '#E2E8F0',
                    },
                    pressed && { opacity: 0.8 },
                  ]}>
                  <Ionicons
                    name={iconName}
                    size={15}
                    color={active ? theme.colors.primaryForeground : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: active ? theme.colors.primaryForeground : theme.colors.text },
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* ========================================================
            5. SECURITY & APP INFO
            ======================================================== */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="shield" size={16} color="#4F46E5" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Account &amp; Security
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Credentials and system information
              </Text>
            </View>
          </View>

          {/* Change Password Row */}
          <Pressable
            onPress={() => {
              triggerHaptic('light');
              setPasswordError('');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordModal(true);
            }}
            style={({ pressed }) => [
              styles.securityRow,
              {
                backgroundColor: theme.isDark ? '#1E293B' : '#F8FAFC',
                borderColor: theme.isDark ? '#334155' : '#E2E8F0',
              },
              pressed && { opacity: 0.75 },
            ]}>
            <View style={styles.securityRowLeft}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.text} />
              <View>
                <Text style={[styles.securityRowTitle, { color: theme.colors.text }]}>
                  Change Password
                </Text>
                <Text style={[styles.securityRowSub, { color: theme.colors.textSecondary }]}>
                  Set a new account login password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

          {/* About App Info */}
          <View style={styles.appInfoRow}>
            <RoutineSathyEmblem size={34} />
            <View style={styles.appInfoText}>
              <Text style={[styles.appName, { color: theme.colors.text }]}>
                Routine Sathy
              </Text>
              <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
                Version 1.0.2 • Up to date
              </Text>
            </View>
          </View>
        </Card>

        {/* ========================================================
            6. LOG OUT ACTION
            ======================================================== */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            loading={loggingOut}
            variant="danger"
            size="lg"
            pill
            fullWidth
            icon={
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            }
          />
        </View>
      </ScrollView>

      {/* ========================================================
          MODAL 1: EDIT PROFILE NAME
          ======================================================== */}
      <Modal
        visible={editProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditProfileModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEditProfileModal(false)}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Name
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Update your display name across Routine Sathy.
            </Text>

            <TextField
              label="Your Full Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Sumit Meena"
              autoFocus
              containerStyle={{ marginBottom: 20 }}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setEditProfileModal(false)}
                style={styles.modalBtnHalf}
              />
              <Button
                title="Save Name"
                variant="primary"
                onPress={handleSaveProfile}
                loading={savingProfile}
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          MODAL 2: CHANGE PASSWORD
          ======================================================== */}
      <Modal
        visible={passwordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPasswordModal(false)}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Enter your current password and pick a new secure password.
            </Text>

            {passwordError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={15} color="#DC2626" />
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            <TextField
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry
              containerStyle={{ marginBottom: 12 }}
            />

            <TextField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              containerStyle={{ marginBottom: 12 }}
            />

            <TextField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              secureTextEntry
              containerStyle={{ marginBottom: 20 }}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setPasswordModal(false)}
                style={styles.modalBtnHalf}
              />
              <Button
                title="Update"
                variant="primary"
                onPress={handleChangePassword}
                loading={savingPassword}
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    gap: 16,
  },
  // User Hero Card
  userCard: {
    padding: 18,
    borderRadius: 22,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  editPillBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  // Grouped Section Cards
  sectionCard: {
    padding: 18,
    borderRadius: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  // Targets Rows
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  targetIcon: {
    marginTop: 1,
  },
  targetLabel: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  targetSub: {
    fontSize: 12,
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 54,
    textAlign: 'center',
  },
  saveGoalsWrapper: {
    marginTop: 16,
  },
  // Toggle Rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  // Theme Options
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Security Row
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  securityRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityRowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityRowSub: {
    fontSize: 12,
    marginTop: 1,
  },
  // App Info
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 13.5,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalErrorText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
