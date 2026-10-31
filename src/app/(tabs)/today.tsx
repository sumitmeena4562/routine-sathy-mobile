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
  Toast,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString, routineService } from '@/services/routine';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { RoutineActivity, RoutineData } from '@/types/routine';
import { triggerHaptic } from '@/utils/haptics';

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
  if (lower.includes('read') || lower.includes('book') || lower.includes('study')) {
    return {
      icon: 'book',
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
      // Fallback gracefully
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
  const completedHabits = displayActivities.filter((a) => Boolean(a.value)).length;
  const score = Math.round(routine?.score || 0);
  const scoreProgress = Math.min(Math.max(score / 100, 0), 1);
  const isAllCompleted = completedHabits === totalHabits && totalHabits > 0;

  const sunriseAmber = theme.isDark
    ? PrimitiveTokens.color.amber[400]
    : PrimitiveTokens.color.amber[600];

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
            <Text style={[styles.dateSub, { color: sunriseAmber }]}>
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
              accessibilityLabel="Edit Routine"
              style={({ pressed }) => [
                styles.editBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                pressed && { opacity: 0.75 },
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
            tintColor={sunriseAmber}
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
            <ActivityIndicator size="small" color={sunriseAmber} />
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
              <Ionicons name="sunny" size={32} color={sunriseAmber} />
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
             CASE B: CIRCADIAN RHYTHM DASHBOARD
             ======================================================== */
          <View style={styles.dashboard}>
            {/* 1. Signature Circadian Rhythm Hero Card */}
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
                      backgroundColor: isAllCompleted
                        ? theme.isDark
                          ? SemanticDarkTokens.color.state.successBg
                          : SemanticLightTokens.color.state.successBg
                        : theme.isDark
                          ? SemanticDarkTokens.color.state.warningBg
                          : SemanticLightTokens.color.state.warningBg,
                      borderColor: isAllCompleted
                        ? theme.isDark
                          ? 'rgba(91, 219, 139, 0.35)'
                          : PrimitiveTokens.color.fern[200]
                        : theme.isDark
                          ? 'rgba(251, 191, 36, 0.35)'
                          : PrimitiveTokens.color.amber[200],
                    },
                  ]}>
                  <Ionicons
                    name={isAllCompleted ? 'checkmark-circle' : 'flame'}
                    size={14}
                    color={
                      isAllCompleted
                        ? theme.isDark
                          ? SemanticDarkTokens.color.state.success
                          : SemanticLightTokens.color.state.success
                        : theme.isDark
                          ? SemanticDarkTokens.color.state.warning
                          : PrimitiveTokens.color.amber[700]
                    }
                  />
                  <Text
                    style={[
                      styles.heroStreakPillText,
                      {
                        color: isAllCompleted
                          ? theme.isDark
                            ? SemanticDarkTokens.color.state.success
                            : SemanticLightTokens.color.state.success
                          : theme.isDark
                            ? SemanticDarkTokens.color.state.warning
                            : PrimitiveTokens.color.amber[800],
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
                  { backgroundColor: theme.colors.surfaceAlt },
                ]}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${scoreProgress * 100}%`,
                      backgroundColor:
                        score >= 80
                          ? theme.colors.success
                          : score >= 50
                            ? theme.colors.primary
                            : theme.colors.error,
                    },
                  ]}
                />
              </View>

              {/* 3 Biological Targets Strip */}
              <View
                style={[
                  styles.heroMetricsStrip,
                  { borderTopColor: theme.colors.borderSubtle },
                ]}>
                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons
                      name="sunny"
                      size={13}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.amber[400]
                          : PrimitiveTokens.color.amber[700]
                      }
                    />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>
                      Wake-up
                    </Text>
                  </View>
                  <Text style={[styles.heroMetricVal, { color: theme.colors.text }]}>
                    {routine.wakeUpTime || '—'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroMetricSep,
                    { backgroundColor: theme.colors.borderSubtle },
                  ]}
                />

                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons
                      name="water"
                      size={13}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.sky[400]
                          : PrimitiveTokens.color.sky[600]
                      }
                    />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>
                      Water
                    </Text>
                  </View>
                  <Text style={[styles.heroMetricVal, { color: theme.colors.text }]}>
                    {routine.waterIntake !== undefined ? `${routine.waterIntake}L` : '—'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroMetricSep,
                    { backgroundColor: theme.colors.borderSubtle },
                  ]}
                />

                <View style={styles.heroMetricItem}>
                  <View style={styles.heroMetricIconRow}>
                    <Ionicons
                      name="hourglass"
                      size={13}
                      color={
                        theme.isDark
                          ? PrimitiveTokens.color.indigo[400]
                          : PrimitiveTokens.color.indigo[600]
                      }
                    />
                    <Text style={[styles.heroMetricLabel, { color: theme.colors.textSecondary }]}>
                      Focus
                    </Text>
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
              <Text style={[styles.sectionCountText, { color: theme.colors.success }]}>
                {completedHabits} of {totalHabits} completed
              </Text>
            </View>

            {/* Clean Mindful Habits List Card */}
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
                  const meta = getHabitBrandMeta(act.name, theme.isDark);

                  return (
                    <React.Fragment key={act.activityId}>
                      <Pressable
                        onPress={() => handleToggleHabit(act.activityId, isDone)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isDone }}
                        accessibilityLabel={`${act.name}, ${isDone ? 'completed' : 'incomplete'}`}
                        style={({ pressed }) => [
                          styles.habitRow,
                          pressed && { opacity: 0.75 },
                        ]}>
                        <View style={styles.habitLeft}>
                          {/* Distinct Crafted Habit Icon Tile */}
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

                          {/* Habit Name */}
                          <Text
                            style={[
                              styles.habitName,
                              {
                                color: isDone ? theme.colors.textSecondary : theme.colors.text,
                                fontWeight: isDone ? '600' : '700',
                              },
                            ]}
                            numberOfLines={2}>
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
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.ribbonIconCircle,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileAmber
                      : SemanticLightTokens.color.bg.tileAmber,
                  },
                ]}>
                <Ionicons name="sunny-outline" size={17} color={sunriseAmber} />
              </View>
              <View style={styles.ribbonTextCol}>
                <Text style={[styles.ribbonTitle, { color: theme.colors.text }]}>
                  Circadian Harmony
                </Text>
                <Text style={[styles.ribbonSub, { color: theme.colors.textSecondary }]}>
                  {isAllCompleted
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
  /* Signature Circadian Rhythm Hero Card */
  heroCard: {
    borderRadius: PrimitiveTokens.radius['2xl'],
    padding: PrimitiveTokens.space[5],
    marginBottom: PrimitiveTokens.space[5],
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[4],
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
  heroStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    gap: PrimitiveTokens.space[1],
    borderWidth: 1,
  },
  heroStreakPillText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
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
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: PrimitiveTokens.space[4],
    borderTopWidth: 1,
  },
  heroMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroMetricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
  },
  heroMetricLabel: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  heroMetricVal: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    marginTop: PrimitiveTokens.space['0_5'],
  },
  heroMetricSep: {
    width: 1,
    height: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space['2_5'],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  sectionHeading: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionCountText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '700',
  },
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
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
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
  circadianRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    padding: PrimitiveTokens.space[4],
    borderRadius: PrimitiveTokens.radius.xl,
    borderWidth: 1,
  },
  ribbonIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonTextCol: {
    flex: 1,
  },
  ribbonTitle: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    letterSpacing: -0.1,
  },
  ribbonSub: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    lineHeight: TypographyScale.captionSm.lineHeight,
    marginTop: PrimitiveTokens.space['0_5'],
  },
});
