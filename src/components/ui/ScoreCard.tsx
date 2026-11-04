import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Card } from './Card';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { ProgressBar } from './ProgressBar';

export interface ScoreCardProps {
  score: number;
  wakePts?: number;
  waterPts?: number;
  studyPts?: number;
  wakeDone?: boolean;
  waterDone?: boolean;
  studyDone?: boolean;
}

export function ScoreCard({
  score,
  wakePts = 30,
  waterPts = 30,
  studyPts = 40,
  wakeDone = false,
  waterDone = false,
  studyDone = false,
}: ScoreCardProps) {
  const theme = useTheme();

  return (
    <Card variant="surface" padding={20} radius={22} style={styles.card}>
      <HStack justify="space-between" align="center" style={styles.header}>
        <VStack gap={4}>
          <Text variant="caption" color="muted" style={styles.uppercaseTag}>
            DAILY 100 FORMULA
          </Text>
          <HStack align="baseline" gap={4}>
            <Text variant="scoreDisplay" tabular color="primary" style={styles.scoreText}>
              {score}
            </Text>
            <Text variant="body" color="muted">
              / 100 pts
            </Text>
          </HStack>
        </VStack>

        <View style={styles.badgeContainer}>
          <Text variant="captionSm" color="primary" style={styles.streakStatus}>
            {score === 100 ? '🎯 Perfect Day' : score >= 60 ? '⚡ Strong Flow' : '🌱 Building Day'}
          </Text>
        </View>
      </HStack>

      <ProgressBar
        progress={score / 100}
        color={score === 100 ? theme.colors.success : theme.colors.primary}
        height={8}
        style={styles.progressBar}
      />

      <HStack justify="space-between" style={styles.chipsRow}>
        {/* Wake 30 */}
        <View style={[styles.formulaChip, { backgroundColor: wakeDone ? '#E3F3E9' : theme.colors.surfaceAlt }]}>
          <Text variant="micro" color={wakeDone ? 'success' : 'muted'} style={styles.chipText}>
            WAKE: {wakeDone ? `+${wakePts}` : `0/${wakePts}`}
          </Text>
        </View>

        {/* Water 30 */}
        <View style={[styles.formulaChip, { backgroundColor: waterDone ? '#E0F2FE' : theme.colors.surfaceAlt }]}>
          <Text variant="micro" color={waterDone ? 'primary' : 'muted'} style={styles.chipText}>
            WATER: {waterDone ? `+${waterPts}` : `0/${waterPts}`}
          </Text>
        </View>

        {/* Study 40 */}
        <View style={[styles.formulaChip, { backgroundColor: studyDone ? '#EEF2FF' : theme.colors.surfaceAlt }]}>
          <Text variant="micro" color={studyDone ? 'primary' : 'muted'} style={styles.chipText}>
            STUDY: {studyDone ? `+${studyPts}` : `0/${studyPts}`}
          </Text>
        </View>
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
  scoreText: {
    fontWeight: '800',
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FEF3C7',
  },
  streakStatus: {
    fontWeight: '700',
    color: '#92400E',
  },
  progressBar: {
    marginBottom: 14,
  },
  chipsRow: {
    marginTop: 4,
  },
  formulaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
