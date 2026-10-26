import React, { useCallback, useState } from 'react';
import {
  Alert,
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
  Card,
  RoutineSathyEmblem,
  Toast,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 540 : 440;
  const horizontalPadding = isTablet ? 32 : 22;

  const [loggingOut, setLoggingOut] = useState(false);
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
        'Are you sure you want to log out of Routine Sathy?',
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
            paddingTop: insets.top + 10,
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.headerBarInner, { maxWidth: containerMaxWidth }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Account &amp; Settings
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: containerMaxWidth,
            paddingBottom: insets.bottom + 24,
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={styles.content}>
          {/* User Profile Card */}
          <Card style={styles.userCard}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarInitials, { color: theme.colors.primaryForeground }]}>
                {getInitials(user?.name)}
              </Text>
            </View>

            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || 'Routine Sathy User'}
            </Text>

            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {user?.email || '—'}
            </Text>

            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: theme.colors.backgroundElement,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}>
              <Ionicons name="shield-checkmark" size={13} color={theme.colors.secondary} />
              <Text style={[styles.roleText, { color: theme.colors.textSecondary }]}>
                {user?.role === 'admin' ? 'Admin Access' : 'Verified Member'}
              </Text>
            </View>
          </Card>

          {/* Theme Preferences */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="moon-outline" size={18} color={theme.colors.text} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Appearance
              </Text>
            </View>

            <View style={styles.themeOptionsRow}>
              {(['system', 'light', 'dark'] as const).map((mode) => {
                const active = preference === mode;
                const label = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';
                const iconName =
                  mode === 'system'
                    ? 'phone-portrait-outline'
                    : mode === 'light'
                    ? 'sunny-outline'
                    : 'moon-outline';

                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      triggerHaptic('light');
                      setPreference(mode);
                    }}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: active
                          ? theme.colors.primary
                          : theme.colors.backgroundElement,
                        borderColor: active ? theme.colors.primary : theme.colors.borderSubtle,
                      },
                    ]}>
                    <Ionicons
                      name={iconName}
                      size={16}
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

          {/* App Info Card */}
          <Card style={styles.sectionCard}>
            <View style={styles.appInfoRow}>
              <RoutineSathyEmblem size={36} />
              <View style={styles.appInfoText}>
                <Text style={[styles.appName, { color: theme.colors.text }]}>Routine Sathy</Text>
                <Text style={[styles.appVersion, { color: theme.colors.textMuted }]}>
                  Version 1.0.0 • Mindful Daily Rhythm
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
            icon={<Ionicons name="log-out-outline" size={19} color="#FFFFFF" />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    zIndex: 10,
    paddingBottom: 10,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 10,
  },
  content: {
    width: '100%',
    gap: 14,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
    marginTop: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
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
    paddingVertical: 10,
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
  logoutButton: {
    marginTop: 8,
  },
});
