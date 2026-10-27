import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

import { AmbientAtmosphere, Card } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { routineService } from '@/services/routine';
import { RoutineStats } from '@/types/routine';

function getCircadianTip(): {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
  body: string;
} {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      title: 'Morning Sunlight & Circadian Anchor',
      icon: 'sunny',
      iconColor: '#D97706',
      tileBg: '#FEF3C7',
      body: 'Getting 10-15 minutes of outdoor sunlight within an hour of waking resets your master biological clock and boosts daytime energy.',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      title: 'Midday Cognitive Peak & Hydration',
      icon: 'flash',
      iconColor: '#0284C7',
      tileBg: '#E0F2FE',
      body: 'Core body temperature and cognitive performance peak mid-afternoon. Maintain steady hydration to prevent the afternoon slump.',
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      title: 'Evening Wind-Down & Melatonin Support',
      icon: 'partly-sunny',
      iconColor: '#7C3AED',
      tileBg: '#F3E8FF',
      body: 'Dim harsh overhead lighting and minimize bright screen exposure to allow natural melatonin production for restorative deep sleep.',
    };
  }
  return {
    title: 'Night Recovery & Cellular Repair',
    icon: 'moon',
    iconColor: '#4F46E5',
    tileBg: '#EEF2FF',
    body: 'During deep delta-wave sleep, your brain clears metabolic waste and tissue repairs. Keep your sleeping space dark, quiet, and cool (~19°C).',
  };
}

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 520 : 440;
  const horizontalPadding = isTablet ? 32 : 22;

  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await routineService.getRoutineStats();
      setStats(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const tip = getCircadianTip();
  const currentStreak = stats?.currentStreak || 0;

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
          <Text style={styles.headerEyebrow}>RHYTHM ANALYTICS</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Consistency
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your habit streaks and daily rhythm score over time.
          </Text>
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
              Calculating consistency trends...
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* 1. Unified Streak & Consistency Hub Card */}
            <Card style={styles.streakHubCard}>
              <View style={styles.streakTopRow}>
                <View style={styles.flameIconBox}>
                  <Ionicons name="flame" size={28} color="#EA580C" />
                </View>

                <View style={styles.streakCountCol}>
                  <View style={styles.streakNumberRow}>
                    <Text style={[styles.streakCount, { color: theme.colors.text }]}>
                      {currentStreak}
                    </Text>
                    <Text style={[styles.streakDaysUnit, { color: theme.colors.textSecondary }]}>
                      {currentStreak === 1 ? 'DAY STREAK' : 'DAYS STREAK'}
                    </Text>
                  </View>
                  <Text style={styles.streakNote}>
                    {currentStreak > 0
                      ? 'Great momentum! Keep logging daily.'
                      : 'Log today\'s routine to start your streak.'}
                  </Text>
                </View>
              </View>

              {/* Integrated 3-Metric Summary Strip */}
              <View style={[styles.metricsStrip, { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>
                    BEST STREAK
                  </Text>
                  <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                    {stats?.maxStreak || 0}
                    <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> d</Text>
                  </Text>
                </View>

                <View style={[styles.metricDivider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>
                    AVG SCORE
                  </Text>
                  <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                    {stats?.avgScore ? Math.round(stats.avgScore) : 0}
                    <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> %</Text>
                  </Text>
                </View>

                <View style={[styles.metricDivider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>
                    TOTAL LOGGED
                  </Text>
                  <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                    {stats?.totalDays || 0}
                    <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> d</Text>
                  </Text>
                </View>
              </View>
            </Card>

            {/* 2. Sleek 7-Day Rhythm Trend Card (Precision Pill Columns) */}
            {stats?.last7DaysScores && stats.last7DaysScores.length > 0 && (
              <Card style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <View style={styles.trendTitleRow}>
                    <Ionicons name="trending-up" size={17} color="#D97706" />
                    <Text style={[styles.trendTitle, { color: theme.colors.text }]}>
                      Last 7 Days Rhythm
                    </Text>
                  </View>
                  <Text style={[styles.trendSubtitle, { color: theme.colors.textSecondary }]}>
                    SCORE %
                  </Text>
                </View>

                {/* Sleek Pill Chart */}
                <View style={styles.trendBarsRow}>
                  {stats.last7DaysScores.map((day, idx) => {
                    const isToday = idx === (stats.last7DaysScores?.length || 0) - 1;
                    const barHeight = Math.max(Math.round((day.score / 100) * 72), 6);
                    const barColor =
                      day.score >= 80
                        ? '#10B981'
                        : day.score >= 50
                        ? '#F59E0B'
                        : day.score > 0
                        ? '#EF4444'
                        : 'transparent';

                    return (
                      <View key={day.date} style={styles.trendBarCol}>
                        {/* Score Label above Bar */}
                        <Text
                          style={[
                            styles.barScoreLabel,
                            {
                              color: isToday
                                ? '#10B981'
                                : day.score > 0
                                ? theme.colors.textSecondary
                                : 'transparent',
                              fontWeight: isToday ? '800' : '600',
                            },
                          ]}>
                          {day.score > 0 ? `${day.score}%` : '—'}
                        </Text>

                        {/* Slender Pill Track & Fill */}
                        <View
                          style={[
                            styles.trendBarTrack,
                            {
                              backgroundColor: theme.isDark
                                ? 'rgba(255, 255, 255, 0.08)'
                                : '#F1F5F9',
                              borderColor: isToday ? '#10B981' : 'transparent',
                              borderWidth: isToday && day.score === 0 ? 1 : 0,
                            },
                          ]}>
                          <View
                            style={[
                              styles.trendBarFill,
                              {
                                height: barHeight,
                                backgroundColor: barColor,
                              },
                            ]}
                          />
                        </View>

                        {/* Weekday Label */}
                        <Text
                          style={[
                            styles.trendDayText,
                            {
                              color: isToday ? '#0F172A' : theme.colors.textSecondary,
                              fontWeight: isToday ? '800' : '600',
                            },
                          ]}>
                          {isToday ? 'Today' : day.dayName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            )}

            {/* 3. Contextual Circadian Rhythm Insight Card (Time of Day Adaptive) */}
            <Card style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIconCircle, { backgroundColor: tip.tileBg }]}>
                  <Ionicons name={tip.icon} size={18} color={tip.iconColor} />
                </View>
                <View style={styles.tipHeaderTextCol}>
                  <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                    {tip.title}
                  </Text>
                  <Text style={[styles.tipSubtitle, { color: theme.colors.textSecondary }]}>
                    Circadian Science Insight
                  </Text>
                </View>
              </View>
              <Text style={[styles.tipBody, { color: theme.colors.textSecondary }]}>
                {tip.body}
              </Text>
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
    paddingBottom: 8,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  headerEyebrow: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#D97706', // Warm Amber
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
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
  content: {
    width: '100%',
    gap: 16,
  },
  /* 1. Unified Streak Hub Card */
  streakHubCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  streakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  flameIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCountCol: {
    flex: 1,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakCount: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  streakDaysUnit: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  streakNote: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 2,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricNumber: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 26,
  },
  /* 2. Sleek 7-Day Trend Card */
  trendCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  trendSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  trendBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    height: 110,
    paddingHorizontal: 4,
  },
  trendBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barScoreLabel: {
    fontSize: 10,
    height: 14,
    textAlign: 'center',
  },
  trendBarTrack: {
    width: 14, // Slender pill width instead of giant chunky 45px block
    height: 72,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  trendDayText: {
    fontSize: 11,
    marginTop: 2,
  },
  /* 3. Circadian Tip Card */
  tipCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipHeaderTextCol: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tipSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  tipBody: {
    fontSize: 13,
    lineHeight: 18.5,
  },
});
