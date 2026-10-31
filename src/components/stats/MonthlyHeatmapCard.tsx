import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export interface HeatmapDayItem {
  dayNumber: number;
  dateStr: string;
  score: number;
  isToday: boolean;
  hasData: boolean;
}

export interface MonthlyHeatmapCardProps {
  monthName: string;
  days: HeatmapDayItem[];
  firstDayOffset: number; // 0 for Sun, 1 for Mon, etc.
  onSelectDay: (dayNumber: number) => void;
}

export function MonthlyHeatmapCard({
  monthName,
  days,
  firstDayOffset,
  onSelectDay,
}: MonthlyHeatmapCardProps) {
  const theme = useTheme();

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Intensity color resolver
  const getCellBgColor = (item: HeatmapDayItem) => {
    if (!item.hasData || item.score <= 0) {
      return theme.colors.surfaceAlt;
    }
    if (item.score >= 90) {
      return theme.colors.success; // High 100%
    }
    if (item.score >= 60) {
      return theme.isDark ? 'rgba(91, 219, 139, 0.62)' : 'rgba(30, 158, 90, 0.62)'; // Med
    }
    return theme.isDark ? 'rgba(91, 219, 139, 0.30)' : 'rgba(30, 158, 90, 0.30)'; // Low
  };

  const getCellTextColor = (item: HeatmapDayItem) => {
    if (!item.hasData || item.score <= 0) {
      return theme.colors.textMuted;
    }
    if (item.score >= 60) {
      return theme.isDark ? '#052418' : '#FFFFFF';
    }
    return theme.colors.text;
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {monthName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Tap a bar for day details
        </Text>
      </View>

      {/* Weekday Column Headers */}
      <View style={styles.gridRow}>
        {weekdays.map((w, idx) => (
          <View key={`wd-${idx}`} style={styles.cellBox}>
            <Text style={[styles.weekdayText, { color: theme.colors.textMuted }]}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.gridContainer}>
        {/* Empty padding cells for first day offset */}
        {Array.from({ length: firstDayOffset }).map((_, idx) => (
          <View key={`pad-${idx}`} style={styles.cellBox} />
        ))}

        {/* Days */}
        {days.map((item) => {
          const bg = getCellBgColor(item);
          const textColor = getCellTextColor(item);

          return (
            <Pressable
              key={item.dateStr}
              onPress={() => onSelectDay(item.dayNumber)}
              accessibilityRole="button"
              accessibilityLabel={`${monthName} ${item.dayNumber}: score ${item.hasData ? item.score : 'none'}`}
              style={styles.cellBox}>
              <View
                style={[
                  styles.dayTile,
                  {
                    backgroundColor: bg,
                    borderColor: item.isToday
                      ? theme.isDark
                        ? PrimitiveTokens.color.amber[400]
                        : PrimitiveTokens.color.amber[500]
                      : 'transparent',
                    borderWidth: item.isToday ? 2 : 0,
                  },
                ]}>
                <Text style={[styles.dayTileNumber, { color: textColor }]}>
                  {item.dayNumber}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend Row */}
      <View style={styles.legendRow}>
        <Text style={[styles.legendLabel, { color: theme.colors.textMuted }]}>
          Less
        </Text>
        <View style={[styles.legendSwatch, { backgroundColor: theme.colors.surfaceAlt }]} />
        <View
          style={[
            styles.legendSwatch,
            {
              backgroundColor: theme.isDark
                ? 'rgba(91, 219, 139, 0.30)'
                : 'rgba(30, 158, 90, 0.30)',
            },
          ]}
        />
        <View
          style={[
            styles.legendSwatch,
            {
              backgroundColor: theme.isDark
                ? 'rgba(91, 219, 139, 0.62)'
                : 'rgba(30, 158, 90, 0.62)',
            },
          ]}
        />
        <View style={[styles.legendSwatch, { backgroundColor: theme.colors.success }]} />
        <Text style={[styles.legendLabel, { color: theme.colors.textMuted }]}>
          More
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: PrimitiveTokens.space[3],
    borderRadius: PrimitiveTokens.radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  title: {
    fontSize: 14,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontFamily: TypographyScale.micro.fontFamily,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: PrimitiveTokens.space[1],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellBox: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 9,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  dayTile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTileNumber: {
    fontSize: 9,
    fontFamily: TypographyScale.micro.fontFamily,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: PrimitiveTokens.space[2],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  legendLabel: {
    fontSize: 10,
    fontFamily: TypographyScale.micro.fontFamily,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
