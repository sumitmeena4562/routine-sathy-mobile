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

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const containerMaxWidth = isTablet ? 540 : 440;
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

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + 10,
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        <View style={[styles.headerBarInner, { maxWidth: containerMaxWidth }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Consistency &amp; Stats
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your daily rhythm habits, ongoing streaks, and circadian performance.
          </Text>
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
            paddingBottom: insets.bottom + 24,
            paddingLeft: insets.left + horizontalPadding,
            paddingRight: insets.right + horizontalPadding,
          },
        ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Calculating your streaks...
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Highlighted Current Streak Hero Card */}
            <Card style={styles.heroStreakCard}>
              <View style={[styles.flameCircle, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                <Ionicons name="flame" size={38} color="#F97316" />
              </View>

              <Text style={[styles.heroStreakCount, { color: theme.colors.text }]}>
                {stats?.currentStreak || 0}
              </Text>
              <Text style={[styles.heroStreakLabel, { color: theme.colors.textSecondary }]}>
                Day Streak in Flow
              </Text>
              <Text style={[styles.heroStreakMotivation, { color: theme.colors.secondary }]}>
                {(stats?.currentStreak || 0) > 0
                  ? 'Keep showing up every day to build lasting rhythm.'
                  : 'Log today&apos;s routine to start your daily streak!'}
              </Text>
            </Card>

            {/* 3 Metric Cards Grid */}
            <View style={styles.gridRow}>
              {/* Max Streak */}
              <Card style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats?.maxStreak || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Longest Streak
                </Text>
              </Card>

              {/* Avg Score */}
              <Card style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="sparkles-outline" size={20} color="#10B981" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats?.avgScore ? Math.round(stats.avgScore) : 0}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Average Score
                </Text>
              </Card>

              {/* Total Days */}
              <Card style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#0284C7" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats?.totalDays || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total Logged
                </Text>
              </Card>
            </View>

            {/* Circadian Tip Card */}
            <Card style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={20} color={theme.colors.secondary} />
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                  Circadian Rhythm Tip
                </Text>
              </View>
              <Text style={[styles.tipBody, { color: theme.colors.textSecondary }]}>
                Getting natural sunlight within 30 minutes of waking sets your internal biological clock, boosting daytime alertness and ensuring deeper sleep at night.
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
    paddingBottom: 10,
  },
  headerBarInner: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 10,
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
  content: {
    width: '100%',
    gap: 14,
  },
  heroStreakCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  flameCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroStreakCount: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroStreakLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStreakMotivation: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  tipCard: {
    padding: 18,
    gap: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  tipBody: {
    fontSize: 13,
    lineHeight: 19,
  },
});
