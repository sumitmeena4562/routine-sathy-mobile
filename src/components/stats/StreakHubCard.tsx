import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export interface StreakDayItem {
  day: string;
  score: number;
  isToday: boolean;
}

export interface StreakHubCardProps {
  currentStreak: number;
  maxStreak: number;
  avgScore: number;
  totalDays: number;
  weekDays: StreakDayItem[];
  range?: 'week' | 'month' | 'year';
  isEmpty?: boolean;
}

export function StreakHubCard({
  currentStreak,
  maxStreak,
  avgScore,
  totalDays,
  weekDays,
  range = 'week',
  isEmpty = false,
}: StreakHubCardProps) {
  const theme = useTheme();

  const streakGoalDiff = maxStreak > currentStreak ? maxStreak - currentStreak : 0;

  const streakSubtext = isEmpty
    ? 'Log your first day to start your sunrise path.'
    : currentStreak === 0
      ? 'Log today to start your sunrise streak.'
      : streakGoalDiff > 0
        ? `${streakGoalDiff} more ${streakGoalDiff === 1 ? 'day' : 'days'} to match your best (${maxStreak}).`
        : 'New personal best! Keep the momentum going.';

  return (
    <Card style={styles.card}>
      {/* 1. Header with Big Streak Count */}
      <View style={styles.streakHeader}>
        <View style={styles.streakNumberRow}>
          <Text
            style={[styles.bigNumber, { color: theme.colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {isEmpty ? 0 : currentStreak}
          </Text>
          <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
            {currentStreak === 1 ? 'DAY STREAK' : 'DAYS STREAK'}
          </Text>
        </View>
        <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
          {streakSubtext}
        </Text>
      </View>

      {/* 2. 7-Day Sunrise Streak Path */}
      <View style={styles.pathRow} accessible={true} accessibilityLabel="7-Day sunrise streak path">
        {weekDays.map((item, index) => {
          const isDone = !isEmpty && item.score >= 60;
          const isNextDone = !isEmpty && (weekDays[index + 1]?.score ?? 0) >= 60;

          return (
            <React.Fragment key={`${item.day}-${index}`}>
              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isDone ? theme.colors.success : theme.colors.surface,
                    borderColor: item.isToday
                      ? theme.isDark
                        ? PrimitiveTokens.color.amber[400]
                        : PrimitiveTokens.color.amber[500]
                      : isDone
                        ? theme.colors.success
                        : theme.colors.borderSubtle,
                    borderWidth: item.isToday ? 2.5 : 2,
                  },
                  item.isToday && styles.todayGlow,
                ]}>
                {isDone && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={theme.isDark ? '#052418' : '#FFFFFF'}
                  />
                )}
              </View>

              {/* Connecting line */}
              <View
                style={[
                  styles.connectorLine,
                  {
                    backgroundColor:
                      isDone && isNextDone
                        ? theme.colors.success
                        : theme.colors.borderSubtle,
                  },
                ]}
              />
            </React.Fragment>
          );
        })}

        {/* Sunrise Sun Icon */}
        <View
          style={[
            styles.sunIconCircle,
            {
              backgroundColor: theme.isDark
                ? PrimitiveTokens.color.amber[400]
                : PrimitiveTokens.color.amber[500],
            },
          ]}>
          <Ionicons name="sunny" size={16} color="#FFFFFF" />
        </View>
      </View>

      {/* Rule Caption */}
      <Text style={[styles.ruleCaption, { color: theme.colors.textMuted }]}>
        A streak day = daily score 60 or more
      </Text>

      {/* 3. Three Stat Summary Columns */}
      <View style={[styles.statsStrip, { borderTopColor: theme.colors.borderSubtle }]}>
        <View
          style={styles.statCol}
          accessible={true}
          accessibilityLabel={`Best streak: ${isEmpty ? 0 : maxStreak} days`}>
          <Text style={[styles.statHeader, { color: theme.colors.textMuted }]}>
            BEST STREAK
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {isEmpty ? '—' : maxStreak}
            <Text style={[styles.statUnit, { color: theme.colors.textMuted }]}> d</Text>
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: theme.colors.borderSubtle }]} />

        <View
          style={styles.statCol}
          accessible={true}
          accessibilityLabel={`${range === 'month' ? 'Month' : 'Week'} average: ${isEmpty ? 0 : avgScore} out of 100`}>
          <Text style={[styles.statHeader, { color: theme.colors.textMuted }]}>
            {range === 'month' ? 'MONTH AVG' : 'WEEK AVG'}
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {isEmpty ? '—' : avgScore}
            <Text style={[styles.statUnit, { color: theme.colors.textMuted }]}> /100</Text>
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: theme.colors.borderSubtle }]} />

        <View
          style={styles.statCol}
          accessible={true}
          accessibilityLabel={`Days logged: ${isEmpty ? 0 : totalDays} days`}>
          <Text style={[styles.statHeader, { color: theme.colors.textMuted }]}>
            DAYS LOGGED
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {isEmpty ? 0 : totalDays}
            <Text style={[styles.statUnit, { color: theme.colors.textMuted }]}> d</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: PrimitiveTokens.space[4],
    borderRadius: PrimitiveTokens.radius.xl,
  },
  streakHeader: {
    marginBottom: PrimitiveTokens.space[3],
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: PrimitiveTokens.space[2],
  },
  bigNumber: {
    fontSize: 42,
    fontFamily: TypographyScale.scoreDisplay.fontFamily,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 46,
  },
  unitText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  subtext: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontWeight: '600',
    marginTop: PrimitiveTokens.space[1],
  },
  /* Sunrise Path */
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: PrimitiveTokens.space[2],
    paddingHorizontal: 2,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  todayGlow: {
    elevation: 3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  connectorLine: {
    flex: 1,
    height: 3,
    marginHorizontal: -1,
    zIndex: 1,
  },
  sunIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -1,
    zIndex: 2,
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ruleCaption: {
    fontSize: 11,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '600',
    marginTop: PrimitiveTokens.space[1],
  },
  /* Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: PrimitiveTokens.space[3],
    paddingTop: PrimitiveTokens.space[3],
    borderTopWidth: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    fontSize: TypographyScale.micro.fontSize,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 18,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
    marginTop: 2,
  },
  statUnit: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
});
