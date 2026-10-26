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

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AmbientAtmosphere />

      {/* Clean Top Header */}
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
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading statistics...
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Minimal Clean Streak Card */}
            <Card style={styles.streakCard}>
              <View style={[styles.flameIconBox, { backgroundColor: theme.colors.backgroundElement }]}>
                <Ionicons name="flame" size={32} color="#F97316" />
              </View>

              <Text style={[styles.streakCount, { color: theme.colors.text }]}>
                {stats?.currentStreak || 0}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                DAYS CURRENT STREAK
              </Text>
              <Text style={[styles.streakNote, { color: theme.colors.secondary }]}>
                {(stats?.currentStreak || 0) > 0
                  ? 'Great momentum! Keep logging daily.'
                  : 'Log today&apos;s routine to begin your streak.'}
              </Text>
            </Card>

            {/* Unified 3-Stat Clean Row Card */}
            <Card style={styles.metricsGroupCard}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>BEST STREAK</Text>
                <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                  {stats?.maxStreak || 0}
                  <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> d</Text>
                </Text>
              </View>

              <View style={[styles.metricDivider, { backgroundColor: theme.colors.borderSubtle }]} />

              <View style={styles.metricItem}>
                <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>AVG SCORE</Text>
                <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                  {stats?.avgScore ? Math.round(stats.avgScore) : 0}
                  <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> %</Text>
                </Text>
              </View>

              <View style={[styles.metricDivider, { backgroundColor: theme.colors.borderSubtle }]} />

              <View style={styles.metricItem}>
                <Text style={[styles.metricHeader, { color: theme.colors.textSecondary }]}>LOGGED</Text>
                <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                  {stats?.totalDays || 0}
                  <Text style={[styles.metricUnit, { color: theme.colors.textMuted }]}> d</Text>
                </Text>
              </View>
            </Card>

            {/* Minimal Circadian Rhythm Tip */}
            <Card style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={17} color={theme.colors.secondary} />
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                  Morning Circadian Tip
                </Text>
              </View>
              <Text style={[styles.tipBody, { color: theme.colors.textSecondary }]}>
                Natural morning sunlight sets your internal clock, lifting daytime energy and ensuring deeper recovery sleep at night.
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
  title: {
    fontSize: 25,
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
    gap: 14,
  },
  streakCard: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  flameIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  streakCount: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  streakNote: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 8,
  },
  metricsGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    borderRadius: 18,
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
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  tipCard: {
    padding: 16,
    borderRadius: 18,
    gap: 6,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  tipBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
