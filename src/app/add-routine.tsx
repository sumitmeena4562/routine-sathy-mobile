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
  RoutineSathyEmblem,
  Toast,
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import { HabitItem, RoutineActivity } from '@/types/routine';

const WAKE_PRESETS = ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00'];
const WATER_PRESETS = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
const STUDY_PRESETS = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'workout', name: 'Workout / Exercise', type: 'boolean', icon: 'barbell-outline', enabled: true },
  { id: 'meditation', name: 'Mindfulness / Meditation', type: 'boolean', icon: 'leaf-outline', enabled: true },
  { id: 'reading', name: 'Reading Book (20 mins)', type: 'boolean', icon: 'book-outline', enabled: true },
];

export default function AddRoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 440;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 24;

  const [wakeUpTime, setWakeUpTime] = useState('06:30');
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

  // Load user default habits & goals on mount
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
          if (serverGoals.value.targetWakeUp) setWakeUpTime(serverGoals.value.targetWakeUp);
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

  const toggleHabitSelection = (id: string) => {
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

  const handleSaveRoutine = async () => {
    triggerHaptic('light');
    setLoading(true);
    setToast(null);

    const activities: RoutineActivity[] = habits
      .filter((h) => selectedHabitIds.has(h.id))
      .map((h) => ({
        activityId: h.id,
        name: h.name,
        value: false, // Initially uncompleted for today
      }));

    try {
      await routineService.saveRoutine({
        date: getTodayDateString(),
        wakeUpTime,
        waterIntake,
        studyHours,
        activities,
      });

      triggerHaptic('success');
      setToast({
        visible: true,
        type: 'success',
        message: 'Today&apos;s routine planned successfully!',
      });

      // Redirect to main Tabs dashboard
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save routine. Please try again.';
      setToast({
        visible: true,
        type: 'error',
        message: msg,
      });
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

      {/* Top Bar */}
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
            accessibilityLabel="Cancel"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.colors.backgroundElement,
                borderColor: theme.colors.borderSubtle,
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={13} color={theme.colors.secondary} />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.emblemWrapper}>
              <RoutineSathyEmblem size={isCompact ? 44 : 52} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Plan Today&apos;s Rhythm
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Set your morning wake-up, daily water, focus hours, and choose your active habits for today.
            </Text>
          </View>

          {/* Section 1: Wake-up Target */}
          <Card style={styles.cardSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                <Ionicons name="alarm-outline" size={18} color="#F97316" />
              </View>
              <View style={styles.sectionTitleText}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Wake-up Time</Text>
                <Text style={[styles.sectionCaption, { color: theme.colors.textSecondary }]}>
                  Natural morning rise anchor
                </Text>
              </View>
              <Text style={[styles.selectedValueText, { color: theme.colors.primary }]}>
                {wakeUpTime}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {WAKE_PRESETS.map((time) => {
                const selected = wakeUpTime === time;
                return (
                  <Pressable
                    key={time}
                    onPress={() => {
                      triggerHaptic('light');
                      setWakeUpTime(time);
                    }}
                    style={[
                      styles.pillButton,
                      {
                        backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundElement,
                        borderColor: selected ? theme.colors.primary : theme.colors.borderSubtle,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        { color: selected ? theme.colors.primaryForeground : theme.colors.text },
                      ]}>
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>

          {/* Section 2: Water Target */}
          <Card style={styles.cardSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                <Ionicons name="water-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.sectionTitleText}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Hydration</Text>
                <Text style={[styles.sectionCaption, { color: theme.colors.textSecondary }]}>
                  Cellular energy and focus
                </Text>
              </View>
              <Text style={[styles.selectedValueText, { color: '#0284C7' }]}>
                {waterIntake.toFixed(1)} L
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {WATER_PRESETS.map((vol) => {
                const selected = waterIntake === vol;
                return (
                  <Pressable
                    key={vol}
                    onPress={() => {
                      triggerHaptic('light');
                      setWaterIntake(vol);
                    }}
                    style={[
                      styles.pillButton,
                      {
                        backgroundColor: selected ? '#0284C7' : theme.colors.backgroundElement,
                        borderColor: selected ? '#0284C7' : theme.colors.borderSubtle,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        { color: selected ? '#FFFFFF' : theme.colors.text },
                      ]}>
                      {vol.toFixed(1)} L
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>

          {/* Section 3: Deep Focus Hours */}
          <Card style={styles.cardSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="book-outline" size={18} color="#10B981" />
              </View>
              <View style={styles.sectionTitleText}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Deep Focus Target</Text>
                <Text style={[styles.sectionCaption, { color: theme.colors.textSecondary }]}>
                  Productivity and learning hours
                </Text>
              </View>
              <Text style={[styles.selectedValueText, { color: '#10B981' }]}>
                {studyHours.toFixed(1)} hrs
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {STUDY_PRESETS.map((hrs) => {
                const selected = studyHours === hrs;
                return (
                  <Pressable
                    key={hrs}
                    onPress={() => {
                      triggerHaptic('light');
                      setStudyHours(hrs);
                    }}
                    style={[
                      styles.pillButton,
                      {
                        backgroundColor: selected ? '#10B981' : theme.colors.backgroundElement,
                        borderColor: selected ? '#10B981' : theme.colors.borderSubtle,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        { color: selected ? '#FFFFFF' : theme.colors.text },
                      ]}>
                      {hrs.toFixed(1)} h
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>

          {/* Section 4: Daily Habits Selection */}
          <Card style={styles.cardSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(15, 23, 42, 0.08)' }]}>
                <Ionicons name="checkbox-outline" size={18} color={theme.colors.text} />
              </View>
              <View style={styles.sectionTitleText}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today&apos;s Habits</Text>
                <Text style={[styles.sectionCaption, { color: theme.colors.textSecondary }]}>
                  Select habits you will complete today
                </Text>
              </View>
              <Text style={[styles.selectedValueText, { color: theme.colors.secondary }]}>
                {selectedHabitIds.size} Active
              </Text>
            </View>

            <View style={styles.habitsList}>
              {habits.map((habit) => {
                const active = selectedHabitIds.has(habit.id);
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => toggleHabitSelection(habit.id)}
                    style={[
                      styles.habitItem,
                      {
                        backgroundColor: active ? theme.colors.backgroundSelected : theme.colors.surface,
                        borderColor: active ? theme.colors.primary : theme.colors.borderSubtle,
                      },
                    ]}>
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={active ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.habitName,
                        {
                          color: active ? theme.colors.text : theme.colors.textSecondary,
                          fontWeight: active ? '700' : '500',
                        },
                      ]}>
                      {habit.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            title="Save Today's Routine"
            onPress={handleSaveRoutine}
            loading={loading}
            variant="primary"
            size={isCompact ? 'md' : 'lg'}
            pill
            fullWidth
            style={styles.saveButton}
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
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
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 340,
  },
  cardSection: {
    marginBottom: 14,
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCaption: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedValueText: {
    fontSize: 15,
    fontWeight: '800',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  habitsList: {
    gap: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  habitName: {
    fontSize: 14,
  },
  saveButton: {
    marginTop: 10,
  },
});
