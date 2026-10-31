import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AmbientAtmosphere } from '@/components/ui';
import {
  ChartDayItem,
  DayDetailData,
  DayDetailModal,
  HeatmapDayItem,
  MetricChartCard,
  MetricType,
  MonthlyHeatmapCard,
  RangeType,
  SathyInsightCard,
  StatsSkeleton,
  StreakDayItem,
  StreakHubCard,
} from '@/components/stats';
import { useTheme } from '@/hooks/use-theme';
import { routineService } from '@/services/routine';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { RoutineData, RoutineStats, UserGoals } from '@/types/routine';

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 440;
  const horizontalPadding = isTablet ? 32 : 16;

  // Data State
  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [history, setHistory] = useState<RoutineData[]>([]);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Interactive UI Controls
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('score');
  const [selectedRange, setSelectedRange] = useState<RangeType>('week');
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = earlier, etc.
  const [isTableMode, setIsTableMode] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayDetailData | null>(null);

  // Stable references for SWR
  const statsRef = useRef<RoutineStats | null>(null);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Fetch Stats, Routine History & User Goals in parallel
  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (!statsRef.current && !isManualRefresh) {
        setLoading(true);
      }
      setHasError(false);

      const [statsData, historyData, goalsData] = await Promise.all([
        routineService.getRoutineStats().catch(() => null),
        routineService.getRoutineHistory(1, 40).catch(() => []),
        routineService.getUserGoals().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (historyData) setHistory(historyData);
      if (goalsData) setGoals(goalsData);
    } catch {
      if (!statsRef.current) {
        setHasError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Build a lookup map of historical routines by YYYY-MM-DD
  const routinesByDate = new Map<string, RoutineData>();
  for (const r of history) {
    if (r.date) routinesByDate.set(r.date, r);
  }

  // Also build score map from server stats last7DaysScores for seamless fallback
  const statsScoresMap = new Map<string, number>();
  if (stats?.last7DaysScores) {
    for (const item of stats.last7DaysScores) {
      statsScoresMap.set(item.date, item.score);
    }
  }

  const today = new Date();
  const todayStr = formatLocalDate(today);

  const targetWater = goals?.targetWater ?? 3.0;
  const targetStudy = goals?.targetStudy ?? 4.0;
  const targetWakeUpStr = goals?.targetWakeUp ?? '06:00';
  const [th, tm] = targetWakeUpStr.split(':').map(Number);
  const targetWakeMins = (th || 0) * 60 + (tm || 0);

  // 1. Generate 7 days for the Sunrise Streak Path (last 6 days leading up to Today)
  const streakWeekDays: StreakDayItem[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = formatLocalDate(d);
    const r = routinesByDate.get(dStr);
    const scoreVal = r?.score ?? statsScoresMap.get(dStr) ?? 0;
    streakWeekDays.push({
      day: i === 0 ? 'Today' : WEEKDAY_NAMES[d.getDay()],
      score: scoreVal,
      isToday: i === 0,
    });
  }

  // 2. Generate Days for the Chart (Week or Month view)
  const currentDayIndex = today.getDay();
  const chartDays: ChartDayItem[] = [];
  let weekLabel = 'This Week';

  if (selectedRange === 'week') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayIndex + weekOffset * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startMonth = startOfWeek.toLocaleString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('en-US', { month: 'short' });
    weekLabel =
      startMonth === endMonth
        ? `${startMonth} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}`
        : `${startMonth} ${startOfWeek.getDate()} – ${endMonth} ${endOfWeek.getDate()}`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = formatLocalDate(d);
      const r = routinesByDate.get(dStr);

      const water = r?.waterIntake ?? 0;
      const study = r?.studyHours ?? 0;
      const wake = r?.wakeUpTime;

      // Calculate exact score breakdown using user's real targets
      const waterPts = Math.min(30, Math.round((water / targetWater) * 30));
      const studyPts = Math.min(40, Math.round((study / targetStudy) * 40));
      let wakePts = 0;
      if (wake) {
        const [h, m] = wake.split(':').map(Number);
        const mins = (h || 0) * 60 + (m || 0);
        if (mins <= targetWakeMins) {
          wakePts = 30;
        } else if (mins < targetWakeMins + 240) {
          wakePts = Math.max(0, Math.round(30 - ((mins - targetWakeMins) / 240) * 30));
        }
      }

      const recordedScore = r?.score ?? statsScoresMap.get(dStr) ?? (waterPts + studyPts + wakePts);

      chartDays.push({
        dayName: dStr === todayStr ? 'Today' : WEEKDAY_NAMES[d.getDay()],
        dayNumber: d.getDate(),
        dateStr: dStr,
        isToday: dStr === todayStr,
        score: recordedScore,
        waterIntake: water,
        studyHours: study,
        wakeMinutesFromTarget: 0,
        wakeUpTime: wake,
        wakePts,
        waterPts,
        studyPts,
      });
    }
  } else {
    // Month View (current month's days, e.g. 1 to 31)
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dStr = formatLocalDate(d);
      const r = routinesByDate.get(dStr);

      const water = r?.waterIntake ?? 0;
      const study = r?.studyHours ?? 0;
      const wake = r?.wakeUpTime;

      const waterPts = Math.min(30, Math.round((water / targetWater) * 30));
      const studyPts = Math.min(40, Math.round((study / targetStudy) * 40));
      let wakePts = 0;
      if (wake) {
        const [h, m] = wake.split(':').map(Number);
        const mins = (h || 0) * 60 + (m || 0);
        if (mins <= targetWakeMins) {
          wakePts = 30;
        } else if (mins < targetWakeMins + 240) {
          wakePts = Math.max(0, Math.round(30 - ((mins - targetWakeMins) / 240) * 30));
        }
      }

      const recordedScore = r?.score ?? statsScoresMap.get(dStr) ?? (waterPts + studyPts + wakePts);

      chartDays.push({
        dayName: WEEKDAY_NAMES[d.getDay()],
        dayNumber: dayNum,
        dateStr: dStr,
        isToday: dStr === todayStr,
        score: recordedScore,
        waterIntake: water,
        studyHours: study,
        wakeMinutesFromTarget: 0,
        wakeUpTime: wake,
        wakePts,
        waterPts,
        studyPts,
      });
    }
  }

  // Dynamic Average Score for the active view
  const activeScores = chartDays.filter((d) => d.score > 0).map((d) => d.score);
  const dynamicAvgScore =
    activeScores.length > 0
      ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
      : stats?.avgScore || 0;

  // 3. Generate Monthly Heatmap Days
  const curYear = today.getFullYear();
  const curMonth = today.getMonth();
  const totalDaysInCurMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(curYear, curMonth, 1).getDay(); // 0 = Sun

  const heatmapDays: HeatmapDayItem[] = [];
  for (let dayNum = 1; dayNum <= totalDaysInCurMonth; dayNum++) {
    const d = new Date(curYear, curMonth, dayNum);
    const dStr = formatLocalDate(d);
    const r = routinesByDate.get(dStr);
    heatmapDays.push({
      dayNumber: dayNum,
      dateStr: dStr,
      score: r?.score || 0,
      isToday: dStr === todayStr,
      hasData: Boolean(r),
    });
  }

  // 4. Determine Sathy's Best Day Insight
  let bestDayItem: ChartDayItem | null = null;
  for (const d of chartDays) {
    if (!bestDayItem || d.score > bestDayItem.score) {
      bestDayItem = d;
    }
  }

  const isEmpty = (stats?.totalDays || 0) === 0 && history.length === 0;

  const formatModalDate = (dStr: string, isToday: boolean, dayName: string) => {
    if (isToday) {
      return 'TODAY, ' + today.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    }
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    const mName = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${dayName.toUpperCase()}, ${mName} ${d}`;
  };

  const formatTimeAMPM = (timeStr?: string | null): string | undefined => {
    if (!timeStr) return undefined;
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m} ${ampm}`;
  };

  // Handler when user taps any day in chart or heatmap
  const handleOpenDayModal = (day: ChartDayItem) => {
    setSelectedDayDetail({
      dayName: day.dayName,
      dateStr: formatModalDate(day.dateStr, day.isToday, day.dayName),
      score: day.score,
      wakeUpTime: day.wakeUpTime ? formatTimeAMPM(day.wakeUpTime) : undefined,
      wakePts: day.wakePts,
      waterIntake: day.waterIntake,
      waterPts: day.waterPts,
      studyHours: day.studyHours,
      studyPts: day.studyPts,
    });
  };

  const handleOpenHeatmapDayModal = (dayNumber: number) => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const d = new Date(year, month, dayNumber);
    const dStr = formatLocalDate(d);
    const r = routinesByDate.get(dStr);
    const isTodayDay = dStr === todayStr;

    const water = r?.waterIntake ?? 0;
    const study = r?.studyHours ?? 0;
    const wake = r?.wakeUpTime;

    const waterPts = Math.min(30, Math.round((water / targetWater) * 30));
    const studyPts = Math.min(40, Math.round((study / targetStudy) * 40));
    let wakePts = 0;
    if (wake) {
      const [h, m] = wake.split(':').map(Number);
      const mins = (h || 0) * 60 + (m || 0);
      if (mins <= targetWakeMins) {
        wakePts = 30;
      } else if (mins < targetWakeMins + 240) {
        wakePts = Math.max(0, Math.round(30 - ((mins - targetWakeMins) / 240) * 30));
      }
    }

    const score = r?.score ?? statsScoresMap.get(dStr) ?? (waterPts + studyPts + wakePts);
    const dayName = isTodayDay ? 'Today' : WEEKDAY_NAMES[d.getDay()];

    setSelectedDayDetail({
      dayName,
      dateStr: formatModalDate(dStr, isTodayDay, dayName),
      score,
      wakeUpTime: wake ? formatTimeAMPM(wake) : undefined,
      wakePts,
      waterIntake: water,
      waterPts,
      studyHours: study,
      studyPts,
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Screen Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + (theme.isDark ? 8 : 10),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.headerBarInner, { maxWidth: containerMaxWidth }]}>
          <Text
            style={[
              styles.headerEyebrow,
              {
                color: theme.isDark
                  ? PrimitiveTokens.color.fern[400]
                  : PrimitiveTokens.color.forest[600],
              },
            ]}>
            PROGRESS
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Your consistency
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            How your three daily steps add up over time.
          </Text>
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
            paddingBottom: Math.max(insets.bottom + 96, 112),
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading && !stats ? (
          <StatsSkeleton />
        ) : hasError && !stats ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={32} color={theme.colors.textMuted} />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              Couldn&apos;t load progress
            </Text>
            <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
              Check your connection and tap below to retry.
            </Text>
            <Pressable
              onPress={() => fetchData(true)}
              accessibilityRole="button"
              accessibilityLabel="Retry loading progress"
              style={[styles.retryBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="refresh" size={15} color={theme.colors.text} />
              <Text style={[styles.retryBtnText, { color: theme.colors.text }]}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            {/* 1. Streak & Sunrise Path Hub Card */}
            <StreakHubCard
              currentStreak={stats?.currentStreak || 0}
              maxStreak={stats?.maxStreak || 0}
              avgScore={dynamicAvgScore}
              totalDays={stats?.totalDays || 0}
              weekDays={streakWeekDays}
              range={selectedRange}
              isEmpty={isEmpty}
            />

            {/* 2. Interactive Metric & Trend Chart Card */}
            <MetricChartCard
              days={chartDays}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
              selectedRange={selectedRange}
              onSelectRange={setSelectedRange}
              weekOffset={weekOffset}
              onNavigateWeek={(dir) => setWeekOffset((prev) => prev + dir)}
              weekLabel={weekLabel}
              isTableMode={isTableMode}
              onToggleTableMode={() => setIsTableMode((prev) => !prev)}
              onSelectDay={handleOpenDayModal}
              userGoals={goals}
              isEmpty={isEmpty}
            />

            {/* 3. Monthly Heatmap Card */}
            <MonthlyHeatmapCard
              monthName={today.toLocaleString('en-US', { month: 'long' })}
              days={heatmapDays}
              firstDayOffset={firstDayOfMonth}
              onSelectDay={handleOpenHeatmapDayModal}
            />

            {/* 4. Sathy Companion Reflection Card */}
            <SathyInsightCard
              bestDayName={
                bestDayItem && bestDayItem.score > 0
                  ? bestDayItem.isToday
                    ? 'today'
                    : bestDayItem.dayName
                  : undefined
              }
              bestScore={bestDayItem && bestDayItem.score > 0 ? bestDayItem.score : undefined}
              bestWakeTime={
                bestDayItem && bestDayItem.score > 0
                  ? formatTimeAMPM(bestDayItem.wakeUpTime)
                  : undefined
              }
              isEmpty={isEmpty}
            />
          </View>
        )}
      </ScrollView>

      {/* Day Breakdown Bottom Sheet Modal */}
      <DayDetailModal
        visible={Boolean(selectedDayDetail)}
        onClose={() => setSelectedDayDetail(null)}
        data={selectedDayDetail}
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
    paddingBottom: 6,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  headerEyebrow: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: TypographyScale.h2.fontFamily,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: TypographyScale.bodySm.fontFamily,
    lineHeight: 17,
    marginTop: 2,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 6,
  },
  content: {
    width: '100%',
    gap: PrimitiveTokens.space[3],
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '700',
    marginTop: 4,
  },
  errorSubtitle: {
    fontSize: 13,
    fontFamily: TypographyScale.body.fontFamily,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
