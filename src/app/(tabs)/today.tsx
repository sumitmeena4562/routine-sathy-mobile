import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  AmbientAtmosphere,
  Button,
  Card,
  HabitCheckControl,
  ProgressBar,
  Toast,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import { RoutineActivity, RoutineData } from '@/types/routine';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getHabitMeta(name: string): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return { icon: 'barbell-outline', color: '#F97316', bg: '#FFF7ED' };
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return { icon: 'leaf-outline', color: '#10B981', bg: '#ECFDF5' };
  }
  if (lower.includes('read') || lower.includes('book') || lower.includes('study')) {
    return { icon: 'book-outline', color: '#8B5CF6', bg: '#F5F3FF' };
  }
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
    return { icon: 'water-outline', color: '#0EA5E9', bg: '#F0F9FF' };
  }
  if (lower.includes('walk') || lower.includes('run') || lower.includes('step')) {
    return { icon: 'footsteps-outline', color: '#14B8A6', bg: '#F0FDFA' };
  }
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night')) {
    return { icon: 'moon-outline', color: '#6366F1', bg: '#EEF2FF' };
  }
  return { icon: 'sparkles-outline', color: '#059669', bg: '#ECFDF5' };
}

function getCircadianPhase(): {
  phase: string;
  window: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  description: string;
  actionTip: string;
} {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      phase: 'Morning Awakening & Cortisol Surge',
      window: 'Optimal Window • 6:00 AM - 10:00 AM',
      icon: 'sunny-outline',
      iconColor: '#F59E0B',
      description: 'Morning natural sunlight anchors your master clock, stops melatonin, and ignites full daytime focus.',
      actionTip: 'Get 10-15 mins of outdoor sunlight',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      phase: 'Deep Work & Cognitive Peak',
      window: 'Peak Window • 1:00 PM - 5:00 PM',
      icon: 'flash-outline',
      iconColor: '#0EA5E9',
      description: 'Alertness and core temperature peak. Tackle your most demanding tasks and keep hydration high.',
      actionTip: 'Hydrate + take a 5-min walk',
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      phase: 'Evening Wind-Down & Melatonin Prep',
      window: 'Recovery Window • 7:30 PM - 10:00 PM',
      icon: 'partly-sunny-outline',
      iconColor: '#6366F1',
      description: 'Dim overhead bright lights and minimize screen glare to cue natural sleep hormone production.',
      actionTip: 'Switch to warm, low ambient lighting',
    };
  }
  return {
    phase: 'Cellular Restoration & Deep Sleep',
    window: 'Sleep Window • 10:30 PM - 6:00 AM',
    icon: 'moon-outline',
    iconColor: '#8B5CF6',
    description: 'Deep sleep flushes neural metabolic waste and consolidates memory. Keep your space cool and dark.',
    actionTip: 'Keep bedroom cool (~19°C) and completely dark',
  };
}

