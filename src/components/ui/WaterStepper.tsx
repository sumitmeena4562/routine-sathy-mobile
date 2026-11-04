import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { Card } from './Card';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { ProgressBar } from './ProgressBar';

export interface WaterStepperProps {
  currentLiters: number;
  targetLiters?: number;
  onAddAmount: (amountMl: number) => void;
  onReset?: () => void;
}

export function WaterStepper({
  currentLiters,
  targetLiters = 3.0,
  onAddAmount,
  onReset,
}: WaterStepperProps) {
  const theme = useTheme();
  const progress = Math.min(currentLiters / targetLiters, 1);
  const isGoalReached = currentLiters >= targetLiters;

  const handleAdd = (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAddAmount(ml);
  };

  return (
    <Card variant="surface" padding={18} radius={22} style={styles.card}>
      <HStack justify="space-between" align="center" style={styles.header}>
        <HStack gap={12} align="center">
          <View style={[styles.waterTile, { backgroundColor: theme.isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE' }]}>
            <Ionicons name="water" size={22} color={theme.isDark ? '#38BDF8' : '#0284C7'} />
          </View>
          <VStack gap={2}>
            <Text variant="bodyStrong" color="primary">
              Hydration (Paani)
            </Text>
            <Text variant="caption" color="muted">
              {currentLiters.toFixed(1)}L of {targetLiters.toFixed(1)}L Daily Target
            </Text>
          </VStack>
        </HStack>

        <Text variant="h3" tabular color={isGoalReached ? 'success' : 'primary'}>
          {isGoalReached ? '✓ Done' : `${Math.round(progress * 100)}%`}
        </Text>
      </HStack>

      <ProgressBar
        progress={progress}
        color={isGoalReached ? '#1E9E5A' : '#0284C7'}
        height={6}
        style={styles.progressBar}
      />

      {/* Stepper Quick-Add Buttons */}
      <HStack justify="flex-end" gap={10} style={styles.buttonsRow}>
        <Pressable
          onPress={() => handleAdd(250)}
          style={({ pressed }) => [
            styles.stepperPill,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Ionicons name="add" size={14} color={theme.colors.text} />
          <Text variant="captionSm" color="primary" style={styles.pillText}>
            250 ml
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleAdd(500)}
          style={({ pressed }) => [
            styles.stepperPill,
            {
              backgroundColor: '#E0F2FE',
              borderColor: '#BAE6FD',
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Ionicons name="add" size={14} color="#0284C7" />
          <Text variant="captionSm" style={[styles.pillText, { color: '#0369A1' }]}>
            500 ml
          </Text>
        </Pressable>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
  header: {
    marginBottom: 14,
  },
  waterTile: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginBottom: 12,
  },
  buttonsRow: {
    marginTop: 2,
  },
  stepperPill: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillText: {
    fontWeight: '700',
  },
});
