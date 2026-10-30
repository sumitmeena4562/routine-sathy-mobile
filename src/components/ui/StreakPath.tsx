import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { Card } from './Card';
import { Text } from './Text';
import { HStack, VStack } from './Box';

export interface DayStreakItem {
  day: string; // 'M', 'T', 'W', etc.
  date: string;
  isToday: boolean;
  score: number; // 0 to 100
  isDone: boolean;
}

export interface StreakPathProps {
  streakCount: number;
  days: DayStreakItem[];
  onSelectDay?: (day: DayStreakItem) => void;
}

export function StreakPath({ streakCount, days, onSelectDay }: StreakPathProps) {
  const theme = useTheme();

  return (
    <Card variant="surface" padding={18} radius={22} style={styles.card}>
      <HStack justify="space-between" align="center" style={styles.header}>
        <VStack gap={2}>
          <Text variant="caption" color="muted" style={styles.uppercaseTag}>
            SUNRISE STREAK
          </Text>
          <HStack align="baseline" gap={6}>
            <Text variant="h2" color="primary">
              {streakCount} Days
            </Text>
            <Text variant="bodySm" color="accent" style={styles.safeStreakText}>
              ✓ Protected
            </Text>
          </HStack>
        </VStack>

        <View style={styles.streakFlameBadge}>
          <Ionicons name="sunny" size={18} color="#92400E" />
          <Text variant="captionSm" style={styles.streakFlameText}>
            {streakCount >= 7 ? 'On Fire' : 'Active'}
          </Text>
        </View>
      </HStack>

      <HStack justify="space-between" align="center" style={styles.daysRow}>
        {days.map((item, index) => {
          const isDone = item.isDone || item.score >= 80;
          const isToday = item.isToday;

          let dotBg = theme.colors.surfaceAlt;
          let dotBorder = theme.colors.border;
          let iconColor = theme.colors.textMuted;

          if (isDone) {
            dotBg = '#1E9E5A';
            dotBorder = '#16A34A';
            iconColor = '#FFFFFF';
          } else if (isToday) {
            dotBg = '#FBBF24';
            dotBorder = '#F59E0B';
            iconColor = '#0B3D2E';
          }

          return (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelectDay?.(item);
              }}
              style={styles.dayCol}
            >
              <Text variant="micro" color={isToday ? 'primary' : 'muted'} style={styles.dayLabel}>
                {item.day}
              </Text>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: dotBg,
                    borderColor: dotBorder,
                  },
                  isToday && styles.todayDotGlow,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color={iconColor} />
                ) : isToday ? (
                  <View style={styles.innerTodayDot} />
                ) : (
                  <Text variant="micro" style={{ color: iconColor, fontSize: 9 }}>
                    {item.score > 0 ? item.score : '·'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  uppercaseTag: {
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  safeStreakText: {
    fontWeight: '700',
  },
  streakFlameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FEF3C7',
  },
  streakFlameText: {
    fontWeight: '800',
    color: '#92400E',
  },
  daysRow: {
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontWeight: '700',
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  todayDotGlow: {
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  innerTodayDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#0B3D2E',
  },
});
