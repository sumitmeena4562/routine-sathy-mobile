import React, { useCallback, useEffect, useState } from 'react';
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
  Card,
  Toast,
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import { HabitItem, RoutineActivity } from '@/types/routine';

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'workout', name: 'Workout / Exercise', type: 'boolean', icon: 'barbell-outline', enabled: true },
  { id: 'meditation', name: 'Mindfulness & Meditation', type: 'boolean', icon: 'leaf-outline', enabled: true },
  { id: 'reading', name: 'Reading Book (20 mins)', type: 'boolean', icon: 'book-outline', enabled: true },
];

export default function AddRoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 500 : 440;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 22;

  // Simple state with practical defaults
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMin, setWakeMin] = useState(30);
  const [waterIntake, setWaterIntake] = useState(3.0);
  const [studyHours, setStudyHours] = useState(4.0);
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(
    new Set(['workout', 'meditation', 'reading'])
  );

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load user goals on mount
  useEffect(() => {
    async function loadDefaults() {
      try {
        const [serverHabits, serverGoals] = await Promise.allSettled([
          routineService.getUserHabits(),
          routineService.getUserGoals(),
        ]);

        if (serverHabits.status === 'fulfilled' && serverHabits.value.length > 0) {
          setHabits(serverHabits.value);
          const enabledIds = new Set(
            serverHabits.value.filter((h) => h.enabled).map((h) => h.id)
          );
          setSelectedHabitIds(enabledIds);
        }

        if (serverGoals.status === 'fulfilled' && serverGoals.value) {
          if (serverGoals.value.targetWakeUp) {
            const [h, m] = serverGoals.value.targetWakeUp.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              setWakeHour(h);
              setWakeMin(m);
            }
          }
          if (serverGoals.value.targetWater) setWaterIntake(serverGoals.value.targetWater);
          if (serverGoals.value.targetStudy) setStudyHours(serverGoals.value.targetStudy);
        }
      } catch {
        // Fallback to local defaults
      }
    }
    loadDefaults();
  }, []);

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

  const adjustWakeTime = (deltaMinutes: number) => {
    triggerHaptic('light');
    let totalMins = wakeHour * 60 + wakeMin + deltaMinutes;
    // Bound between 04:00 AM (240 mins) and 10:00 AM (600 mins)
    totalMins = Math.max(240, Math.min(600, totalMins));
    setWakeHour(Math.floor(totalMins / 60));
    setWakeMin(totalMins % 60);
  };

  const adjustWater = (delta: number) => {
    triggerHaptic('light');
    setWaterIntake((prev) => Math.max(1.0, Math.min(6.0, Math.round((prev + delta) * 10) / 10)));
  };

  const adjustStudy = (delta: number) => {
    triggerHaptic('light');
    setStudyHours((prev) => Math.max(0.5, Math.min(12.0, Math.round((prev + delta) * 10) / 10)));
  };

  const toggleHabit = (id: string) => {
    triggerHaptic('light');
    setSelectedHabitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formattedWakeTime = `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`;

  const handleSave = async () => {
    triggerHaptic('light');
    setLoading(true);
    setToast(null);

    const activities: RoutineActivity[] = habits
      .filter((h) => selectedHabitIds.has(h.id))
      .map((h) => ({
        activityId: h.id,
        name: h.name,
        value: false,
      }));

    try {
      await routineService.saveRoutine({
        date: getTodayDateString(),
        wakeUpTime: formattedWakeTime,
        waterIntake,
        studyHours,
        activities,
      });

      triggerHaptic('success');
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save routine. Please try again.';
      setToast({ visible: true, type: 'error', message: msg });
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

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

      {/* Clean Top Bar */}
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
            onPress={() => router.replace('/(tabs)')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: theme.colors.backgroundElement,
                borderColor: theme.colors.borderSubtle,
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <Text style={[styles.dateBadgeText, { color: theme.colors.textSecondary }]}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: containerMaxWidth,
              paddingBottom: Math.max(insets.bottom + 28, 40),
              paddingLeft: insets.left + horizontalPadding,
              paddingRight: insets.right + horizontalPadding,
            },
          ]}>
          {/* Minimal Clean Title */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Plan Today&apos;s Routine
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Set simple daily targets and choose your focus habits.
            </Text>
          </View>

          {/* Section 1: Unified Grouped Daily Targets */}
          <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>
            DAILY TARGETS
          </Text>

          <Card style={styles.groupedCard}>
            {/* Row 1: Wake-up Time Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetInfo}>
                <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Wake-up</Text>
                <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                  Morning rise anchor
                </Text>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustWakeTime(-15)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="remove" size={18} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {formattedWakeTime}
                </Text>

                <Pressable
                  onPress={() => adjustWakeTime(15)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="add" size={18} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* Row 2: Hydration Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetInfo}>
                <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Water</Text>
                <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                  Daily hydration goal
                </Text>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustWater(-0.5)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="remove" size={18} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {waterIntake.toFixed(1)} L
                </Text>

                <Pressable
                  onPress={() => adjustWater(0.5)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="add" size={18} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* Row 3: Deep Focus Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetInfo}>
                <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Focus</Text>
                <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                  Study &amp; deep work hours
                </Text>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustStudy(-0.5)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="remove" size={18} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {studyHours.toFixed(1)} h
                </Text>

                <Pressable
                  onPress={() => adjustStudy(0.5)}
                  hitSlop={8}
                  style={[styles.stepperBtn, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="add" size={18} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>
          </Card>

          {/* Section 2: Habits Selection */}
          <Text style={[styles.groupLabel, { color: theme.colors.textSecondary, marginTop: 22 }]}>
            TODAY&apos;S HABITS ({selectedHabitIds.size} ACTIVE)
          </Text>

          <Card style={styles.groupedCard}>
            {habits.map((habit, index) => {
              const isSelected = selectedHabitIds.has(habit.id);
              const isLast = index === habits.length - 1;
              return (
                <React.Fragment key={habit.id}>
                  <Pressable
                    onPress={() => toggleHabit(habit.id)}
                    style={({ pressed }) => [
                      styles.habitRow,
                      pressed && { opacity: 0.7 },
                    ]}>
                    <Text
                      style={[
                        styles.habitRowName,
                        {
                          color: isSelected ? theme.colors.text : theme.colors.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {habit.name}
                    </Text>

                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </Pressable>

                  {!isLast && (
                    <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
                  )}
                </React.Fragment>
              );
            })}
          </Card>

          {/* Clean CTA Button */}
          <Button
            title="Save Routine"
            onPress={handleSave}
            loading={loading}
            variant="primary"
            size="lg"
            pill
            fullWidth
            style={styles.saveBtn}
          />
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
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
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
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupedCard: {
    padding: 4,
    borderRadius: 16,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  targetInfo: {
    flex: 1,
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  targetSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  stepperValueText: {
    fontSize: 14.5,
    fontWeight: '700',
    minWidth: 54,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  habitRowName: {
    fontSize: 14.5,
  },
  saveBtn: {
    marginTop: 24,
  },
});
