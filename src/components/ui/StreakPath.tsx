import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
} from '@/theme/tokens.generated';
import { triggerHaptic } from '@/utils/haptics';
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
    <Card
      variant="surface"
      padding={18}
      radius={PrimitiveTokens.radius['2xl']}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <HStack justify="space-between" align="center" style={styles.header}>
        <VStack gap={2}>
          <Text variant="caption" color="muted" style={styles.uppercaseTag}>
            7-DAY SUNRISE STREAK
          </Text>
          <HStack align="baseline" gap={6}>
            <Text variant="h3" color="primary">
              {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
            </Text>
            <Text variant="bodySm" color="accent" style={styles.safeStreakText}>
              ✓ Protected
            </Text>
          </HStack>
        </VStack>

        <View
          style={[
            styles.streakFlameBadge,
            {
              backgroundColor: theme.isDark
                ? SemanticDarkTokens.color.state.warningBg
                : SemanticLightTokens.color.state.warningBg,
              borderColor: theme.isDark
                ? 'rgba(251, 191, 36, 0.35)'
                : PrimitiveTokens.color.amber[200],
            },
          ]}>
          <Ionicons
            name="flame"
            size={16}
            color={
              theme.isDark
                ? SemanticDarkTokens.color.state.warning
                : PrimitiveTokens.color.amber[700]
            }
          />
          <Text
            variant="captionSm"
            style={[
              styles.streakFlameText,
              {
                color: theme.isDark
                  ? SemanticDarkTokens.color.state.warning
                  : PrimitiveTokens.color.amber[800],
              },
            ]}>
            {streakCount >= 7 ? 'On Fire' : 'Active'}
          </Text>
        </View>
      </HStack>

      <HStack justify="space-between" align="center" style={styles.daysRow}>
        {days.map((item, index) => {
          const isDone = item.isDone || item.score >= 80;
          const isToday = item.isToday;

          let dotBg = theme.colors.surfaceAlt;
          let dotBorder = theme.colors.borderSubtle;
          let iconColor = theme.colors.textMuted;

          if (isDone) {
            dotBg = theme.colors.success;
            dotBorder = theme.colors.success;
            iconColor = theme.colors.successForeground || '#FFFFFF';
          } else if (isToday) {
            dotBg = theme.isDark
              ? SemanticDarkTokens.color.bg.tileAmber
              : SemanticLightTokens.color.bg.tileAmber;
            dotBorder = theme.isDark
              ? PrimitiveTokens.color.amber[400]
              : PrimitiveTokens.color.amber[500];
            iconColor = theme.colors.text;
          }

          return (
            <Pressable
              key={index}
              onPress={() => {
                triggerHaptic('light');
                onSelectDay?.(item);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Day ${item.day}, score ${item.score}${isToday ? ', today' : ''}`}
              style={styles.dayCol}>
              <Text
                variant="micro"
                color={isToday ? 'primary' : 'muted'}
                style={isToday ? [styles.dayLabel, styles.todayDayLabel] : styles.dayLabel}>
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
                ]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color={iconColor} />
                ) : isToday ? (
                  <View
                    style={[
                      styles.innerTodayDot,
                      {
                        backgroundColor: theme.isDark
                          ? PrimitiveTokens.color.amber[400]
                          : PrimitiveTokens.color.amber[600],
                      },
                    ]}
                  />
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
    marginVertical: PrimitiveTokens.space[2],
    borderWidth: 1,
  },
  header: {
    marginBottom: PrimitiveTokens.space[3],
  },
  uppercaseTag: {
    letterSpacing: 1,
    fontWeight: '700',
  },
  safeStreakText: {
    fontWeight: '700',
  },
  streakFlameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  streakFlameText: {
    fontWeight: '800',
  },
  daysRow: {
    paddingHorizontal: 2,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontWeight: '600',
  },
  todayDayLabel: {
    fontWeight: '800',
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: PrimitiveTokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  todayDotGlow: {
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  innerTodayDot: {
    width: 8,
    height: 8,
    borderRadius: PrimitiveTokens.radius.full,
  },
});
