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
  { id: 'meditation', name: 'Meditation / Mindfulness', type: 'boolean', icon: 'leaf-outline', enabled: true },
  { id: 'reading', name: 'Reading', type: 'boolean', icon: 'book-outline', enabled: true },
];

/**
 * Curated brand palette for habits matching Today dashboard
 */
function getHabitBrandMeta(name: string): {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return {
      icon: 'barbell',
      iconColor: '#EA580C', // Sunrise Orange
      tileBg: '#FFF7ED',
    };
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return {
      icon: 'leaf',
      iconColor: '#059669', // Sacred Botanical Green
      tileBg: '#ECFDF5',
    };
  }
  if (lower.includes('read') || lower.includes('book') || lower.includes('study')) {
    return {
      icon: 'book',
      iconColor: '#4F46E5', // Deep Insight Indigo
      tileBg: '#EEF2FF',
    };
  }
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
    return {
      icon: 'water',
      iconColor: '#0284C7', // Pure Sky Flow
      tileBg: '#F0F9FF',
    };
  }
  if (lower.includes('walk') || lower.includes('run') || lower.includes('step')) {
    return {
      icon: 'footsteps',
      iconColor: '#0D9488', // Earth Teal
      tileBg: '#F0FDFA',
    };
  }
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night')) {
    return {
      icon: 'moon',
      iconColor: '#7C3AED', // Twilight Violet
      tileBg: '#F5F3FF',
    };
  }
  return {
    icon: 'sparkles',
    iconColor: '#D97706', // Golden Dawn Spark
    tileBg: '#FEF3C7',
  };
}