export default function TodayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 440;
  const horizontalPadding = isTablet ? 32 : isCompact ? 18 : 22;

  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fetchRoutine = useCallback(async () => {
    try {
      const data = await routineService.getTodayRoutine(getTodayDateString());
      setRoutine(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRoutine();
    }, [fetchRoutine])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoutine();
  }, [fetchRoutine]);

  const triggerHaptic = useCallback((type: 'light' | 'success') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, []);

  const handleToggleHabit = async (activityId: string, currentVal: boolean) => {
    if (!routine) return;

    triggerHaptic(currentVal ? 'light' : 'success');

    const updatedActivities: RoutineActivity[] = routine.activities.map((act) => {
      if (act.activityId === activityId) {
        return { ...act, value: !currentVal };
      }
      return act;
    });

    setRoutine({
      ...routine,
      activities: updatedActivities,
    });

    try {
      const updated = await routineService.saveRoutine({
        date: routine.date,
        wakeUpTime: routine.wakeUpTime,
        waterIntake: routine.waterIntake,
        studyHours: routine.studyHours,
        activities: updatedActivities,
      });
      setRoutine(updated);
    } catch {
      setToast({
        visible: true,
        type: 'error',
        message: 'Could not sync habit completion.',
      });
      fetchRoutine();
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const greeting = getTimeGreeting();

  const totalHabits = routine?.activities?.length || 0;
  const completedHabits =
    routine?.activities?.filter((a) => Boolean(a.value)).length || 0;
  const progressRatio = totalHabits > 0 ? completedHabits / totalHabits : 0;
  const score = Math.round(routine?.score || 0);

  const circadian = getCircadianPhase();

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

      {/* Clean Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.headerBarInner, { maxWidth: containerMaxWidth }]}>
          <View>
            <Text style={[styles.dateSub, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {greeting}, {firstName}
            </Text>
          </View>

          {routine && (
            <Pressable
              onPress={() => router.push('/add-routine')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Edit Routine"
              style={({ pressed }) => [
                styles.editBtn,
                {
                  backgroundColor: theme.colors.backgroundElement,
                  borderColor: theme.colors.borderSubtle,
                },
                pressed && { opacity: 0.7 },
              ]}>
              <Ionicons name="options-outline" size={15} color={theme.colors.text} />
              <Text style={[styles.editText, { color: theme.colors.text }]}>Edit</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: containerMaxWidth,
            paddingBottom: Math.max(insets.bottom + 36, 44),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading today&apos;s rhythm...
            </Text>
          </View>
        ) : !routine ? (
          /* ========================================================
             CASE A: NO ROUTINE SET
             ======================================================== */
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.backgroundElement }]}>
              <Ionicons name="sunny-outline" size={32} color={theme.colors.secondary} />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No routine set for today
            </Text>

            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Plan your morning wake-up, daily water, and active habits to keep your streak alive.
            </Text>

            <Button
              title="Plan Today's Routine"
              onPress={() => router.push('/add-routine')}
              variant="primary"
              size="lg"
              pill
              fullWidth
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          /* ========================================================
             CASE B: ACTIVE ROUTINE DASHBOARD
             ======================================================== */
          <View style={styles.dashboard}>
            {/* Unified Clean Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    DAILY RHYTHM
                  </Text>
                  <Text style={[styles.scoreNumber, { color: theme.colors.text }]}>
                    {score}
                    <Text style={[styles.scoreTotal, { color: theme.colors.textMuted }]}> / 100</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.streakPill,
                    {
                      backgroundColor:
                        progressRatio === 1
                          ? theme.isDark
                            ? 'rgba(16, 185, 129, 0.15)'
                            : '#ECFDF5'
                          : theme.colors.backgroundElement,
                      borderColor:
                        progressRatio === 1
                          ? '#10B981'
                          : theme.colors.borderSubtle,
                    },
                  ]}>
                  <Ionicons
                    name={progressRatio === 1 ? 'checkmark-circle' : 'flame'}
                    size={14}
                    color={progressRatio === 1 ? '#10B981' : '#F97316'}
                  />
                  <Text
                    style={[
                      styles.streakPillText,
                      { color: progressRatio === 1 ? '#10B981' : theme.colors.text },
                    ]}>
                    {completedHabits}/{totalHabits} Done
                  </Text>
                </View>
              </View>

              {/* Polished Dynamic Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarInfoRow}>
                  <Text style={[styles.progressBarLabel, { color: theme.colors.textSecondary }]}>
                    {progressRatio === 1
                      ? 'All daily habits completed 🎉'
                      : `${completedHabits} of ${totalHabits} habits completed`}
                  </Text>
                  <Text
                    style={[
                      styles.progressBarPercent,
                      { color: progressRatio === 1 ? '#10B981' : theme.colors.text },
                    ]}>
                    {Math.round(progressRatio * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progressRatio}
                  height={8}
                  color={progressRatio === 1 ? '#10B981' : '#F59E0B'}
                  trackColor={theme.isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'}
                  style={styles.progressBar}
                />
              </View>

              {/* Minimal Metrics Strip with Icons */}
              <View style={[styles.metricsStrip, { borderTopColor: theme.colors.borderSubtle }]}>
                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="sunny-outline" size={13} color="#F59E0B" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Wake-up</Text>
                  </View>
                  <Text style={[styles.metricVal, { color: theme.colors.text }]}>
                    {routine.wakeUpTime || '—'}
                  </Text>
                </View>

                <View style={[styles.metricSep, { backgroundColor: theme.colors.borderSubtle }]} />

                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="water-outline" size={13} color="#0EA5E9" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Water</Text>
                  </View>
                  <Text style={[styles.metricVal, { color: theme.colors.text }]}>
                    {routine.waterIntake !== undefined ? `${routine.waterIntake}L` : '—'}
                  </Text>
                </View>

                <View style={[styles.metricSep, { backgroundColor: theme.colors.borderSubtle }]} />

                <View style={styles.metricItem}>
                  <View style={styles.metricLabelRow}>
                    <Ionicons name="timer-outline" size={13} color="#8B5CF6" />
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Focus</Text>
                  </View>
                  <Text style={[styles.metricVal, { color: theme.colors.text }]}>
                    {routine.studyHours !== undefined ? `${routine.studyHours}h` : '—'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Today's Habits List Header */}
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                TODAY&apos;S HABITS
              </Text>
              <Text style={[styles.sectionHeadingSub, { color: theme.colors.textMuted }]}>
                Tap to toggle
              </Text>
            </View>

            {/* Premium Grouped Habits List Card */}
            <Card style={styles.habitsGroupCard}>
              {routine.activities && routine.activities.length > 0 ? (
                routine.activities.map((act, index) => {
                  const isDone = Boolean(act.value);
                  const isLast = index === routine.activities.length - 1;
                  const meta = getHabitMeta(act.name);

                  return (
                    <React.Fragment key={act.activityId}>
                      <Pressable
                        onPress={() => handleToggleHabit(act.activityId, isDone)}
                        style={({ pressed }) => [
                          styles.habitRow,
                          pressed && { opacity: 0.75 },
                        ]}>
                        <View style={styles.habitMain}>
                          <View
                            style={[
                              styles.habitIconTile,
                              {
                                backgroundColor: theme.isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : isDone
                                  ? '#ECFDF5'
                                  : meta.bg,
                              },
                            ]}>
                            <Ionicons
                              name={meta.icon}
                              size={18}
                              color={isDone ? '#10B981' : meta.color}
                            />
                          </View>

                          <View style={styles.habitTextCol}>
                            <Text
                              style={[
                                styles.habitName,
                                {
                                  color: theme.colors.text,
                                  fontWeight: isDone ? '600' : '700',
                                },
                              ]}>
                              {act.name}
                            </Text>
                            <Text
                              style={[
                                styles.habitSubtext,
                                {
                                  color: isDone ? '#10B981' : theme.colors.textMuted,
                                },
                              ]}>
                              {isDone ? 'Completed today' : 'Tap to mark done'}
                            </Text>
                          </View>
                        </View>

                        <View pointerEvents="none">
                          <HabitCheckControl
                            completed={isDone}
                            onToggle={() => {}}
                            size={32}
                          />
                        </View>
                      </Pressable>

                      {!isLast && (
                        <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <View style={styles.noHabitsBox}>
                  <Text style={[styles.noHabitsText, { color: theme.colors.textSecondary }]}>
                    No habits planned for today. Tap Edit to add some!
                  </Text>
                </View>
              )}
            </Card>

            {/* Circadian Rhythm Biological Phase Card */}
            <View style={styles.circadianSection}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                CIRCADIAN BIOLOGICAL PHASE
              </Text>

              <Card style={styles.circadianCard}>
                <View style={styles.circadianHeader}>
                  <View style={[styles.circadianIconCircle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFC' }]}>
                    <Ionicons name={circadian.icon} size={20} color={circadian.iconColor} />
                  </View>
                  <View style={styles.circadianHeaderInfo}>
                    <Text style={[styles.circadianPhaseTitle, { color: theme.colors.text }]}>
                      {circadian.phase}
                    </Text>
                    <Text style={[styles.circadianWindowText, { color: theme.colors.textSecondary }]}>
                      {circadian.window}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.circadianDesc, { color: theme.colors.textSecondary }]}>
                  {circadian.description}
                </Text>

                <View style={[styles.tipBanner, { backgroundColor: theme.colors.backgroundElement }]}>
                  <Ionicons name="sparkles" size={14} color={circadian.iconColor} />
                  <Text style={[styles.tipText, { color: theme.colors.text }]}>
                    {circadian.actionTip}
                  </Text>
                </View>
              </Card>
            </View>

            {/* Rhythm Score Breakdown Card */}
            <View style={styles.breakdownSection}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                TODAY&apos;S RHYTHM BREAKDOWN
              </Text>

              <Card style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItemLeft}>
                    <View style={[styles.breakdownDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                      Morning Wake-up ({routine.wakeUpTime || '06:00'})
                    </Text>
                  </View>
                  <Text style={[styles.breakdownPts, { color: '#10B981' }]}>+30 pts</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItemLeft}>
                    <View style={[styles.breakdownDot, { backgroundColor: '#0EA5E9' }]} />
                    <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                      Hydration Intake ({routine.waterIntake || 0}L)
                    </Text>
                  </View>
                  <Text style={[styles.breakdownPts, { color: '#0EA5E9' }]}>+20 pts</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItemLeft}>
                    <View style={[styles.breakdownDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                      Habit Execution ({completedHabits}/{totalHabits})
                    </Text>
                  </View>
                  <Text style={[styles.breakdownPts, { color: '#8B5CF6' }]}>+35 pts</Text>
                </View>
              </Card>
            </View>
          </View>
        )}
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
    paddingBottom: 8,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateSub: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    marginBottom: 2,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 20,
    borderRadius: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 290,
  },
  emptyButton: {
    width: '100%',
  },
  dashboard: {
    width: '100%',
  },
  summaryCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 2,
  },
  scoreTotal: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  streakPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginBottom: 16,
  },
  progressBarInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  progressBarPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    borderRadius: 6,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 2,
  },
  metricSep: {
    width: 1,
    height: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sectionHeadingSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  habitsGroupCard: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 20,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  habitMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 10,
  },
  habitIconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTextCol: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  habitSubtext: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  noHabitsBox: {
    padding: 20,
    alignItems: 'center',
  },
  noHabitsText: {
    fontSize: 13,
    textAlign: 'center',
  },
  circadianSection: {
    marginBottom: 20,
  },
  circadianCard: {
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  circadianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  circadianIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circadianHeaderInfo: {
    flex: 1,
  },
  circadianPhaseTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  circadianWindowText: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  circadianDesc: {
    fontSize: 13,
    lineHeight: 18.5,
    marginBottom: 12,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  breakdownSection: {
    marginBottom: 12,
  },
  breakdownCard: {
    padding: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  breakdownPts: {
    fontSize: 13,
    fontWeight: '700',
  },
});
