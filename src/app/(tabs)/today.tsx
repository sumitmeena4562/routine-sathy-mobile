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

import {
  AmbientAtmosphere,
  Button,
  Card,
  HabitCheckControl,
  SathyCompanionCard,
  StreakPath,
  Toast,
} from '@/components/ui';
import { DayStreakItem } from '@/components/ui/StreakPath';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import {
  RoutineActivity,
  RoutineData,
  RoutineStats,
  TrendDay,
  UserGoals,
} from '@/types/routine';
import { triggerHaptic } from '@/utils/haptics';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatWakeTimeDisplay(timeStr?: string | null): string {
  if (!timeStr) return '--:--';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const m = mStr ? mStr.padStart(2, '0') : '00';
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

function cleanHabitName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return 'Workout';
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return 'Meditation';
  }
  if (lower.includes('read') || lower.includes('book')) {
    return 'Reading';
  }
  return name.replace(/\s*\/\s*.*$/, '');
}

/**
 * Curated brand palette for circadian habits.
 */
function getHabitBrandMeta(name: string, isDark: boolean): {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
} {
  const lower = name.toLowerCase();

  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return {
      icon: 'barbell',
      iconColor: isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[700],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileAmber : SemanticLightTokens.color.bg.tileAmber,
    };
  }
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath')) {
    return {
      icon: 'leaf',
      iconColor: isDark ? PrimitiveTokens.color.fern[300] : PrimitiveTokens.color.fern[500],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileMint : SemanticLightTokens.color.bg.tileMint,
    };
  }
  if (lower.includes('read') || lower.includes('book')) {
    return {
      icon: 'glasses',
      iconColor: isDark ? PrimitiveTokens.color.sky[400] : PrimitiveTokens.color.sky[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileSky : SemanticLightTokens.color.bg.tileSky,
    };
  }
  if (lower.includes('study') || lower.includes('focus') || lower.includes('course')) {
    return {
      icon: 'school',
      iconColor: isDark ? PrimitiveTokens.color.indigo[400] : PrimitiveTokens.color.indigo[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileIndigo : SemanticLightTokens.color.bg.tileIndigo,
    };
  }
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
    return {
      icon: 'water',
      iconColor: isDark ? PrimitiveTokens.color.sky[400] : PrimitiveTokens.color.sky[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileSky : SemanticLightTokens.color.bg.tileSky,
    };
  }
  if (lower.includes('walk') || lower.includes('run') || lower.includes('step')) {
    return {
      icon: 'footsteps',
      iconColor: isDark ? PrimitiveTokens.color.fern[300] : PrimitiveTokens.color.fern[500],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileMint : SemanticLightTokens.color.bg.tileMint,
    };
  }
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('night')) {
    return {
      icon: 'moon',
      iconColor: isDark ? PrimitiveTokens.color.indigo[400] : PrimitiveTokens.color.indigo[600],
      tileBg: isDark ? SemanticDarkTokens.color.bg.tileIndigo : SemanticLightTokens.color.bg.tileIndigo,
    };
  }
  return {
    icon: 'sparkles',
    iconColor: isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[700],
    tileBg: isDark ? SemanticDarkTokens.color.bg.tileAmber : SemanticLightTokens.color.bg.tileAmber,
  };
}

/**
 * Distributes fractional score points into integers using the Largest Remainder Method
 * so that the sum of the components (wake + water + study) strictly equals totalScore.
 */
