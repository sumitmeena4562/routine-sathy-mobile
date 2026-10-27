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
import { RoutineStats, UserGoals } from '@/types/routine';

type ProfileTab = 'account' | 'settings';

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

  // Active sub-tab: 'account' | 'settings'
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');

  // Circadian & Account State
  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [hasGoalsChanged, setHasGoalsChanged] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  // Settings State (initialized from user settings)
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
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load user data, circadian stats, and baseline goals
  useEffect(() => {
    async function loadProfileData() {
      try {
        const [statsRes, goalsRes] = await Promise.allSettled([
          routineService.getRoutineStats(),
          routineService.getUserGoals(),
        ]);
        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value);
        }
        if (goalsRes.status === 'fulfilled' && goalsRes.value) {
          setGoals(goalsRes.value);
        }
      } catch {
        // Safe fallback
      }
    }
    loadProfileData();
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'success' | 'warning') => {
    if (Platform.OS !== 'web' && hapticEnabled) {
      if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else if (type === 'success') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, [hapticEnabled]);

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
        type: 'success',
        message: 'Daily routine targets saved.',
      });
    } catch {
      setToast({
        visible: true,
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
      setToast({ visible: true, type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    setSavingProfile(true);
    triggerHaptic('light');
    try {
      await authService.updateProfile({ name: editName.trim() });
      await refreshUser();
      setEditProfileModal(false);
      triggerHaptic('success');
      setToast({ visible: true, type: 'success', message: 'Profile updated.' });
    } catch {
      setToast({
        visible: true,
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
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: executeLogout },
        ]
      );
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
          <Text style={styles.eyebrow}>MY ACCOUNT</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Profile &amp; Settings
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Manage your personal profile, daily targets, and app options.
          </Text>

          {/* Simple Tab Switcher: Profile vs Settings */}
          <View
            style={[
              styles.tabSwitcher,
              {
                backgroundColor: theme.isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                setActiveTab('account');
              }}
              style={[
                styles.tabSwitchBtn,
                activeTab === 'account' && [
                  styles.tabSwitchActive,
                  { backgroundColor: theme.colors.surface },
                ],
              ]}>
              <Ionicons
                name="person-outline"
                size={15}
                color={activeTab === 'account' ? theme.colors.text : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabSwitchText,
                  {
                    color:
                      activeTab === 'account' ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: activeTab === 'account' ? '700' : '600',
                  },
                ]}>
                Profile &amp; Targets
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic('light');
                setActiveTab('settings');
              }}
              style={[
                styles.tabSwitchBtn,
                activeTab === 'settings' && [
                  styles.tabSwitchActive,
                  { backgroundColor: theme.colors.surface },
                ],
              ]}>
              <Ionicons
                name="settings-outline"
                size={15}
                color={activeTab === 'settings' ? theme.colors.text : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabSwitchText,
                  {
                    color:
                      activeTab === 'settings' ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: activeTab === 'settings' ? '700' : '600',
                  },
                ]}>
                App Settings
              </Text>
            </Pressable>
          </View>
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
        {activeTab === 'account' ? (
          /* ========================================================
             TAB 1: PROFILE & TARGETS
             ======================================================== */
          <View style={styles.content}>
            {/* 1. User Card */}
            <Card style={styles.userCard}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.avatarInitials, { color: theme.colors.primaryForeground }]}>
                    {getInitials(user?.name)}
                  </Text>
                </View>
                <View style={styles.avatarOnlineDot} />
              </View>

              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.name || 'Routine User'}
              </Text>

              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user?.email || '—'}
              </Text>

              <View style={styles.badgeAndEditRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: theme.isDark ? 'rgba(217, 119, 6, 0.12)' : '#FEF3C7',
                      borderColor: theme.isDark ? '#B45309' : '#FDE68A',
                    },
                  ]}>
                  <Ionicons name="shield-checkmark" size={13} color="#D97706" />
                  <Text style={[styles.roleText, { color: '#D97706' }]}>
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    setEditName(user?.name || '');
                    setEditProfileModal(true);
                  }}
                  style={({ pressed }) => [
                    styles.editNameBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="pencil" size={12} color={theme.colors.text} />
                  <Text style={[styles.editNameBtnText, { color: theme.colors.text }]}>
                    Edit Name
                  </Text>
                </Pressable>
              </View>

              {/* Habit Performance Strip */}
              <View
                style={[
                  styles.metricsStrip,
                  {
                    borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                  },
                ]}>
                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="flame" size={13} color="#EA580C" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Streak
                    </Text>
                  </View>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {stats?.currentStreak ?? 1}{' '}
                    <Text style={[styles.metricUnit, { color: theme.colors.textSecondary }]}>d</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.metricDivider,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                  ]}
                />

                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="trophy" size={13} color="#D97706" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Best
                    </Text>
                  </View>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {stats?.maxStreak ?? 7}{' '}
                    <Text style={[styles.metricUnit, { color: theme.colors.textSecondary }]}>d</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.metricDivider,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                  ]}
                />

                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Avg Score
                    </Text>
                  </View>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {stats?.avgScore ?? 83}
                    <Text style={[styles.metricUnit, { color: theme.colors.textSecondary }]}>%</Text>
                  </Text>
                </View>
              </View>
            </Card>

            {/* 2. Account Security Card */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="key" size={16} color="#4F46E5" />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Account Password
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    Change your login password anytime
                  </Text>
                </View>
              </View>

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
                      Tap to set a new password
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </Card>

            {/* 3. Daily Routine Targets */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="flag" size={16} color="#D97706" />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Daily Routine Targets
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    Your standard daily targets used to calculate your score
                  </Text>
                </View>
              </View>

              <View style={styles.goalAdjustRow}>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                    Wake-up Time
                  </Text>
                  <Text style={[styles.goalSub, { color: theme.colors.textSecondary }]}>
                    Target morning wake-up time
                  </Text>
                </View>
                <View style={styles.goalStepper}>
                  <Pressable
                    onPress={() => adjustGoalWake(-15)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="remove" size={14} color={theme.colors.text} />
                  </Pressable>
                  <Text style={[styles.goalValText, { color: theme.colors.text }]}>
                    {goals?.targetWakeUp || '06:00'}
                  </Text>
                  <Pressable
                    onPress={() => adjustGoalWake(15)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="add" size={14} color={theme.colors.text} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

              <View style={styles.goalAdjustRow}>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                    Water Goal
                  </Text>
                  <Text style={[styles.goalSub, { color: theme.colors.textSecondary }]}>
                    Daily water drinking goal
                  </Text>
                </View>
                <View style={styles.goalStepper}>
                  <Pressable
                    onPress={() => adjustGoalWater(-0.5)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="remove" size={14} color={theme.colors.text} />
                  </Pressable>
                  <Text style={[styles.goalValText, { color: theme.colors.text }]}>
                    {(goals?.targetWater || 3.0).toFixed(1)} L
                  </Text>
                  <Pressable
                    onPress={() => adjustGoalWater(0.5)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="add" size={14} color={theme.colors.text} />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

              <View style={styles.goalAdjustRow}>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                    Focus &amp; Study
                  </Text>
                  <Text style={[styles.goalSub, { color: theme.colors.textSecondary }]}>
                    Daily focused work hours
                  </Text>
                </View>
                <View style={styles.goalStepper}>
                  <Pressable
                    onPress={() => adjustGoalStudy(-0.5)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="remove" size={14} color={theme.colors.text} />
                  </Pressable>
                  <Text style={[styles.goalValText, { color: theme.colors.text }]}>
                    {(goals?.targetStudy || 4.0).toFixed(1)} h
                  </Text>
                  <Pressable
                    onPress={() => adjustGoalStudy(0.5)}
                    style={[styles.miniStepBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                    <Ionicons name="add" size={14} color={theme.colors.text} />
                  </Pressable>
                </View>
              </View>

              {hasGoalsChanged && (
                <Button
                  title="Save Targets"
                  onPress={handleSaveGoals}
                  loading={savingGoals}
                  variant="primary"
                  size="md"
                  pill
                  fullWidth
                  icon={<Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />}
                  style={{ marginTop: 10 }}
                />
              )}
            </Card>

            {/* Logout Action */}
            <Button
              title="Log Out"
              onPress={handleLogout}
              loading={loggingOut}
              variant="danger"
              size="lg"
              pill
              fullWidth
              icon={<Ionicons name="log-out-outline" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />}
              style={styles.logoutButton}
            />
          </View>
        ) : (
          /* ========================================================
             TAB 2: APP SETTINGS
             ======================================================== */
          <View style={styles.content}>
            {/* 1. Daily Reminders */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="notifications" size={16} color="#059669" />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Daily Reminders
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    Notifications to keep your routine on track
                  </Text>
                </View>
              </View>

              {/* Morning Reminder Toggle */}
              <View style={styles.settingToggleRow}>
                <View style={styles.settingToggleInfo}>
                  <Text style={[styles.settingToggleTitle, { color: theme.colors.text }]}>
                    Morning Wake-up Alert
                  </Text>
                  <Text style={[styles.settingToggleSub, { color: theme.colors.textSecondary }]}>
                    Reminder at your target wake-up time
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

              {/* Evening Reminder Toggle */}
              <View style={styles.settingToggleRow}>
                <View style={styles.settingToggleInfo}>
                  <Text style={[styles.settingToggleTitle, { color: theme.colors.text }]}>
                    Evening Wind-Down Alert
                  </Text>
                  <Text style={[styles.settingToggleSub, { color: theme.colors.textSecondary }]}>
                    Reminder 45 mins before bedtime
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

              {/* Quiet Hours Display */}
              <View style={styles.settingInfoRow}>
                <View style={styles.settingToggleInfo}>
                  <Text style={[styles.settingToggleTitle, { color: theme.colors.text }]}>
                    Quiet Sleep Hours
                  </Text>
                  <Text style={[styles.settingToggleSub, { color: theme.colors.textSecondary }]}>
                    Notifications are muted while you sleep
                  </Text>
                </View>
                <View style={[styles.quietPill, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="moon" size={12} color="#7C3AED" />
                  <Text style={[styles.quietPillText, { color: theme.colors.text }]}>
                    10:30 PM – 06:30 AM
                  </Text>
                </View>
              </View>
            </Card>

            {/* 2. Sound & Vibration */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="phone-portrait" size={16} color="#7C3AED" />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Sound &amp; Vibration
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    Touch response and habit complete sounds
                  </Text>
                </View>
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.settingToggleInfo}>
                  <Text style={[styles.settingToggleTitle, { color: theme.colors.text }]}>
                    Vibration Feedback
                  </Text>
                  <Text style={[styles.settingToggleSub, { color: theme.colors.textSecondary }]}>
                    Vibrate phone when checking habits
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

              <View style={styles.settingToggleRow}>
                <View style={styles.settingToggleInfo}>
                  <Text style={[styles.settingToggleTitle, { color: theme.colors.text }]}>
                    Completion Sound
                  </Text>
                  <Text style={[styles.settingToggleSub, { color: theme.colors.textSecondary }]}>
                    Play a gentle sound when completing tasks
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

            {/* 3. Theme Card */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="moon" size={16} color="#0284C7" />
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    App Theme
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    Choose between light and dark mode
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

            {/* 4. About App Card */}
            <Card style={styles.sectionCard}>
              <View style={styles.appInfoRow}>
                <RoutineSathyEmblem size={38} />
                <View style={styles.appInfoText}>
                  <Text style={[styles.appName, { color: theme.colors.text }]}>
                    Routine Sathy
                  </Text>
                  <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
                    Version 1.0.0 • Daily Routine &amp; Habit Tracker
                  </Text>
                  <Text style={[styles.appSubmeta, { color: theme.colors.textMuted }]}>
                    Timezone: Asia/Kolkata • Database Connected
                  </Text>
                </View>
              </View>
            </Card>

            {/* Logout Action */}
            <Button
              title="Log Out"
              onPress={handleLogout}
              loading={loggingOut}
              variant="danger"
              size="lg"
              pill
              fullWidth
              icon={<Ionicons name="log-out-outline" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />}
              style={styles.logoutButton}
            />
          </View>
        )}
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
              Enter your full name to show on your daily greeting.
            </Text>

            <TextField
              label="Full Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
              containerStyle={{ marginVertical: 14 }}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                pill
                onPress={() => setEditProfileModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save"
                variant="primary"
                size="md"
                pill
                loading={savingProfile}
                onPress={handleSaveProfile}
                style={{ flex: 1 }}
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
              Enter your current password and choose a new one.
            </Text>

            {passwordError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorBoxText}>{passwordError}</Text>
              </View>
            ) : null}

            <TextField
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              placeholder="••••••••"
              containerStyle={{ marginTop: 12 }}
            />

            <TextField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              placeholder="At least 6 characters"
              containerStyle={{ marginTop: 10 }}
            />

            <TextField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              placeholder="••••••••"
              containerStyle={{ marginTop: 10, marginBottom: 16 }}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                pill
                onPress={() => setPasswordModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Update Password"
                variant="primary"
                size="md"
                pill
                loading={savingPassword}
                onPress={handleChangePassword}
                style={{ flex: 1 }}
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
    zIndex: 10,
    paddingBottom: 4,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  tabSwitchActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabSwitchText: {
    fontSize: 13,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
  },
  content: {
    width: '100%',
    gap: 14,
  },
  userCard: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 0,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13.5,
    marginTop: 3,
  },
  badgeAndEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 18,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  editNameBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  metricsStrip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  securityRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  securityRowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  securityRowSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  goalAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  goalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  goalStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalValText: {
    fontSize: 13.5,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  divider: {
    height: 1,
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  settingToggleInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingToggleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  settingToggleSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  settingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  quietPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  quietPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  appSubmeta: {
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginTop: 10,
  },
  errorBoxText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
});
