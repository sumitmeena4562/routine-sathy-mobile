import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

import { UserGoals } from '@/types/routine';

export type MetricType = 'score' | 'water' | 'study' | 'wake';
export type RangeType = 'week' | 'month' | 'year';

export interface ChartDayItem {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  score: number;
  waterIntake: number;
  studyHours: number;
  wakeMinutesFromTarget: number;
  wakeUpTime?: string | null;
  wakePts: number;
  waterPts: number;
  studyPts: number;
}

export interface MetricChartCardProps {
  days: ChartDayItem[];
  selectedMetric: MetricType;
  onSelectMetric: (m: MetricType) => void;
  selectedRange: RangeType;
  onSelectRange: (r: RangeType) => void;
  weekOffset: number;
  onNavigateWeek: (direction: number) => void;
  weekLabel: string;
  isTableMode: boolean;
  onToggleTableMode: () => void;
  onSelectDay: (day: ChartDayItem) => void;
  userGoals?: UserGoals | null;
  isEmpty?: boolean;
}

export function MetricChartCard({
  days,
  selectedMetric,
  onSelectMetric,
  selectedRange,
  onSelectRange,
  weekOffset,
  onNavigateWeek,
  weekLabel,
  isTableMode,
  onToggleTableMode,
  onSelectDay,
  userGoals,
  isEmpty = false,
}: MetricChartCardProps) {
  const theme = useTheme();

  const targetWater = userGoals?.targetWater ?? 3.0;
  const targetStudy = userGoals?.targetStudy ?? 4.0;
  const targetWakeUp = userGoals?.targetWakeUp ?? '06:00';

  // Metric configurations matching the prototype and user goals
  const metricConfigs = {
    score: {
      color: theme.colors.success,
      max: 100,
      goal: 60,
      goalLabel: 'Streak line: score 60',
      title: 'Daily score',
      getValue: (d: ChartDayItem) => d.score,
      getLabel: (d: ChartDayItem) => (d.score > 0 ? `${d.score}` : '—'),
    },
    water: {
      color: theme.isDark ? PrimitiveTokens.color.sky[400] : '#0284C7',
      max: Math.max(3.5, targetWater + 0.5),
      goal: targetWater,
      goalLabel: `Goal: ${targetWater.toFixed(1)}L`,
      title: 'Water (litres)',
      getValue: (d: ChartDayItem) => d.waterIntake,
      getLabel: (d: ChartDayItem) => (d.waterIntake > 0 ? `${d.waterIntake.toFixed(1)}L` : '—'),
    },
    study: {
      color: theme.isDark ? PrimitiveTokens.color.indigo[400] : '#6366F1',
      max: Math.max(5.5, targetStudy + 1.5),
      goal: targetStudy,
      goalLabel: `Goal: ${targetStudy.toFixed(1)}h`,
      title: 'Study (hours)',
      getValue: (d: ChartDayItem) => d.studyHours,
      getLabel: (d: ChartDayItem) => (d.studyHours > 0 ? `${d.studyHours.toFixed(1)}h` : '—'),
    },
    wake: {
      color: theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[600],
      max: 30,
      goal: 30,
      goalLabel: `Goal: ${targetWakeUp} (30 pts)`,
      title: 'Wake-up consistency',
      getValue: (d: ChartDayItem) => d.wakePts,
      getLabel: (d: ChartDayItem) => d.wakeUpTime || '—',
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  return (
    <Card style={styles.card}>
      {/* 1. Metric Segmented Control */}
      <View style={[styles.segTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
        {(['score', 'water', 'study', 'wake'] as MetricType[]).map((m) => {
          const isActive = selectedMetric === m;
          const labels: Record<MetricType, string> = {
            score: 'Score',
            water: 'Water',
            study: 'Study',
            wake: 'Wake-up',
          };

          return (
            <Pressable
              key={m}
              onPress={() => onSelectMetric(m)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.segBtn,
                isActive && [
                  styles.segBtnActive,
                  { backgroundColor: theme.colors.surface },
                ],
              ]}>
              <Text
                style={[
                  styles.segBtnText,
                  {
                    color: isActive ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}>
                {labels[m]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Range Segmented Control (Week, Month, Year Plus) */}
      <View
        style={[
          styles.segTrack,
          styles.rangeTrack,
          { backgroundColor: theme.colors.surfaceAlt },
        ]}>
        {(['week', 'month', 'year'] as RangeType[]).map((r) => {
          const isActive = selectedRange === r;
          const labels: Record<RangeType, string> = {
            week: 'Week',
            month: 'Month',
            year: 'Year',
          };

          return (
            <Pressable
              key={r}
              onPress={() => onSelectRange(r)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.segBtn,
                isActive && [
                  styles.segBtnActive,
                  { backgroundColor: theme.colors.surface },
                ],
              ]}>
              <View style={styles.rangeBtnInner}>
                <Text
                  style={[
                    styles.segBtnText,
                    {
                      color: isActive ? theme.colors.text : theme.colors.textSecondary,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}>
                  {labels[r]}
                </Text>
                {r === 'year' && (
                  <Ionicons
                    name="lock-closed"
                    size={11}
                    color={isActive ? theme.colors.text : theme.colors.textMuted}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 3. Range Content: Year Paywall or Chart/Table */}
      {selectedRange === 'year' ? (
        <View style={[styles.lockedCard, { borderColor: theme.colors.borderSubtle }]}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>
            Year view is part of Plus
          </Text>
          <Text style={[styles.lockedDesc, { color: theme.colors.textSecondary }]}>
            See 12 months of water, study and wake-up trends.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See Plus plan"
            style={[
              styles.plusCtaBtn,
              {
                backgroundColor: theme.isDark
                  ? PrimitiveTokens.color.amber[400]
                  : PrimitiveTokens.color.amber[500],
              },
            ]}>
            <Text style={styles.plusCtaText}>See Plus</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Week Navigator or Month Header */}
          {selectedRange === 'week' ? (
            <View style={styles.navigatorRow}>
              <Pressable
                onPress={() => onNavigateWeek(-1)}
                disabled={weekOffset <= -2}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                style={[
                  styles.navArrowBtn,
                  { backgroundColor: theme.colors.surfaceAlt },
                  weekOffset <= -2 && { opacity: 0.35 },
                ]}>
                <Ionicons name="chevron-back" size={16} color={theme.colors.text} />
              </Pressable>

              <View style={styles.navLabelCol}>
                <Text style={[styles.navDateRange, { color: theme.colors.text }]}>
                  {weekLabel}
                </Text>
                <Text style={[styles.navSubLabel, { color: theme.colors.textMuted }]}>
                  {weekOffset === 0 ? 'This week' : 'Earlier'}
                </Text>
              </View>

              <Pressable
                onPress={() => onNavigateWeek(1)}
                disabled={weekOffset >= 0}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Next week"
                style={[
                  styles.navArrowBtn,
                  { backgroundColor: theme.colors.surfaceAlt },
                  weekOffset >= 0 && { opacity: 0.35 },
                ]}>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.text} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.monthHeaderRow}>
              <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
                {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Text style={[styles.monthSubtitle, { color: theme.colors.textMuted }]}>
                {days.length} days
              </Text>
            </View>
          )}

          {/* Table Toggle Row */}
          <View style={styles.tableToggleRow}>
            <Text style={[styles.metricHeading, { color: theme.colors.text }]}>
              {currentConfig.title}
            </Text>
            <Pressable
              onPress={onToggleTableMode}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isTableMode ? 'View chart' : 'View as table'}>
              <Text
                style={[
                  styles.toggleBtnText,
                  {
                    color: theme.isDark
                      ? PrimitiveTokens.color.fern[300]
                      : PrimitiveTokens.color.forest[600],
                  },
                ]}>
                {isTableMode ? 'View chart' : 'View as table'}
              </Text>
            </Pressable>
          </View>

          {/* Chart or Table */}
          {isTableMode ? (
            <View style={styles.tableWrapper}>
              <View style={[styles.tableRow, styles.tableHeaderRow, { borderBottomColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.tableHeadCell, { color: theme.colors.textMuted }]}>DAY</Text>
                <Text style={[styles.tableHeadCell, { color: theme.colors.textMuted }]}>
                  {selectedMetric.toUpperCase()}
                </Text>
                <Text style={[styles.tableHeadCell, { color: theme.colors.textMuted }]}>SCORE</Text>
              </View>

              {days.map((d) => (
                <Pressable
                  key={d.dateStr}
                  onPress={() => onSelectDay(d)}
                  style={[styles.tableRow, { borderBottomColor: theme.colors.borderSubtle }]}>
                  <Text style={[styles.tableCell, { color: theme.colors.text }]}>
                    {d.dayName} {d.dayNumber}
                  </Text>
                  <Text style={[styles.tableCell, { color: theme.colors.textSecondary }]}>
                    {currentConfig.getLabel(d)}
                  </Text>
                  <Text style={[styles.tableCell, { color: theme.colors.text, fontWeight: '800' }]}>
                    {d.score}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              {/* Pill Chart Columns */}
              <View
                style={[
                  styles.chartArea,
                  selectedRange === 'month' && styles.chartAreaMonth,
                ]}>
                {/* Horizontal Dashed Goal Line aligned pixel-perfect to pill tracks */}
                <View
                  style={[
                    styles.goalLine,
                    {
                      bottom: 28 + Math.round((currentConfig.goal / currentConfig.max) * 90),
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                />

                {days.map((d) => {
                  const val = currentConfig.getValue(d);
                  const fillPercent = Math.max(
                    0,
                    Math.min(100, Math.round((val / currentConfig.max) * 100))
                  );
                  const isMonth = selectedRange === 'month';

                  return (
                    <Pressable
                      key={d.dateStr}
                      onPress={() => onSelectDay(d)}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.dayName} ${d.dayNumber}: ${currentConfig.getLabel(d)}`}
                      style={styles.colBtn}>
                      {/* Label above Bar (hide in month view to avoid clutter) */}
                      {!isMonth && (
                        <Text
                          style={[
                            styles.colScoreLabel,
                            {
                              color: d.isToday
                                ? theme.colors.success
                                : val > 0
                                  ? theme.colors.textSecondary
                                  : 'transparent',
                              fontWeight: d.isToday ? '800' : '600',
                            },
                          ]}>
                          {currentConfig.getLabel(d)}
                        </Text>
                      )}

                      {/* Pill Track and Fill */}
                      <View
                        style={[
                          styles.pillTrack,
                          isMonth && styles.pillTrackMonth,
                          {
                            backgroundColor: theme.colors.surfaceAlt,
                            borderColor: d.isToday ? theme.colors.success : 'transparent',
                            borderWidth: d.isToday && val === 0 ? 1 : 0,
                          },
                        ]}>
                        <View
                          style={[
                            styles.pillFill,
                            {
                              height: `${fillPercent}%`,
                              backgroundColor: currentConfig.color,
                              opacity: val >= currentConfig.goal ? 1 : 0.6,
                            },
                          ]}
                        />
                      </View>

                      {/* Weekday Label below Bar */}
                      <View style={styles.colDayRow}>
                        <Text
                          style={[
                            styles.colDayText,
                            {
                              color: d.isToday ? theme.colors.text : theme.colors.textSecondary,
                              fontWeight: d.isToday ? '800' : '600',
                            },
                          ]}>
                          {isMonth ? (d.dayNumber % 7 === 1 ? d.dayNumber : '') : d.dayName}
                        </Text>
                        {!isMonth && (
                          <Text style={[styles.colDateNumber, { color: theme.colors.textMuted }]}>
                            {d.dayNumber}
                          </Text>
                        )}
                        {d.isToday && <View style={styles.todayIndicatorDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Goal Legend */}
              <View style={styles.legendRow}>
                <View style={[styles.legendDash, { borderColor: theme.colors.borderSubtle }]} />
                <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>
                  {currentConfig.goalLabel}
                </Text>
              </View>

              {isEmpty && (
                <Text style={[styles.emptyHint, { color: theme.colors.textMuted }]}>
                  No data yet. Log your first day and your chart starts here.
                </Text>
              )}
            </>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: PrimitiveTokens.space[3],
    borderRadius: PrimitiveTokens.radius.xl,
  },
  segTrack: {
    flexDirection: 'row',
    borderRadius: PrimitiveTokens.radius.lg,
    padding: 3,
    gap: 3,
  },
  rangeTrack: {
    marginTop: PrimitiveTokens.space[2],
  },
  segBtn: {
    flex: 1,
    height: 34,
    borderRadius: PrimitiveTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  segBtnText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  rangeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  /* Week Navigator */
  navigatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: PrimitiveTokens.space[3],
    marginBottom: PrimitiveTokens.space[1],
  },
  navArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabelCol: {
    alignItems: 'center',
  },
  navDateRange: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  navSubLabel: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '600',
    marginTop: 1,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: PrimitiveTokens.space[3],
    marginBottom: PrimitiveTokens.space[1],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  monthTitle: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  monthSubtitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  /* Table Toggle */
  tableToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: PrimitiveTokens.space[2],
    marginBottom: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  metricHeading: {
    fontSize: 13,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  toggleBtnText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  /* Table */
  tableWrapper: {
    marginTop: PrimitiveTokens.space[1],
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: PrimitiveTokens.space[2],
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    paddingBottom: PrimitiveTokens.space[1],
  },
  tableHeadCell: {
    flex: 1,
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: TypographyScale.body.fontFamily,
  },
  /* Chart */
  chartArea: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    marginTop: PrimitiveTokens.space[1],
    paddingHorizontal: 2,
  },
  chartAreaMonth: {
    gap: 2,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  colBtn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
    zIndex: 2,
  },
  colScoreLabel: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    height: 14,
    textAlign: 'center',
  },
  pillTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  pillTrackMonth: {
    width: 7,
    borderRadius: 3.5,
  },
  pillFill: {
    width: '100%',
    borderRadius: 7,
  },
  colDayRow: {
    alignItems: 'center',
    minHeight: 28,
  },
  colDayText: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  colDateNumber: {
    fontSize: 9,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '600',
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[2],
    marginTop: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  legendDash: {
    width: 16,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 10,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: PrimitiveTokens.space[2],
  },
  /* Year Locked */
  lockedCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: PrimitiveTokens.radius.lg,
    padding: PrimitiveTokens.space[5],
    alignItems: 'center',
    marginVertical: PrimitiveTokens.space[3],
    gap: PrimitiveTokens.space[2],
  },
  lockIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    fontSize: 14,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  lockedDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  plusCtaBtn: {
    paddingHorizontal: PrimitiveTokens.space[4],
    paddingVertical: PrimitiveTokens.space[2],
    borderRadius: PrimitiveTokens.radius.md,
    marginTop: PrimitiveTokens.space[1],
  },
  plusCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#052418',
  },
});