function distributeScorePoints(
  rawWake: number,
  rawWater: number,
  rawStudy: number,
  totalScore: number
): { wake: number; water: number; study: number } {
  if (totalScore <= 0) {
    return { wake: 0, water: 0, study: 0 };
  }

  const items = [
    { key: 'wake' as const, max: 30, floor: Math.floor(rawWake), rem: rawWake - Math.floor(rawWake) },
    { key: 'water' as const, max: 30, floor: Math.floor(rawWater), rem: rawWater - Math.floor(rawWater) },
    { key: 'study' as const, max: 40, floor: Math.floor(rawStudy), rem: rawStudy - Math.floor(rawStudy) },
  ];

  const currentSum = items[0].floor + items[1].floor + items[2].floor;
  let needed = totalScore - currentSum;

  const result = {
    wake: items[0].floor,
    water: items[1].floor,
    study: items[2].floor,
  };

  // Sort by largest remainder descending
  const sorted = [...items].sort((a, b) => b.rem - a.rem);

  for (const item of sorted) {
    if (needed > 0 && result[item.key] < item.max) {
      result[item.key] += 1;
      needed -= 1;
    }
  }

  // Safety for edge case where totalScore was clamped below floor sum
  if (needed < 0) {
    const revSorted = [...items].sort((a, b) => a.rem - b.rem);
    for (const item of revSorted) {
      if (needed < 0 && result[item.key] > 0) {
        result[item.key] -= 1;
        needed += 1;
      }
    }
  }

  return result;
}

/**
 * Continuous / Progressive Score Formula (Wake 30 · Water 30 · Study 40).
 * Matches landing page specification.
 */
function calcScoreBreakdown(
  wakeUpTime?: string | null,
  waterIntake: number = 0,
  studyHours: number = 0,
  goals?: UserGoals | null
) {
  const targetWakeUpStr = goals?.targetWakeUp || '06:00';
  const targetWater = goals?.targetWater || 3.0;
  const targetStudy = goals?.targetStudy || 4.0;

  // 1. Wake-up Score (Max 30)
  let wakePts = 0;
  if (wakeUpTime) {
    const [h, m] = wakeUpTime.split(':').map(Number);
    const wakeMinutes = (h || 0) * 60 + (m || 0);

    const [th, tm] = targetWakeUpStr.split(':').map(Number);
    const targetWakeMinutes = (th || 0) * 60 + (tm || 0);
    const limitWakeMinutes = targetWakeMinutes + 240; // 4 hours after target

    if (wakeMinutes <= targetWakeMinutes) {
      wakePts = 30;
    } else if (wakeMinutes < limitWakeMinutes) {
      const penalty = ((wakeMinutes - targetWakeMinutes) / 240) * 30;
      wakePts = Math.max(0, 30 - penalty);
    }
  }

  // 2. Water Score (Max 30)
  let waterPts = 0;
  if (waterIntake > 0 && targetWater > 0) {
    waterPts = Math.min(30, (waterIntake / targetWater) * 30);
  }

  // 3. Study Score (Max 40)
  let studyPts = 0;
  if (studyHours > 0 && targetStudy > 0) {
    studyPts = Math.min(40, (studyHours / targetStudy) * 40);
  }

  const totalScore = Math.max(0, Math.min(100, Math.round(wakePts + waterPts + studyPts)));
  const distributed = distributeScorePoints(wakePts, waterPts, studyPts, totalScore);

  return {
    rawWakePts: wakePts,
    rawWaterPts: waterPts,
    rawStudyPts: studyPts,
    wakePts: distributed.wake,
    waterPts: distributed.water,
    studyPts: distributed.study,
    totalScore,
    targetWakeUp: targetWakeUpStr,
    targetWater,
    targetStudy,
  };
}

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateWeekDays(last7DaysScores?: TrendDay[], todayScore: number = 0): DayStreakItem[] {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);

  const scoresByDate = new Map<string, number>();
  if (last7DaysScores) {
    for (const item of last7DaysScores) {
      scoresByDate.set(item.date, item.score);
    }
  }

  return daysOfWeek.map((dayLabel, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = formatLocalDate(d);
    const isToday = index === currentDayIndex;

    const recordedScore = isToday
      ? todayScore
      : scoresByDate.get(dateStr) ?? 0;

    return {
      day: dayLabel,
      date: dateStr,
      isToday,
      score: recordedScore,
      isDone: recordedScore >= 80,
    };
  });
}

