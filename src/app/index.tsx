import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Badge,
  Button,
  Card,
  HabitCheckControl,
  IconButton,
  ProgressBar,
  ScreenContainer,
  ScreenHeader,
} from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface RoutineHabit {
  id: string;
  title: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  category: string;
  completed: boolean;
  streakCount: number;
  duration: string;
}

export default function HomeScreen() {
  const theme = useTheme();

  const [habits, setHabits] = useState<RoutineHabit[]>([
    {
      id: '1',
      title: 'Morning Pranayama & Meditation',
      timeOfDay: 'Morning',
      category: 'Mindfulness',
      completed: true,
      streakCount: 14,
      duration: '15m',
    },
    {
      id: '2',
      title: 'Hydration Goal (2L Water)',
      timeOfDay: 'Morning',
      category: 'Health',
      completed: true,
      streakCount: 7,
      duration: 'All day',
    },
    {
      id: '3',
      title: 'Deep Focused Work Sprint',
      timeOfDay: 'Afternoon',
      category: 'Focus',
      completed: false,
      streakCount: 5,
      duration: '90m',
    },
    {
      id: '4',
      title: 'Evening Walk & Tech Detachment',
      timeOfDay: 'Evening',
      category: 'Wellness',
      completed: false,
      streakCount: 12,
      duration: '30m',
    },
  ]);

  const completedCount = habits.filter((h) => h.completed).length;
  const progressRatio = habits.length > 0 ? completedCount / habits.length : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  return (
    <ScreenContainer scrollable>
      {/* 1. Top Header with Quick Theme Mode Switcher */}
      <ScreenHeader
        title="Routine Sathy"
        subtitle="Your daily mindfulness & habit flow"
        rightAction={
          <IconButton
            variant="glass"
            shape="circle"
            size="md"
            onPress={theme.toggleTheme}
            accessibilityLabel="Toggle Theme Mode"
            icon={
              <Ionicons
                name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={theme.colors.primary}
              />
            }
          />
        }
      />

      {/* 2. Daily Routine Overview Card */}
      <Card variant="surface" style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <ThemedText type="label" style={{ color: theme.colors.primary }}>
              {"TODAY'S MOMENTUM"}
            </ThemedText>
            <ThemedText type="title" style={{ marginTop: 2 }}>
              {progressPercent}% Complete
            </ThemedText>
          </View>
          <Badge
            label={`${completedCount}/${habits.length} Done`}
            variant={progressRatio === 1 ? 'success' : 'primary'}
            size="md"
          />
        </View>

        <ProgressBar
          progress={progressRatio}
          height={10}
          style={{ marginTop: theme.spacing.md }}
        />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={18} color={theme.colors.warning} />
            <ThemedText type="smallBold" style={{ marginLeft: 4 }}>
              14 Day Streak
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={18} color={theme.colors.primary} />
            <ThemedText type="smallBold" style={{ marginLeft: 4 }}>
              Top 5% Flow
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.success} />
            <ThemedText type="smallBold" style={{ marginLeft: 4 }}>
              Protected
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* 3. Daily Habits Section */}
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="heading">{"Today's Habits"}</ThemedText>
        <Badge
          label="Automated Sync"
          variant="secondary"
          size="sm"
          icon={<Ionicons name="cloud-done-outline" size={12} color={theme.colors.secondaryForeground} />}
        />
      </View>

      <View style={styles.habitsList}>
        {habits.map((habit) => (
          <Card
            key={habit.id}
            variant={habit.completed ? 'surface' : 'outline'}
            style={[
              styles.habitCard,
              habit.completed && {
                borderColor: theme.colors.successBorder,
                borderWidth: theme.borderWidth.thin,
              },
            ]}
            onPress={() => toggleHabit(habit.id)}>
            <View style={styles.habitContent}>
              <HabitCheckControl
                completed={habit.completed}
                streakCount={habit.streakCount}
                onToggle={() => toggleHabit(habit.id)}
              />
              <View style={styles.habitInfo}>
                <ThemedText
                  type="bodyMedium"
                  style={[
                    styles.habitTitle,
                    habit.completed && {
                      color: theme.colors.textSecondary,
                      textDecorationLine: 'line-through',
                    },
                  ]}>
                  {habit.title}
                </ThemedText>
                <View style={styles.habitMeta}>
                  <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                    {habit.timeOfDay} • {habit.duration}
                  </ThemedText>
                  <Badge
                    label={habit.category}
                    variant={habit.completed ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* 4. Action Banner */}
      <Card variant="muted" style={styles.actionBanner}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="heading">Design System Active</ThemedText>
            <ThemedText type="caption" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
              Current mode: <ThemedText type="code">{theme.mode.toUpperCase()}</ThemedText> • Primary token:{' '}
              <ThemedText type="code">{theme.colors.primary}</ThemedText>
            </ThemedText>
          </View>
          <Button
            title={theme.isDark ? 'Light Mode' : 'Dark Mode'}
            variant="primary"
            size="sm"
            onPress={theme.toggleTheme}
            icon={
              <Ionicons
                name={theme.isDark ? 'sunny' : 'moon'}
                size={14}
                color={theme.colors.primaryForeground}
              />
            }
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    marginTop: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(139, 124, 246, 0.15)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  habitsList: {
    gap: 12,
  },
  habitCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
    marginLeft: 14,
  },
  habitTitle: {
    fontWeight: '600',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  actionBanner: {
    marginTop: 24,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
