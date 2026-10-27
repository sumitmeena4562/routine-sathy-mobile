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

/**
 * Curated brand palette for circadian habits.
 * Intentional, earthy, mindful colors matching sunrise, mindfulness, and deep focus.
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
    if (Platform.OS !== 'web' && user?.settings?.vibration !== false) {
      if (type === 'success') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, [user?.settings?.vibration]);

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

  // Deduplicate activities by name for clean presentation
  const seenHabitNames = new Set<string>();
  const displayActivities: RoutineActivity[] = [];
  if (routine?.activities) {
    for (const act of routine.activities) {
      const key = act.name.trim().toLowerCase();
      if (!seenHabitNames.has(key)) {
        seenHabitNames.add(key);
        displayActivities.push(act);
      }
    }
  }

  const totalHabits = displayActivities.length;
  const completedHabits =
    displayActivities.filter((a) => Boolean(a.value)).length;
  const score = Math.round(routine?.score || 0);
  const scoreProgress = Math.min(Math.max(score / 100, 0), 1);

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

      {/* Screen Header */}
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
            <Text style={styles.dateSub}>
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
                  backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: theme.isDark ? '#334155' : '#E2E8F0',
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
            tintColor="#F59E0B"
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
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Aligning today&apos;s rhythm...
            </Text>
          </View>
        ) : !routine ? (
          /* ========================================================
             CASE A: NO ROUTINE SET
             ======================================================== */
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="sunny" size={32} color="#F97316" />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No routine set for today
            </Text>

            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Set your wake-up time, water intake, and mindful habits to align your biological clock.
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
             CASE B: BESPOKE CIRCADIAN DASHBOARD
             ======================================================== */
          <View style={styles.dashboard}>
            {/* 1. Light Signature Circadian Hero Card */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                    DAILY RHYTHM
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreNumber, { color: theme.colors.text }]}>{score}</Text>
                    <Text style={[styles.scoreTotal, { color: theme.colors.textSecondary }]}> / 100</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.heroStreakPill,
                    {
                      backgroundColor:
                        completedHabits === totalHabits && totalHabits > 0
                          ? theme.isDark
                            ? 'rgba(16, 185, 129, 0.15)'
                            : '#ECFDF5'
                          : theme.isDark
                          ? 'rgba(245, 158, 11, 0.15)'
                          : '#FFFBEB',
                      borderColor:
                        completedHabits === totalHabits && totalHabits > 0
                          ? '#A7F3D0'
                          : '#FDE68A',
                    },
                  ]}>
                  <Ionicons
                    name={completedHabits === totalHabits && totalHabits > 0 ? 'checkmark-circle' : 'flame'}
                    size={14}
                    color={completedHabits === totalHabits && totalHabits > 0 ? '#059669' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.heroStreakPillText,
                      {
                        color:
                          completedHabits === totalHabits && totalHabits > 0
                            ? '#059669'
                            : '#D97706',
                      },
                    ]}>
                    {completedHabits}/{totalHabits} Done
                  </Text>
                </View>
              </View>

              {/* Progress Line */}
              <View
                style={[
                  styles.heroProgressTrack,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                ]}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${scoreProgress * 100}%`,
                      backgroundColor:
                        score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444',
                    },
                  ]}
                />
              </View>

              {/* 3 Biological Targets Strip */}
              <View
                style={[
                  styles.heroMetricsStrip,
                  { borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                ]}>
                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons name="sunny" size={13} color="#D97706" />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>Wake-up</Text>
                  </View>
                  <Text style={[styles.heroMetricVal, { color: theme.colors.text }]}>
                    {routine.wakeUpTime || '—'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroMetricSep,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                  ]}
                />

                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons name="water" size={13} color="#0284C7" />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>Water</Text>
                  </View>
                  <Text style={[styles.heroMetricVal, { color: theme.colors.text }]}>
                    {routine.waterIntake !== undefined ? `${routine.waterIntake}L` : '—'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroMetricSep,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                  ]}
                />

                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons name="hourglass" size={13} color="#7C3AED" />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>Focus</Text>
                  </View>
                  <Text style={[styles.heroMetricVal, { color: theme.colors.text }]}>
                    {routine.studyHours !== undefined ? `${routine.studyHours}h` : '—'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Today's Habits Section Header */}
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                TODAY&apos;S HABITS
              </Text>
              <Text style={[styles.sectionCountText, { color: '#059669' }]}>
                {completedHabits} of {totalHabits} completed
              </Text>
            </View>

            {/* Clean Mindful Habits List Card */}
            <View
              style={[
                styles.habitsGroupCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}>
              {displayActivities && displayActivities.length > 0 ? (
                displayActivities.map((act, index) => {
                  const isDone = Boolean(act.value);
                  const isLast = index === displayActivities.length - 1;
                  const meta = getHabitBrandMeta(act.name);

                  return (
                    <React.Fragment key={act.activityId}>
                      <Pressable
                        onPress={() => handleToggleHabit(act.activityId, isDone)}
                        style={({ pressed }) => [
                          styles.habitRow,
                          pressed && { opacity: 0.75 },
                        ]}>
                        <View style={styles.habitLeft}>
                          {/* Distinct Crafted Habit Icon Tile */}
                          <View
                            style={[
                              styles.habitIconCircle,
                              {
                                backgroundColor: theme.isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : meta.tileBg,
                              },
                            ]}>
                            <Ionicons
                              name={meta.icon}
                              size={18}
                              color={meta.iconColor}
                            />
                          </View>

                          {/* Habit Name */}
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
                        </View>

                        {/* Interactive Habit Completion Check */}
                        <View pointerEvents="none">
                          <HabitCheckControl
                            completed={isDone}
                            onToggle={() => {}}
                            size={32}
                          />
                        </View>
                      </Pressable>

                      {!isLast && (
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <View style={styles.noHabitsBox}>
                  <Text style={[styles.noHabitsText, { color: theme.colors.textSecondary }]}>
                    No habits planned for today. Tap Edit to customize.
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Subtle Mindful Circadian Ribbon */}
            <View
              style={[
                styles.circadianRibbon,
                {
                  backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.ribbonIconCircle}>
                <Ionicons name="sunny-outline" size={17} color="#D97706" />
              </View>
              <View style={styles.ribbonTextCol}>
                <Text style={[styles.ribbonTitle, { color: theme.colors.text }]}>
                  Circadian Harmony
                </Text>
                <Text style={[styles.ribbonSub, { color: theme.colors.textSecondary }]}>
                  {completedHabits === totalHabits && totalHabits > 0
                    ? 'All habits completed! Natural melatonin release supported tonight.'
                    : 'Consistent wake-up and daily habits keep your biological clock in sync.'}
                </Text>
              </View>
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
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#D97706', // Warm Amber Sunrise
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  /* Signature Light Circadian Hero Card */
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreTotal: {
    fontSize: 18,
    fontWeight: '600',
  },
  heroStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
  },
  heroStreakPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  heroMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroMetricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  heroMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  heroMetricSep: {
    width: 1,
    height: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  habitsGroupCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  habitLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 10,
  },
  habitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    letterSpacing: -0.2,
    flex: 1,
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
  circadianRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  ribbonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7', // Soft warm sunrise
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonTextCol: {
    flex: 1,
  },
  ribbonTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  ribbonSub: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
});