export default function TodayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 540 : 440;
  const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 20;

  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [routineRes, goalsRes, statsRes] = await Promise.allSettled([
        routineService.getTodayRoutine(getTodayDateString()),
        routineService.getUserGoals(),
        routineService.getRoutineStats(),
      ]);

      if (routineRes.status === 'fulfilled') {
        setRoutine(routineRes.value);
      }
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch {
      // Fallback gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Quick Action: Add Water (+250ml or +500ml)
  const handleQuickAddWater = async (deltaLiters: number) => {
    if (!routine) return;
    triggerHaptic('medium');

    const currentWater = routine.waterIntake ?? 0;
    const nextWater = Math.max(0, Math.min(8.0, Math.round((currentWater + deltaLiters) * 100) / 100));

    const updated = {
      ...routine,
      waterIntake: nextWater,
    };
    setRoutine(updated);

    try {
      const saved = await routineService.saveRoutine({
        date: routine.date,
        wakeUpTime: routine.wakeUpTime,
        waterIntake: nextWater,
        studyHours: routine.studyHours,
        activities: routine.activities,
      });
      setRoutine(saved);
      if (deltaLiters > 0) {
        setToast({
          visible: true,
          type: 'success',
          message: `+${Math.round(deltaLiters * 1000)}ml water logged (${nextWater.toFixed(1)}L)`,
        });
      }
    } catch {
      setToast({
        visible: true,
        type: 'error',
        message: 'Could not sync water intake.',
      });
      fetchData();
    }
  };

  // Quick Action: Add Study & Focus (+30m or +1h)
  const handleQuickAddStudy = async (deltaHours: number) => {
    if (!routine) return;
    triggerHaptic('medium');

    const currentStudy = routine.studyHours ?? 0;
    const nextStudy = Math.max(0, Math.min(14.0, Math.round((currentStudy + deltaHours) * 10) / 10));

    const updated = {
      ...routine,
      studyHours: nextStudy,
    };
    setRoutine(updated);

    try {
      const saved = await routineService.saveRoutine({
        date: routine.date,
        wakeUpTime: routine.wakeUpTime,
        waterIntake: routine.waterIntake,
        studyHours: nextStudy,
        activities: routine.activities,
      });
      setRoutine(saved);
      if (deltaHours > 0) {
        setToast({
          visible: true,
          type: 'success',
          message: `+${deltaHours >= 1 ? `${deltaHours}h` : `${Math.round(deltaHours * 60)}m`} study logged (${nextStudy.toFixed(1)}h)`,
        });
      }
    } catch {
      setToast({
        visible: true,
        type: 'error',
        message: 'Could not sync study hours.',
      });
      fetchData();
    }
  };

  // Quick Action: Log Wake-up (current time or target time)
  const handleLogWakeUp = async (timeStr?: string) => {
    if (!routine) return;
    triggerHaptic('medium');

    let wakeTime = timeStr;
    if (!wakeTime) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      wakeTime = `${h}:${m}`;
    }

    const updated = {
      ...routine,
      wakeUpTime: wakeTime,
    };
    setRoutine(updated);

    try {
      const saved = await routineService.saveRoutine({
        date: routine.date,
        wakeUpTime: wakeTime,
        waterIntake: routine.waterIntake,
        studyHours: routine.studyHours,
        activities: routine.activities,
      });
      setRoutine(saved);
      setToast({
        visible: true,
        type: 'success',
        message: `Wake-up logged at ${wakeTime} (+30 pts)`,
      });
    } catch {
      setToast({
        visible: true,
        type: 'error',
        message: 'Could not log wake-up time.',
      });
      fetchData();
    }
  };

  const handleToggleHabit = async (activityId: string, currentVal: boolean) => {
    if (!routine) return;

    triggerHaptic(!currentVal ? 'medium' : 'light');

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
      fetchData();
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
  const completedHabits = displayActivities.filter((a) => Boolean(a.value)).length;

  // Real formula breakdown (Wake 30 · Water 30 · Study 40)
  const breakdown = calcScoreBreakdown(
    routine?.wakeUpTime,
    routine?.waterIntake ?? 0,
    routine?.studyHours ?? 0,
    goals
  );

  const wakeGoalMet = Boolean(routine?.wakeUpTime && breakdown.wakePts >= 30);
  const waterGoalMet = (routine?.waterIntake ?? 0) >= breakdown.targetWater;
  const studyGoalMet = (routine?.studyHours ?? 0) >= breakdown.targetStudy;
  const completedGoalsCount = (wakeGoalMet ? 1 : 0) + (waterGoalMet ? 1 : 0) + (studyGoalMet ? 1 : 0);

  const score = breakdown.totalScore;
  const scoreProgress = Math.min(Math.max(score / 100, 0), 1);
  const isScorePerfect = score >= 100;

  const weekStreakDays = generateWeekDays(stats?.last7DaysScores, score);

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
          <View style={styles.headerTitleCol}>
            {/* Amber Rule: Date uses high-contrast textSecondary/green, not faint amber */}
            <Text
              style={[
                styles.dateSub,
                {
                  color: theme.isDark
                    ? PrimitiveTokens.color.fern[300]
                    : PrimitiveTokens.color.forest[600],
                },
              ]}>
              {formattedDate}
            </Text>
            <Text
              style={[styles.title, { color: theme.colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {greeting}, {firstName}
            </Text>
          </View>

          {routine && (
            <Pressable
              onPress={() => router.push('/add-routine')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Edit Habits"
              style={({ pressed }) => [
                styles.editBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                pressed && { opacity: 0.75 },
              ]}>
              <Ionicons name="options-outline" size={15} color={theme.colors.text} />
              <Text style={[styles.editText, { color: theme.colors.text }]}>Edit Habits</Text>
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
            tintColor={theme.colors.success}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: containerMaxWidth,
            paddingBottom: Math.max(insets.bottom + 84, 96),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.success} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Aligning today&apos;s rhythm...
            </Text>
          </View>
        ) : !routine ? (
          /* ========================================================
             CASE A: EMPTY STATE - NO ROUTINE SET
             ======================================================== */
          <Card
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: theme.isDark
                    ? SemanticDarkTokens.color.bg.tileAmber
                    : SemanticLightTokens.color.bg.tileAmber,
                },
              ]}>
              <Ionicons
                name="sunny"
                size={32}
                color={
                  theme.isDark
                    ? PrimitiveTokens.color.amber[400]
                    : PrimitiveTokens.color.amber[600]
                }
              />
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
             CASE B: BESPOKE TODAY ROUTINE DASHBOARD
             ======================================================== */
          <View style={styles.dashboard}>
            {/* 1. Today's 100 Score Hero Card */}
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                    TODAY&apos;S SCORE
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreNumber, { color: theme.colors.text }]}>
                      {score}
                    </Text>
                    <Text style={[styles.scoreTotal, { color: theme.colors.textSecondary }]}>
                      {' '}/ 100
                    </Text>
                  </View>
                </View>

                {/* Score Completion Status Badge */}
                <View
                  style={[
                    styles.heroStatusPill,
                    {
                      backgroundColor: isScorePerfect
                        ? theme.isDark
                          ? SemanticDarkTokens.color.state.successBg
                          : SemanticLightTokens.color.state.successBg
                        : theme.isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : PrimitiveTokens.color.neutral[200],
                      borderColor: isScorePerfect
                        ? theme.isDark
                          ? 'rgba(91, 219, 139, 0.35)'
                          : PrimitiveTokens.color.fern[200]
                        : theme.colors.borderSubtle,
                    },
                  ]}>
                  <Ionicons
                    name={isScorePerfect ? 'checkmark-circle' : 'sparkles-outline'}
                    size={14}
                    color={
                      isScorePerfect
                        ? theme.colors.success
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.heroStatusPillText,
                      {
                        color: isScorePerfect
                          ? theme.colors.success
                          : theme.colors.textSecondary,
                      },
                    ]}>
                    {isScorePerfect ? '100 Achieved' : `${completedGoalsCount} of 3 Goals Done`}
                  </Text>
                </View>
              </View>

              {/* Real Continuous Progress Line */}
              <View
                style={[
                  styles.heroProgressTrack,
                  { backgroundColor: theme.colors.surfaceAlt },
                ]}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${scoreProgress * 100}%`,
                      backgroundColor: theme.colors.success,
                    },
                  ]}
                />
              </View>

              {/* Formula Points Breakdown: +8 · +27 · +40 */}
              <View style={styles.breakdownRow}>
                {/* 1. Wake */}
                <View
                  style={[
                    styles.breakdownChip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: wakeGoalMet
                        ? theme.isDark
                          ? 'rgba(91, 219, 139, 0.35)'
                          : PrimitiveTokens.color.fern[300]
                        : theme.colors.borderSubtle,
                      borderWidth: 1,
                    },
                  ]}>
                  <Ionicons
                    name="sunny"
                    size={12}
                    color={
                      theme.isDark
                        ? PrimitiveTokens.color.amber[400]
                        : PrimitiveTokens.color.amber[700]
                    }
                  />
                  <Text
                    style={[styles.breakdownChipTag, { color: theme.colors.textMuted }]}
                    numberOfLines={1}>
                    Wake
                  </Text>
                  <Text
                    style={[
                      styles.breakdownChipVal,
                      { color: wakeGoalMet ? theme.colors.success : theme.colors.text },
                    ]}>
                    +{breakdown.wakePts}
                  </Text>
                </View>

                {/* 2. Water */}
                <View
                  style={[
                    styles.breakdownChip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: waterGoalMet
                        ? theme.isDark
                          ? 'rgba(2, 132, 199, 0.35)'
                          : PrimitiveTokens.color.sky[200]
                        : theme.colors.borderSubtle,
                      borderWidth: 1,
                    },
                  ]}>
                  <Ionicons
                    name="water"
                    size={12}
                    color={
                      theme.isDark
                        ? PrimitiveTokens.color.sky[400]
                        : PrimitiveTokens.color.sky[600]
                    }
                  />
                  <Text
                    style={[styles.breakdownChipTag, { color: theme.colors.textMuted }]}
                    numberOfLines={1}>
                    Water
                  </Text>
                  <Text
                    style={[
                      styles.breakdownChipVal,
                      { color: waterGoalMet ? theme.colors.success : theme.colors.text },
                    ]}>
                    +{breakdown.waterPts}
                  </Text>
                </View>

                {/* 3. Study */}
                <View
                  style={[
                    styles.breakdownChip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: studyGoalMet
                        ? theme.isDark
                          ? 'rgba(79, 70, 229, 0.35)'
                          : PrimitiveTokens.color.indigo[200]
                        : theme.colors.borderSubtle,
                      borderWidth: 1,
                    },
                  ]}>
                  <Ionicons
                    name="book"
                    size={12}
                    color={
                      theme.isDark
                        ? PrimitiveTokens.color.indigo[400]
                        : PrimitiveTokens.color.indigo[600]
                    }
                  />
                  <Text
                    style={[styles.breakdownChipTag, { color: theme.colors.textMuted }]}
                    numberOfLines={1}>
                    Study
                  </Text>
                  <Text
                    style={[
                      styles.breakdownChipVal,
                      { color: studyGoalMet ? theme.colors.success : theme.colors.text },
                    ]}>
                    +{breakdown.studyPts}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Interactive Daily Anchors (Wake-up, Water, Study & Focus) */}
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                DAILY ANCHORS
              </Text>
              <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>
                Tap to log in ~10s
              </Text>
            </View>

            <View style={styles.anchorsGroup}>
              {/* Anchor A: Wake-up */}
              <View
                style={[
                  styles.anchorCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View style={styles.anchorLeft}>
                  <View
                    style={[
                      styles.anchorIconTile,
                      {
                        backgroundColor: theme.isDark
                          ? SemanticDarkTokens.color.bg.tileAmber
                          : SemanticLightTokens.color.bg.tileAmber,
                      },
                    ]}>
                    <Ionicons
                      name="sunny"
                      size={20}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.amber[400]
                          : PrimitiveTokens.color.amber[700]
                      }
                    />
                  </View>
                  <View style={styles.anchorDetails}>
                    <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                      Wake-up
                    </Text>
                    <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                      {routine.wakeUpTime
                        ? `Target: ${formatWakeTimeDisplay(breakdown.targetWakeUp)} · ${breakdown.wakePts}/30 pts`
                        : `Target: ${formatWakeTimeDisplay(breakdown.targetWakeUp)} · 0/30 pts`}
                    </Text>
                  </View>
                </View>

                {/* Wake-up Status / Action Button */}
                {routine.wakeUpTime ? (
                  <View
                    style={[
                      styles.loggedPill,
                      wakeGoalMet
                        ? {
                            backgroundColor: theme.isDark
                              ? SemanticDarkTokens.color.state.successBg
                              : SemanticLightTokens.color.state.successBg,
                            borderColor: theme.isDark
                              ? 'rgba(91, 219, 139, 0.35)'
                              : PrimitiveTokens.color.fern[200],
                            borderWidth: 1,
                          }
                        : {
                            backgroundColor: theme.colors.surfaceAlt,
                            borderColor: theme.colors.borderSubtle,
                            borderWidth: 1,
                          },
                    ]}>
                    <Ionicons
                      name={wakeGoalMet ? 'checkmark' : 'time-outline'}
                      size={13}
                      color={wakeGoalMet ? theme.colors.success : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.loggedPillText,
                        { color: wakeGoalMet ? theme.colors.success : theme.colors.textSecondary },
                      ]}>
                      {formatWakeTimeDisplay(routine.wakeUpTime)}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleLogWakeUp()}
                    accessibilityRole="button"
                    accessibilityLabel="Log Wake-up"
                    style={({ pressed }) => [
                      styles.quickActionPill,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}>
                    <Ionicons name="checkmark-sharp" size={13} color={theme.colors.text} />
                    <Text style={[styles.quickActionPillText, { color: theme.colors.text }]}>
                      Log Wake-up
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Anchor B: Water Intake */}
              <View
                style={[
                  styles.anchorCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View style={styles.anchorLeft}>
                  <View
                    style={[
                      styles.anchorIconTile,
                      {
                        backgroundColor: theme.isDark
                          ? SemanticDarkTokens.color.bg.tileSky
                          : SemanticLightTokens.color.bg.tileSky,
                      },
                    ]}>
                    <Ionicons
                      name="water"
                      size={20}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.sky[400]
                          : PrimitiveTokens.color.sky[600]
                      }
                    />
                  </View>
                  <View style={styles.anchorDetails}>
                    <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                      Water Intake
                    </Text>
                    <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                      {(routine.waterIntake ?? 0).toFixed(1)}L / {breakdown.targetWater}L ·{' '}
                      {breakdown.waterPts}/30 pts
                    </Text>
                  </View>
                </View>

                {/* Quick Water Buttons (+250ml / +500ml) */}
                <View style={styles.quickBtnsRow}>
                  {(routine.waterIntake ?? 0) > 0 && (
                    <Pressable
                      onPress={() => handleQuickAddWater(-0.25)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Decrease 250ml water"
                      style={({ pressed }) => [
                        styles.quickStepBtn,
                        {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border,
                          borderWidth: 1,
                        },
                        pressed && { opacity: 0.6 },
                      ]}>
                      <Ionicons name="remove" size={13} color={theme.colors.textSecondary} />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => handleQuickAddWater(0.25)}
                    accessibilityRole="button"
                    accessibilityLabel="Add 250ml water"
                    style={({ pressed }) => [
                      styles.quickActionPill,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}>
                    <Text style={[styles.quickActionPillText, { color: theme.colors.text }]}>
                      +250ml
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleQuickAddWater(0.5)}
                    accessibilityRole="button"
                    accessibilityLabel="Add 500ml water"
                    style={({ pressed }) => [
                      styles.quickActionPill,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}>
                    <Text style={[styles.quickActionPillText, { color: theme.colors.text }]}>
                      +500ml
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Anchor C: Study & Focus */}
              <View
                style={[
                  styles.anchorCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View style={styles.anchorLeft}>
                  <View
                    style={[
                      styles.anchorIconTile,
                      {
                        backgroundColor: theme.isDark
                          ? SemanticDarkTokens.color.bg.tileIndigo
                          : SemanticLightTokens.color.bg.tileIndigo,
                      },
                    ]}>
                    <Ionicons
                      name="book"
                      size={19}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.indigo[400]
                          : PrimitiveTokens.color.indigo[600]
                      }
                    />
                  </View>
                  <View style={styles.anchorDetails}>
                    <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                      Study & Focus
                    </Text>
                    <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                      {(routine.studyHours ?? 0).toFixed(1)}h / {breakdown.targetStudy}h ·{' '}
                      {breakdown.studyPts}/40 pts
                    </Text>
                  </View>
                </View>

                {/* Quick Study Buttons (+30m / +1h) */}
                <View style={styles.quickBtnsRow}>
                  {(routine.studyHours ?? 0) > 0 && (
                    <Pressable
                      onPress={() => handleQuickAddStudy(-0.5)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Decrease 30 minutes study"
                      style={({ pressed }) => [
                        styles.quickStepBtn,
                        {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border,
                          borderWidth: 1,
                        },
                        pressed && { opacity: 0.6 },
                      ]}>
                      <Ionicons name="remove" size={13} color={theme.colors.textSecondary} />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => handleQuickAddStudy(0.5)}
                    accessibilityRole="button"
                    accessibilityLabel="Add 30 minutes study"
                    style={({ pressed }) => [
                      styles.quickActionPill,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}>
                    <Text style={[styles.quickActionPillText, { color: theme.colors.text }]}>
                      +30m
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleQuickAddStudy(1.0)}
                    accessibilityRole="button"
                    accessibilityLabel="Add 1 hour study"
                    style={({ pressed }) => [
                      styles.quickActionPill,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}>
                    <Text style={[styles.quickActionPillText, { color: theme.colors.text }]}>
                      +1h
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 3. Today's Habits Section */}
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                TODAY&apos;S HABITS
              </Text>
              <Text style={[styles.sectionCountText, { color: theme.colors.success }]}>
                {completedHabits} of {totalHabits} completed
              </Text>
            </View>

            <View
              style={[
                styles.habitsGroupCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              {displayActivities && displayActivities.length > 0 ? (
                displayActivities.map((act, index) => {
                  const isDone = Boolean(act.value);
                  const isLast = index === displayActivities.length - 1;
                  const displayName = cleanHabitName(act.name);
                  const meta = getHabitBrandMeta(act.name, theme.isDark);

                  return (
                    <React.Fragment key={act.activityId}>
                      <Pressable
                        onPress={() => handleToggleHabit(act.activityId, isDone)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isDone }}
                        accessibilityLabel={`${displayName}, ${isDone ? 'completed' : 'incomplete'}`}
                        style={({ pressed }) => [
                          styles.habitRow,
                          pressed && { opacity: 0.75 },
                        ]}>
                        <View style={styles.habitLeft}>
                          <View
                            style={[
                              styles.habitIconCircle,
                              { backgroundColor: meta.tileBg },
                            ]}>
                            <Ionicons
                              name={meta.icon}
                              size={18}
                              color={meta.iconColor}
                            />
                          </View>

                          {/* Habit Name - Same weight, dim readable color when completed */}
                          <Text
                            style={[
                              styles.habitName,
                              {
                                color: isDone ? theme.colors.textSecondary : theme.colors.text,
                              },
                            ]}
                            numberOfLines={1}>
                            {displayName}
                          </Text>
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
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: theme.colors.borderSubtle },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <View style={styles.noHabitsBox}>
                  <Text style={[styles.noHabitsText, { color: theme.colors.textSecondary }]}>
                    No habits planned for today. Tap Edit Habits to customize.
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Sathy Companion Card (Replacing Circadian Harmony) */}
            <SathyCompanionCard
              score={score}
              userName={user?.name || 'Sumit'}
              wakeUpTime={routine.wakeUpTime}
              waterIntake={routine.waterIntake}
              targetWater={breakdown.targetWater}
              studyHours={routine.studyHours}
              targetStudy={breakdown.targetStudy}
            />

            {/* 5. 7-Day Sunrise Streak Path (Filling bottom space) */}
            <StreakPath
              streakCount={stats?.currentStreak || 1}
              days={weekStreakDays}
            />
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
    paddingBottom: PrimitiveTokens.space[2],
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: PrimitiveTokens.space[3],
  },
  dateSub: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontFamily: TypographyScale.h2.fontFamily,
    fontWeight: TypographyScale.h2.fontWeight,
    letterSpacing: TypographyScale.h2.letterSpacing,
    marginTop: PrimitiveTokens.space['0_5'],
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    gap: PrimitiveTokens.space[1],
    marginBottom: PrimitiveTokens.space['0_5'],
  },
  editText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '700',
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: PrimitiveTokens.space[2],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: PrimitiveTokens.space[3],
  },
  loadingText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: PrimitiveTokens.space[6],
    marginTop: PrimitiveTokens.space[5],
    borderRadius: PrimitiveTokens.radius['2xl'],
    borderWidth: 1,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PrimitiveTokens.space[4],
  },
  emptyTitle: {
    fontSize: TypographyScale.h3.fontSize,
    fontFamily: TypographyScale.h3.fontFamily,
    fontWeight: TypographyScale.h3.fontWeight,
    letterSpacing: TypographyScale.h3.letterSpacing,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    lineHeight: TypographyScale.bodySm.lineHeight,
    textAlign: 'center',
    marginTop: PrimitiveTokens.space['1_5'],
    marginBottom: PrimitiveTokens.space[5],
    maxWidth: 290,
  },
  emptyButton: {
    width: '100%',
  },
  dashboard: {
    width: '100%',
  },
  /* Hero Card */
  heroCard: {
    borderRadius: PrimitiveTokens.radius['2xl'],
    padding: PrimitiveTokens.space[5],
    marginBottom: PrimitiveTokens.space[4],
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[3],
  },
  heroLabel: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: TypographyScale.scoreDisplay.fontSize,
    fontFamily: TypographyScale.scoreDisplay.fontFamily,
    fontWeight: TypographyScale.scoreDisplay.fontWeight,
    letterSpacing: TypographyScale.scoreDisplay.letterSpacing,
  },
  scoreTotal: {
    fontSize: TypographyScale.h4.fontSize,
    fontFamily: TypographyScale.h4.fontFamily,
    fontWeight: '600',
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    gap: PrimitiveTokens.space[1],
    borderWidth: 1,
  },
  heroStatusPillText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 7,
    borderRadius: PrimitiveTokens.radius.full,
    overflow: 'hidden',
    marginBottom: PrimitiveTokens.space[4],
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: PrimitiveTokens.radius.full,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: PrimitiveTokens.space[2],
  },
  breakdownChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PrimitiveTokens.space['1_5'],
    paddingHorizontal: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    gap: PrimitiveTokens.space[1],
  },
  breakdownChipTag: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  breakdownChipVal: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
  },
  /* Section Headings */
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[2],
    marginTop: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  sectionHeading: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  sectionCountText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '700',
  },
  /* Daily Anchors */
  anchorsGroup: {
    gap: PrimitiveTokens.space[2],
    marginBottom: PrimitiveTokens.space[4],
  },
  anchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: PrimitiveTokens.radius.xl,
    borderWidth: 1,
    padding: PrimitiveTokens.space[3],
  },
  anchorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    paddingRight: PrimitiveTokens.space[2],
  },
  anchorIconTile: {
    width: 38,
    height: 38,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorDetails: {
    flex: 1,
  },
  anchorTitle: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    letterSpacing: -0.2,
  },
  anchorMeta: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 1,
  },
  quickBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
  },
  quickStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  quickActionPillText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  loggedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
  },
  loggedPillText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  /* Habits Group */
  habitsGroupCard: {
    borderRadius: PrimitiveTokens.radius['2xl'],
    borderWidth: 1,
    padding: PrimitiveTokens.space[1],
    marginBottom: PrimitiveTokens.space[4],
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PrimitiveTokens.space['3_5'],
    paddingVertical: PrimitiveTokens.space['3_5'],
  },
  habitLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    paddingRight: PrimitiveTokens.space['2_5'],
  },
  habitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    letterSpacing: -0.2,
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: PrimitiveTokens.space['3_5'],
  },
  noHabitsBox: {
    padding: PrimitiveTokens.space[5],
    alignItems: 'center',
  },
  noHabitsText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    textAlign: 'center',
  },
});