export default function AddRoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 460;
  const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 20;

  // Practical defaults
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMin, setWakeMin] = useState(0);
  const [waterIntake, setWaterIntake] = useState(2.0);
  const [studyHours, setStudyHours] = useState(4.0);
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(
    new Set(['workout', 'meditation', 'reading'])
  );
  // Track existing completion state so editing targets never resets completed habits
  const [existingCompletionMap, setExistingCompletionMap] = useState<
    Record<string, boolean | string | number>
  >({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load defaults and today's existing routine (if in Edit mode)
  useEffect(() => {
    async function loadDefaults() {
      try {
        const [todayRoutineRes, serverHabitsRes, serverGoalsRes] = await Promise.allSettled([
          routineService.getTodayRoutine(),
          routineService.getUserHabits(),
          routineService.getUserGoals(),
        ]);

        // 1. Process habits list with deduplication by name
        if (serverHabitsRes.status === 'fulfilled' && serverHabitsRes.value.length > 0) {
          const seen = new Set<string>();
          const deduped: HabitItem[] = [];
          for (const h of serverHabitsRes.value) {
            const key = h.name.trim().toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(h);
            }
          }
          setHabits(deduped);
        }

        // 2. If today's routine exists, prefill from it (Edit mode)
        if (todayRoutineRes.status === 'fulfilled' && todayRoutineRes.value) {
          const r = todayRoutineRes.value;
          if (r.wakeUpTime) {
            const [h, m] = r.wakeUpTime.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              setWakeHour(h);
              setWakeMin(m);
            }
          }
          if (r.waterIntake !== undefined && r.waterIntake > 0) {
            setWaterIntake(r.waterIntake);
          }
          if (r.studyHours !== undefined && r.studyHours > 0) {
            setStudyHours(r.studyHours);
          }
          if (r.activities && r.activities.length > 0) {
            const activeIds = new Set<string>();
            const compMap: Record<string, boolean | string | number> = {};
            r.activities.forEach((act) => {
              const id = act.activityId || act.name;
              activeIds.add(id);
              compMap[id] = act.value;
              compMap[act.name] = act.value;
            });
            setSelectedHabitIds(activeIds);
            setExistingCompletionMap(compMap);
            return;
          }
        }

        // 3. Fallback to user goals if no routine logged yet today
        if (serverGoalsRes.status === 'fulfilled' && serverGoalsRes.value) {
          const g = serverGoalsRes.value;
          if (g.targetWakeUp) {
            const [h, m] = g.targetWakeUp.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              setWakeHour(h);
              setWakeMin(m);
            }
          }
          if (g.targetWater) setWaterIntake(g.targetWater);
          if (g.targetStudy) setStudyHours(g.targetStudy);
        }

        if (serverHabitsRes.status === 'fulfilled' && serverHabitsRes.value.length > 0) {
          const enabledIds = new Set(
            serverHabitsRes.value.filter((h) => h.enabled).map((h) => h.id)
          );
          if (enabledIds.size > 0) setSelectedHabitIds(enabledIds);
        }
      } catch {
        // Safe fallback to practical defaults
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
    setWaterIntake((prev) => Math.max(0.5, Math.min(6.0, Math.round((prev + delta) * 10) / 10)));
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

    // Build activities preserving existing completion state
    const activities: RoutineActivity[] = habits
      .filter((h) => selectedHabitIds.has(h.id))
      .map((h) => ({
        activityId: h.id,
        name: h.name,
        value: existingCompletionMap[h.id] ?? existingCompletionMap[h.name] ?? false,
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
      router.replace('/(tabs)/today');
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
            onPress={() => router.replace('/(tabs)/today')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
                borderColor: theme.isDark ? '#334155' : '#E2E8F0',
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <View
            style={[
              styles.datePill,
              {
                backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
                borderColor: theme.isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text style={[styles.dateBadgeText, { color: theme.colors.textSecondary }]}>
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
              paddingBottom: Math.max(insets.bottom + 36, 44),
              paddingLeft: insets.left + horizontalPadding,
              paddingRight: insets.right + horizontalPadding,
            },
          ]}>
          {/* Header Title Section */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>DAILY ANCHORS</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Plan Today&apos;s Routine
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Set simple daily targets and choose your focus habits.
            </Text>
          </View>

          {/* Section 1: Unified Daily Targets */}
          <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>
            DAILY TARGETS
          </Text>

          <Card style={styles.groupedCard}>
            {/* Row 1: Wake-up Time Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetLeft}>
                <View style={[styles.targetIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="sunny" size={18} color="#D97706" />
                </View>
                <View style={styles.targetInfo}>
                  <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Wake-up</Text>
                  <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                    Morning rise anchor
                  </Text>
                </View>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustWakeTime(-15)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {formattedWakeTime}
                </Text>

                <Pressable
                  onPress={() => adjustWakeTime(15)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.isDark ? '#334155' : '#F1F5F9' }]} />

            {/* Row 2: Hydration Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetLeft}>
                <View style={[styles.targetIconCircle, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="water" size={18} color="#0284C7" />
                </View>
                <View style={styles.targetInfo}>
                  <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Water</Text>
                  <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                    Daily hydration goal
                  </Text>
                </View>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustWater(-0.5)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {waterIntake.toFixed(1)} L
                </Text>

                <Pressable
                  onPress={() => adjustWater(0.5)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.isDark ? '#334155' : '#F1F5F9' }]} />

            {/* Row 3: Deep Focus Stepper */}
            <View style={styles.targetRow}>
              <View style={styles.targetLeft}>
                <View style={[styles.targetIconCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="hourglass" size={18} color="#7C3AED" />
                </View>
                <View style={styles.targetInfo}>
                  <Text style={[styles.targetTitle, { color: theme.colors.text }]}>Focus</Text>
                  <Text style={[styles.targetSubtitle, { color: theme.colors.textSecondary }]}>
                    Study &amp; deep work hours
                  </Text>
                </View>
              </View>

              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => adjustStudy(-0.5)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </Pressable>

                <Text style={[styles.stepperValueText, { color: theme.colors.text }]}>
                  {studyHours.toFixed(1)} h
                </Text>

                <Pressable
                  onPress={() => adjustStudy(0.5)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    {
                      backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>
          </Card>

          {/* Section 2: Habits Selection */}
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>
              TODAY&apos;S HABITS
            </Text>
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                  borderColor: theme.isDark ? '#065F46' : '#A7F3D0',
                },
              ]}>
              <Text style={styles.countBadgeText}>{selectedHabitIds.size} ACTIVE</Text>
            </View>
          </View>

          <Card style={styles.groupedCard}>
            {habits.map((habit, index) => {
              const isSelected = selectedHabitIds.has(habit.id);
              const isLast = index === habits.length - 1;
              const meta = getHabitBrandMeta(habit.name);

              return (
                <React.Fragment key={habit.id}>
                  <Pressable
                    onPress={() => toggleHabit(habit.id)}
                    style={({ pressed }) => [
                      styles.habitRow,
                      pressed && { opacity: 0.75 },
                    ]}>
                    <View style={styles.habitLeft}>
                      {/* Habit Icon Circle */}
                      <View
                        style={[
                          styles.habitIconCircle,
                          {
                            backgroundColor: theme.isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : meta.tileBg,
                          },
                        ]}>
                        <Ionicons name={meta.icon} size={18} color={meta.iconColor} />
                      </View>

                      {/* Habit Name */}
                      <Text
                        style={[
                          styles.habitRowName,
                          {
                            color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {habit.name}
                      </Text>
                    </View>

                    {/* Clean Checkbox Indicator */}
                    {isSelected ? (
                      <View style={styles.checkFilledCircle}>
                        <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.checkEmptyCircle,
                          { borderColor: theme.isDark ? '#475569' : '#CBD5E1' },
                        ]}
                      />
                    )}
                  </Pressable>

                  {!isLast && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.isDark ? '#334155' : '#F1F5F9' },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Card>

          {/* Clean CTA Save Button */}
          <Button
            title="Save Routine"
            onPress={handleSave}
            loading={loading}
            variant="primary"
            size="lg"
            pill
            fullWidth
            icon={<Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
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
    height: 52,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dateBadgeText: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
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
    marginBottom: 22,
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
  },
  groupLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  groupedCard: {
    padding: 2,
    borderRadius: 18,
    overflow: 'hidden',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  targetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
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
    paddingVertical: 12,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  habitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitRowName: {
    fontSize: 14.5,
    flex: 1,
  },
  checkFilledCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  checkEmptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  saveBtn: {
    marginTop: 26,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
