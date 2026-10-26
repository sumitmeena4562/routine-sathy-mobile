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
  CircadianRhythmDial,
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

export default function TodayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 540 : 440;
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

  // Reload routine whenever this screen comes into focus
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

  // Toggle habit completion live
  const handleToggleHabit = async (activityId: string, currentVal: boolean) => {
    if (!routine) return;

    triggerHaptic(currentVal ? 'light' : 'success');

    const updatedActivities: RoutineActivity[] = routine.activities.map((act) => {
      if (act.activityId === activityId) {
        return { ...act, value: !currentVal };
      }
      return act;
    });

    // Optimistic UI update
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
      // Revert if API fails
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

      {/* Top Header Bar */}
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
            <Text style={[styles.greetingText, { color: theme.colors.textSecondary }]}>
              {greeting}, {firstName} 👋
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {formattedDate}
            </Text>
          </View>

          {routine && (
            <Pressable
              onPress={() => router.push('/add-routine')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Edit Routine"
              style={[
                styles.editPill,
                {
                  backgroundColor: theme.colors.backgroundElement,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}>
              <Ionicons name="pencil" size={14} color={theme.colors.text} />
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
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading today&apos;s rhythm...
            </Text>
          </View>
        ) : !routine ? (
          /* ========================================================
             CASE A: NO ROUTINE LOGGED YET FOR TODAY
             ======================================================== */
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <Ionicons name="sunny" size={40} color="#F97316" />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Plan Today&apos;s Rhythm
            </Text>

            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              You haven&apos;t set your targets for today yet. Choose your morning wake-up, water goal, and daily habits to stay in flow.
            </Text>

            <Button
              title="Add Today's Routine"
              onPress={() => router.push('/add-routine')}
              variant="primary"
              size={isCompact ? 'md' : 'lg'}
              pill
              fullWidth
              icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          /* ========================================================
             CASE B: ROUTINE LOGGED — SHOW TODAY'S DASHBOARD
             ======================================================== */
          <View style={styles.dashboardContainer}>
            {/* Hero Circadian Dial */}
            <Card style={styles.heroDialCard}>
              <View style={styles.dialWrapper}>
                <CircadianRhythmDial size={isCompact ? 130 : 154} />
              </View>

              <View style={styles.scoreRow}>
                <View
                  style={[
                    styles.scorePill,
                    {
                      backgroundColor:
                        routine.score >= 70
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(249, 115, 22, 0.12)',
                      borderColor:
                        routine.score >= 70
                          ? 'rgba(16, 185, 129, 0.25)'
                          : 'rgba(249, 115, 22, 0.25)',
                    },
                  ]}>
                  <Ionicons
                    name="sparkles"
                    size={14}
                    color={routine.score >= 70 ? '#10B981' : '#F97316'}
                  />
                  <Text
                    style={[
                      styles.scorePillText,
                      { color: routine.score >= 70 ? '#10B981' : '#F97316' },
                    ]}>
                    Rhythm Score: {Math.round(routine.score)} / 100
                  </Text>
                </View>
              </View>
            </Card>

            {/* Metrics Triad Cards */}
            <View style={styles.metricsRow}>
              {/* Wake-up */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}>
                <Ionicons name="alarm-outline" size={20} color="#F97316" />
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {routine.wakeUpTime || '—'}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Wake-up
                </Text>
              </View>

              {/* Water */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}>
                <Ionicons name="water-outline" size={20} color="#0284C7" />
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {routine.waterIntake !== undefined ? `${routine.waterIntake}L` : '—'}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Water
                </Text>
              </View>

              {/* Focus Hours */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}>
                <Ionicons name="book-outline" size={20} color="#10B981" />
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {routine.studyHours !== undefined ? `${routine.studyHours}h` : '—'}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Focus
                </Text>
              </View>
            </View>

            {/* Today's Habits Section */}
            <Card style={styles.habitsCard}>
              <View style={styles.habitsHeader}>
                <View>
                  <Text style={[styles.habitsTitle, { color: theme.colors.text }]}>
                    Today&apos;s Habits
                  </Text>
                  <Text style={[styles.habitsSubtitle, { color: theme.colors.textSecondary }]}>
                    {completedHabits} of {totalHabits} completed
                  </Text>
                </View>

                <View style={styles.percentageBadge}>
                  <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
                    {Math.round(progressRatio * 100)}%
                  </Text>
                </View>
              </View>

              <ProgressBar
                progress={progressRatio}
                height={6}
                color={theme.colors.success}
                trackColor={theme.colors.backgroundElement}
                style={styles.progressBar}
              />

              {/* Habits List with Interactive Check Controls */}
              <View style={styles.habitsList}>
                {routine.activities && routine.activities.length > 0 ? (
                  routine.activities.map((act) => {
                    const isDone = Boolean(act.value);
                    return (
                      <View
                        key={act.activityId}
                        style={[
                          styles.habitRow,
                          {
                            backgroundColor: isDone
                              ? theme.colors.backgroundElement
                              : theme.colors.surface,
                            borderColor: theme.colors.borderSubtle,
                          },
                        ]}>
                        <View style={styles.habitInfo}>
                          <Text
                            style={[
                              styles.habitName,
                              {
                                color: isDone ? theme.colors.textMuted : theme.colors.text,
                                textDecorationLine: isDone ? 'line-through' : 'none',
                              },
                            ]}>
                            {act.name}
                          </Text>
                        </View>

                        <HabitCheckControl
                          completed={isDone}
                          onToggle={() => handleToggleHabit(act.activityId, isDone)}
                          size={38}
                        />
                      </View>
                    );
                  })
                ) : (
                  <Text style={[styles.noHabitsText, { color: theme.colors.textSecondary }]}>
                    No specific habits selected for today. Tap Edit above to add some!
                  </Text>
                )}
              </View>
            </Card>
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
    paddingBottom: 10,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  editText: {
    fontSize: 12.5,
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
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    maxWidth: 320,
  },
  emptyButton: {
    width: '100%',
  },
  dashboardContainer: {
    width: '100%',
    gap: 14,
  },
  heroDialCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  dialWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  habitsCard: {
    padding: 16,
  },
  habitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitsTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  habitsSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressBar: {
    marginBottom: 16,
  },
  habitsList: {
    gap: 8,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  habitInfo: {
    flex: 1,
    paddingRight: 10,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
  },
  noHabitsText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
