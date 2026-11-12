import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  CircadianCelebrationBurst,
  HabitCheckControl,
  SathyCompanionCard,
  StreakPath,
  Toast,
  AlarmCard,
  AlarmSetupModal,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAlarmContext } from '@/context/AlarmContext';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import { Storage } from '@/utils/storage';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import {
  HabitItem,
  RoutineData,
  RoutineStats,
  UserGoals,
} from '@/types/routine';
import { cleanHabitName, getHabitBrandMeta } from '@/constants/habits';
import { formatTime12hr as formatWakeTimeDisplay } from '@/utils/dateTime';
import { triggerHaptic } from '@/utils/haptics';
import {
  calcScoreBreakdown,
  computeDisplayActivities,
  generateWeekDays,
} from '@/features/today/scoreFormula';
import { WakePickerModal } from '@/features/today/WakePickerModal';
import { offlineQueue } from '@/utils/offlineQueue';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
  const [userHabits, setUserHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const { isRinging: isAlarmRinging } = useAlarmContext();
  const prevAlarmRingingRef = useRef(isAlarmRinging);
  const prevScoreRef = useRef<number | null>(null);

  // Synchronized state tracker & debounced save queue for rapid taps
  const pendingRoutineRef = useRef<RoutineData | null>(null);
  const isSyncingRef = useRef<boolean>(false);
  const hasQueuedSyncRef = useRef<boolean>(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingToastMsgRef = useRef<string | null>(null);
  const latestUserHabitsRef = useRef<HabitItem[]>(userHabits);
  const latestGoalsRef = useRef<UserGoals | null>(goals);

  useEffect(() => {
    latestUserHabitsRef.current = userHabits;
  }, [userHabits]);

  useEffect(() => {
    latestGoalsRef.current = goals;
  }, [goals]);

  // Offline-first instant hydration from local cache so the screen is never blank
  useEffect(() => {
    let active = true;
    const hydrateFromCache = async () => {
      try {
        const todayDate = getTodayDateString();
        const [cachedRoutine, cachedGoals, cachedStats, cachedHabits] = await Promise.all([
          Storage.getItem(`cached_routine_${todayDate}`),
          Storage.getItem('cached_user_goals'),
          Storage.getItem('cached_user_stats'),
          Storage.getItem('cached_user_habits'),
        ]);

        if (!active) return;

        if (cachedRoutine) {
          try {
            const parsed = JSON.parse(cachedRoutine);
            if (parsed) {
              setRoutine(parsed);
              pendingRoutineRef.current = parsed;
              setLoading(false);
            }
          } catch {}
        }
        if (cachedGoals) {
          try {
            const parsed = JSON.parse(cachedGoals);
            if (parsed) setGoals(parsed);
          } catch {}
        }
        if (cachedStats) {
          try {
            const parsed = JSON.parse(cachedStats);
            if (parsed) setStats(parsed);
          } catch {}
        }
        if (cachedHabits) {
          try {
            const parsed = JSON.parse(cachedHabits);
            if (Array.isArray(parsed) && parsed.length > 0) setUserHabits(parsed);
          } catch {}
        }
      } catch {
        // Fall back cleanly to live network fetch
      }
    };

    hydrateFromCache();
    return () => {
      active = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (__DEV__) {
      console.log('🔄 [TODAY] Fetching today routine, goals, stats & habits...');
    }
    // Attempt background flush of any pending offline mutations
    await offlineQueue.flushPendingRoutine().catch(() => {});

    try {
      const [routineRes, goalsRes, statsRes, habitsRes] = await Promise.allSettled([
        routineService.getTodayRoutine(getTodayDateString()),
        routineService.getUserGoals(),
        routineService.getRoutineStats(),
        routineService.getUserHabits(),
      ]);

      if (routineRes.status === 'fulfilled') {
        setRoutine(routineRes.value);
        if (!syncTimerRef.current && !isSyncingRef.current) {
          pendingRoutineRef.current = routineRes.value;
        }
        if (routineRes.value) {
          Storage.setItem(`cached_routine_${getTodayDateString()}`, JSON.stringify(routineRes.value)).catch(() => {});
        }
        if (__DEV__) {
          console.log('📦 [TODAY] Routine Loaded:', {
            date: routineRes.value?.date,
            score: routineRes.value?.score ?? 0,
            wakeUpTime: routineRes.value?.wakeUpTime ?? null,
            waterIntake: `${routineRes.value?.waterIntake ?? 0}L`,
            studyHours: `${routineRes.value?.studyHours ?? 0}h`,
            activitiesDone: routineRes.value?.activities?.filter((a) => Boolean(a.value)).length ?? 0,
          });
        }
      } else if (__DEV__) {
        console.warn('⚠️ [TODAY] Routine fetch rejected:', routineRes.reason);
      }

      if (goalsRes.status === 'fulfilled' && goalsRes.value) {
        setGoals(goalsRes.value);
        Storage.setItem('cached_user_goals', JSON.stringify(goalsRes.value)).catch(() => {});
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
        Storage.setItem('cached_user_stats', JSON.stringify(statsRes.value)).catch(() => {});
      }
      if (habitsRes.status === 'fulfilled' && habitsRes.value) {
        setUserHabits(habitsRes.value);
        Storage.setItem('cached_user_habits', JSON.stringify(habitsRes.value)).catch(() => {});
      }
    } catch (err) {
      if (__DEV__) {
        console.error('❌ [TODAY] Error in fetchData:', err);
      }
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

  // If alarm is dismissed, auto-refresh Today screen so water intake & wake up time immediately show up
  useEffect(() => {
    if (prevAlarmRingingRef.current && !isAlarmRinging) {
      fetchData();
    }
    prevAlarmRingingRef.current = isAlarmRinging;
  }, [isAlarmRinging, fetchData]);

  const displayActivities = computeDisplayActivities(userHabits, routine);
  const totalHabits = displayActivities.length;
  const completedHabits = displayActivities.filter((a) => Boolean(a.value)).length;

  // Smart Habit Prioritization: Pending habits appear first, completed follow
  const sortedActivities = useMemo(() => {
    return [...displayActivities].sort((a, b) => {
      const aDone = Boolean(a.value);
      const bDone = Boolean(b.value);
      if (aDone === bDone) return 0;
      return aDone ? 1 : -1;
    });
  }, [displayActivities]);

  // Real formula breakdown (Wake 30 · Water 30 · Study 40)
  const breakdown = calcScoreBreakdown(
    routine?.wakeUpTime,
    routine?.waterIntake ?? 0,
    routine?.studyHours ?? 0,
    goals
  );

  // Unmount cleanup: flush pending routine save immediately
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
        if (pendingRoutineRef.current) {
          routineService
            .saveRoutine({
              date: pendingRoutineRef.current.date || getTodayDateString(),
              wakeUpTime: pendingRoutineRef.current.wakeUpTime,
              waterIntake: pendingRoutineRef.current.waterIntake,
              studyHours: pendingRoutineRef.current.studyHours,
              activities: pendingRoutineRef.current.activities,
            })
            .catch(() => {});
        }
      }
    };
  }, []);

  // Flushes the accumulated pending routine state to backend safely
  const flushSyncRoutine = useCallback(async () => {
    if (isSyncingRef.current) {
      hasQueuedSyncRef.current = true;
      return;
    }

    isSyncingRef.current = true;

    try {
      while (true) {
        hasQueuedSyncRef.current = false;
        const dataToSave = pendingRoutineRef.current;
        if (!dataToSave) break;

        const saved = await routineService.saveRoutine({
          date: dataToSave.date || getTodayDateString(),
          wakeUpTime: dataToSave.wakeUpTime,
          waterIntake: dataToSave.waterIntake,
          studyHours: dataToSave.studyHours,
          activities: dataToSave.activities,
        });

        // Adopt server payload only if no further rapid taps occurred in-flight
        if (!hasQueuedSyncRef.current && !syncTimerRef.current) {
          pendingRoutineRef.current = saved;
          setRoutine(saved);
        }

        // Cache latest synchronized routine to storage
        Storage.setItem(`cached_routine_${saved.date || getTodayDateString()}`, JSON.stringify(saved)).catch(() => {});

        if (pendingToastMsgRef.current) {
          setToast({
            visible: true,
            type: 'success',
            message: pendingToastMsgRef.current,
          });
          pendingToastMsgRef.current = null;
        }

        if (!hasQueuedSyncRef.current) {
          break;
        }
      }
    } catch (err) {
      if (__DEV__) {
        console.error('❌ [USER ACTION ERROR] Sync routine failed:', err);
      }
      const failedData = pendingRoutineRef.current;
      if (failedData) {
        offlineQueue.queuePendingRoutine(failedData).catch(() => {});
      }
      setToast({
        visible: true,
        type: 'info',
        message: 'Saved offline. Changes will sync when online.',
      });
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Synchronously updates local state for 0ms instant UI feedback, while debouncing network POSTs
  const queueRoutineMutation = useCallback(
    (
      mutate: (current: RoutineData) => { next: RoutineData; toastMsg?: string },
      debounceMs: number = 350
    ) => {
      const base: RoutineData =
        pendingRoutineRef.current ||
        (routine
          ? { ...routine }
          : {
              _id: '',
              user: user?._id ?? '',
              date: getTodayDateString(),
              wakeUpTime: undefined,
              waterIntake: 0,
              studyHours: 0,
              activities: displayActivities,
              score: 0,
            });

      const { next, toastMsg } = mutate({ ...base });
      pendingRoutineRef.current = next;
      setRoutine(next);

      if (toastMsg) {
        pendingToastMsgRef.current = toastMsg;
      }

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      if (debounceMs <= 0) {
        flushSyncRoutine();
      } else {
        syncTimerRef.current = setTimeout(() => {
          syncTimerRef.current = null;
          flushSyncRoutine();
        }, debounceMs);
      }
    },
    [routine, user?._id, displayActivities, flushSyncRoutine]
  );

  // Quick Action: Add Water (+250ml or +500ml or -250ml)
  const handleQuickAddWater = useCallback(
    (deltaLiters: number) => {
      triggerHaptic('medium');

      queueRoutineMutation((prev) => {
        const currentWater = prev.waterIntake ?? 0;
        const nextWater = Math.max(0, Math.min(8.0, Math.round((currentWater + deltaLiters) * 100) / 100));
        const nextBreakdown = calcScoreBreakdown(
          prev.wakeUpTime,
          nextWater,
          prev.studyHours ?? 0,
          latestGoalsRef.current
        );

        if (__DEV__) {
          console.log(
            `💧 [USER ACTION] Water tap: ${deltaLiters > 0 ? '+' : ''}${Math.round(deltaLiters * 1000)}ml | ${currentWater}L -> ${nextWater}L | Score: ${nextBreakdown.totalScore}`
          );
        }

        return {
          next: {
            ...prev,
            waterIntake: nextWater,
            score: nextBreakdown.totalScore,
          },
          toastMsg:
            deltaLiters > 0
              ? `+${Math.round(deltaLiters * 1000)}ml water logged (${nextWater.toFixed(1)}L)`
              : undefined,
        };
      }, 350);
    },
    [queueRoutineMutation]
  );

  // Quick Action: Add Study & Focus (+30m or +1h or -30m)
  const handleQuickAddStudy = useCallback(
    (deltaHours: number) => {
      triggerHaptic('medium');

      queueRoutineMutation((prev) => {
        const currentStudy = prev.studyHours ?? 0;
        const nextStudy = Math.max(0, Math.min(14.0, Math.round((currentStudy + deltaHours) * 10) / 10));
        const nextBreakdown = calcScoreBreakdown(
          prev.wakeUpTime,
          prev.waterIntake ?? 0,
          nextStudy,
          latestGoalsRef.current
        );

        if (__DEV__) {
          console.log(
            `📚 [USER ACTION] Study tap: ${deltaHours > 0 ? '+' : ''}${deltaHours >= 1 ? `${deltaHours}h` : `${Math.round(deltaHours * 60)}m`} | ${currentStudy}h -> ${nextStudy}h | Score: ${nextBreakdown.totalScore}`
          );
        }

        return {
          next: {
            ...prev,
            studyHours: nextStudy,
            score: nextBreakdown.totalScore,
          },
          toastMsg:
            deltaHours > 0
              ? `+${deltaHours >= 1 ? `${deltaHours}h` : `${Math.round(deltaHours * 60)}m`} study logged (${nextStudy.toFixed(1)}h)`
              : undefined,
        };
      }, 350);
    },
    [queueRoutineMutation]
  );

  // Quick Action: Log Wake-up (current time or custom)
  const handleLogWakeUp = useCallback(
    (timeStr?: string) => {
      triggerHaptic('medium');

      let wakeTime = timeStr;
      if (!wakeTime) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        wakeTime = `${h}:${m}`;
      }

      queueRoutineMutation((prev) => {
        const nextBreakdown = calcScoreBreakdown(
          wakeTime,
          prev.waterIntake ?? 0,
          prev.studyHours ?? 0,
          latestGoalsRef.current
        );

        if (__DEV__) {
          console.log(
            `☀️ [USER ACTION] Log Wake-up: ${wakeTime} | Target: ${latestGoalsRef.current?.targetWakeUp || '06:00'} | Wake Pts: ${nextBreakdown.wakePts}/30 | Score: ${nextBreakdown.totalScore}`
          );
        }

        return {
          next: {
            ...prev,
            wakeUpTime: wakeTime,
            score: nextBreakdown.totalScore,
          },
          toastMsg: `Wake-up logged at ${formatWakeTimeDisplay(wakeTime)}`,
        };
      }, 0);
    },
    [queueRoutineMutation]
  );

  // Quick Action: Reset Logged Wake-up Time
  const handleResetWakeUp = useCallback(() => {
    triggerHaptic('medium');

    queueRoutineMutation((prev) => {
      const nextBreakdown = calcScoreBreakdown(
        undefined,
        prev.waterIntake ?? 0,
        prev.studyHours ?? 0,
        latestGoalsRef.current
      );

      if (__DEV__) {
        console.log(`☀️ [USER ACTION] Reset Wake-up | Score: ${nextBreakdown.totalScore}`);
      }

      return {
        next: {
          ...prev,
          wakeUpTime: undefined,
          score: nextBreakdown.totalScore,
        },
        toastMsg: 'Wake-up entry reset',
      };
    }, 0);
  }, [queueRoutineMutation]);

  // Modal State for In-app Wake-up Time Picker
  const [wakeModalVisible, setWakeModalVisible] = useState(false);
  const openWakePicker = useCallback(() => {
    triggerHaptic('light');
    setWakeModalVisible(true);
  }, []);

  // Quick Action: Toggle Habit Completion
  const handleToggleHabit = useCallback(
    (activityId: string, currentVal: boolean) => {
      triggerHaptic(!currentVal ? 'medium' : 'light');

      queueRoutineMutation((prev) => {
        const baseActs =
          prev.activities && prev.activities.length > 0 ? prev.activities : displayActivities;
        const updatedActivities = baseActs.map((act) => {
          if (act.activityId === activityId) {
            return { ...act, value: !currentVal };
          }
          return act;
        });

        const nextBreakdown = calcScoreBreakdown(
          prev.wakeUpTime,
          prev.waterIntake ?? 0,
          prev.studyHours ?? 0,
          latestGoalsRef.current
        );

        if (__DEV__) {
          const targetHabit = baseActs.find((a) => a.activityId === activityId);
          console.log(
            `✅ [USER ACTION] Toggle Habit: "${targetHabit?.name || activityId}" -> ${!currentVal ? 'COMPLETED' : 'INCOMPLETE'} | Score: ${nextBreakdown.totalScore}`
          );
        }

        return {
          next: {
            ...prev,
            activities: updatedActivities,
            score: nextBreakdown.totalScore,
          },
        };
      }, 350);
    },
    [queueRoutineMutation, displayActivities]
  );

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const greeting = getTimeGreeting();

  const wakeGoalMet = Boolean(routine?.wakeUpTime && breakdown.wakePts >= 30);
  const waterGoalMet = (routine?.waterIntake ?? 0) >= breakdown.targetWater;
  const studyGoalMet = (routine?.studyHours ?? 0) >= breakdown.targetStudy;
  const completedGoalsCount = (wakeGoalMet ? 1 : 0) + (waterGoalMet ? 1 : 0) + (studyGoalMet ? 1 : 0);

  const score = breakdown.totalScore;
  const scoreProgress = Math.min(Math.max(score / 100, 0), 1);
  const isScorePerfect = score >= 100;

  const weekStreakDays = generateWeekDays(stats?.last7DaysScores, score);

  // Celebrate 100-Point Circadian Mastery transition
  useEffect(() => {
    if (prevScoreRef.current !== null && prevScoreRef.current < 100 && score >= 100) {
      setShowCelebration(true);
    }
    if (!loading) {
      prevScoreRef.current = score;
    }
  }, [score, loading]);

  const handleReplayCelebration = useCallback(() => {
    if (!isScorePerfect) return;
    triggerHaptic('success');
    setShowCelebration(false);
    setTimeout(() => {
      setShowCelebration(true);
    }, 40);
  }, [isScorePerfect]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* 100-Point Circadian Mastery Celebration Burst */}
      <CircadianCelebrationBurst
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* In-app Wake-up Time Picker Modal */}
      <WakePickerModal
        visible={wakeModalVisible}
        onClose={() => setWakeModalVisible(false)}
        onSave={(time) => handleLogWakeUp(time)}
        onReset={handleResetWakeUp}
        currentWakeUpTime={routine?.wakeUpTime}
        targetWakeUp={goals?.targetWakeUp || '06:00'}
      />

      {/* Screen Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.colors.background,
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

          <Pressable
            onPress={() => router.push('/add-routine')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Manage Habits"
            style={({ pressed }) => [
              styles.editBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
              pressed && { opacity: 0.75 },
            ]}>
            <Ionicons name="sparkles-outline" size={14} color={theme.colors.text} />
            <Text style={[styles.editText, { color: theme.colors.text }]}>Habits</Text>
          </Pressable>
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
            paddingBottom: Math.max(insets.bottom + 128, 144),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.success} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              {"Aligning today's rhythm..."}
            </Text>
          </View>
        ) : (
          /* ========================================================
             TODAY ROUTINE DASHBOARD
             ======================================================== */
          <View style={styles.dashboard}>
            {/* 1. Today's 100 Score Hero Card */}
            <Pressable
              onPress={handleReplayCelebration}
              accessibilityRole={isScorePerfect ? 'button' : undefined}
              accessibilityLabel={
                isScorePerfect
                  ? "Today's score: 100 out of 100. Circadian mastery achieved. Tap to replay celebration."
                  : `Today's score: ${score} out of 100.`
              }
              style={[
                styles.heroCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isScorePerfect
                    ? theme.isDark
                      ? PrimitiveTokens.color.amber[400]
                      : PrimitiveTokens.color.amber[500]
                    : theme.colors.border,
                },
              ]}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                    {"TODAY'S SCORE"}
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
                        ? theme.colors.successBorder
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
                    {breakdown.wakePts}/30
                  </Text>
                </View>

                {/* 2. Water */}
                <View
                  style={[
                    styles.breakdownChip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: waterGoalMet
                        ? theme.colors.successBorder
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
                    {breakdown.waterPts}/30
                  </Text>
                </View>

                {/* 3. Study */}
                <View
                  style={[
                    styles.breakdownChip,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: studyGoalMet
                        ? theme.colors.successBorder
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
                    {breakdown.studyPts}/40
                  </Text>
                </View>
              </View>
            </Pressable>

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
              {/* Anchor A: Wake-up with Integrated Circadian Alarm */}
              <View
                style={[
                  styles.anchorCardCol,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View style={styles.anchorMainRow}>
                  <Pressable
                    onPress={openWakePicker}
                    accessibilityRole="button"
                    accessibilityLabel="Tap to set or edit wake-up time"
                    style={({ pressed }) => [styles.anchorLeft, pressed && { opacity: 0.8 }]}>
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
                      <View style={styles.anchorTitleRow}>
                        <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                          Wake-up
                        </Text>
                        {routine?.wakeUpTime ? (
                          <Text style={[styles.anchorBadaText, { color: theme.colors.text }]}>
                            · {formatWakeTimeDisplay(routine?.wakeUpTime)}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                        Target: {formatWakeTimeDisplay(breakdown.targetWakeUp)}
                        {' · '}
                        <Text style={{ color: wakeGoalMet ? theme.colors.success : theme.colors.textMuted }}>
                          {routine?.wakeUpTime ? `${breakdown.wakePts}/30 pts` : '0/30 pts'}
                        </Text>
                      </Text>
                    </View>
                  </Pressable>

                  {/* Wake-up Status / Action Button */}
                  {routine?.wakeUpTime ? (
                    <Pressable
                      onPress={openWakePicker}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Wake-up logged at ${formatWakeTimeDisplay(routine?.wakeUpTime)}, tap to change`}
                      style={({ pressed }) => [
                        styles.loggedPill,
                        wakeGoalMet
                          ? {
                              backgroundColor: theme.colors.successMuted,
                              borderColor: theme.colors.successBorder,
                              borderWidth: 1,
                            }
                          : {
                              backgroundColor: theme.colors.surfaceAlt,
                              borderColor: theme.colors.borderSubtle,
                              borderWidth: 1,
                            },
                        pressed && { opacity: 0.75 },
                      ]}>
                      <Ionicons
                        name="create-outline"
                        size={13}
                        color={wakeGoalMet ? theme.colors.success : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.loggedPillText,
                          { color: wakeGoalMet ? theme.colors.success : theme.colors.textSecondary },
                        ]}>
                        Edit
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={styles.wakeActionRow}>
                      <Pressable
                        onPress={() => handleLogWakeUp()}
                        accessibilityRole="button"
                        accessibilityLabel="Log awake now"
                        style={({ pressed }) => [
                          styles.wakeAwakeBtn,
                          {
                            backgroundColor: theme.isDark
                              ? PrimitiveTokens.color.amber[400]
                              : PrimitiveTokens.color.amber[500],
                          },
                          pressed && { opacity: 0.8 },
                        ]}>
                        <Ionicons
                          name="sunny"
                          size={13}
                          color={PrimitiveTokens.color.neutral[950]}
                        />
                        <Text
                          style={[
                            styles.wakeAwakeBtnText,
                            { color: PrimitiveTokens.color.neutral[950] },
                          ]}>
                          {"I'm Awake"}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={openWakePicker}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Set custom wake-up time"
                        style={({ pressed }) => [
                          styles.wakeCustomBtn,
                          {
                            backgroundColor: theme.colors.surfaceAlt,
                            borderColor: theme.colors.borderSubtle,
                          },
                          pressed && { opacity: 0.75 },
                        ]}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Sub-row Divider */}
                <View style={[styles.anchorDivider, { backgroundColor: theme.colors.borderSubtle }]} />

                {/* Integrated Circadian Alarm Ribbon */}
                <AlarmCard onOpenSettings={() => setShowAlarmModal(true)} embedded />
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
                    <View style={styles.anchorTitleRow}>
                      <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                        Water
                      </Text>
                      <Text
                        style={[
                          styles.anchorBadaText,
                          {
                            color:
                              (routine?.waterIntake ?? 0) > 0 ? theme.colors.text : theme.colors.textSecondary,
                          },
                        ]}>
                        · {(routine?.waterIntake ?? 0).toFixed(1)} L
                      </Text>
                    </View>
                    <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                      Target: {breakdown.targetWater} L
                      {' · '}
                      <Text style={{ color: waterGoalMet ? theme.colors.success : theme.colors.textMuted }}>
                        {breakdown.waterPts}/30 pts
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Quick Water Buttons (+250ml / +500ml) */}
                <View style={styles.quickBtnsRow}>
                  {(routine?.waterIntake ?? 0) > 0 && (
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
                    <View style={styles.anchorTitleRow}>
                      <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
                        Study & Focus
                      </Text>
                      <Text
                        style={[
                          styles.anchorBadaText,
                          {
                            color:
                              (routine?.studyHours ?? 0) > 0 ? theme.colors.text : theme.colors.textSecondary,
                          },
                        ]}>
                        · {(routine?.studyHours ?? 0).toFixed(1)} h
                      </Text>
                    </View>
                    <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
                      Target: {breakdown.targetStudy} h
                      {' · '}
                      <Text style={{ color: studyGoalMet ? theme.colors.success : theme.colors.textMuted }}>
                        {breakdown.studyPts}/40 pts
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Quick Study Buttons (+30m / +1h) */}
                <View style={styles.quickBtnsRow}>
                  {(routine?.studyHours ?? 0) > 0 && (
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                  {"TODAY'S HABITS"}
                </Text>
                <Pressable
                  onPress={() => router.push('/add-routine')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Manage Habits"
                  style={({ pressed }) => [
                    styles.manageHabitsPill,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.borderSubtle,
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Ionicons name="create-outline" size={11} color={theme.colors.textSecondary} />
                  <Text style={[styles.manageHabitsText, { color: theme.colors.textSecondary }]}>
                    Manage
                  </Text>
                </Pressable>
              </View>
              <Text
                style={[
                  styles.sectionCountText,
                  {
                    color: completedHabits > 0 ? theme.colors.success : theme.colors.textMuted,
                  },
                ]}>
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
              {sortedActivities && sortedActivities.length > 0 ? (
                sortedActivities.map((act, index) => {
                  const isDone = Boolean(act.value);
                  const isLast = index === sortedActivities.length - 1;
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
              wakeUpTime={routine?.wakeUpTime ?? undefined}
              waterIntake={routine?.waterIntake ?? 0}
              targetWater={breakdown.targetWater}
              studyHours={routine?.studyHours ?? 0}
              targetStudy={breakdown.targetStudy}
            />

            {/* 5. 7-Day Sunrise Streak Path (Filling bottom space) */}
            <StreakPath
              streakCount={stats?.currentStreak || (stats?.totalDays && stats.totalDays > 0 ? 1 : 0)}
              days={weekStreakDays}
            />
          </View>
        )}
      </ScrollView>

      {/* Circadian Alarm Setup Sheet */}
      <AlarmSetupModal
        visible={showAlarmModal}
        onClose={() => setShowAlarmModal(false)}
      />
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
  manageHabitsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  manageHabitsText: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  anchorCardCol: {
    flexDirection: 'column',
    borderRadius: PrimitiveTokens.radius.xl,
    borderWidth: 1,
    padding: PrimitiveTokens.space[3],
  },
  anchorMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  anchorDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    width: '100%',
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
  anchorTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  anchorTitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  anchorBadaText: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    letterSpacing: -0.3,
  },
  anchorMeta: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 2,
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
  wakeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space['1_5'],
  },
  wakeAwakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    gap: PrimitiveTokens.space[1],
  },
  wakeAwakeBtnText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  wakeCustomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
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
