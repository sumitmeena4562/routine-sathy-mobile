import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import { HStack, VStack } from './Box';

export interface HabitRowProps {
  title: string;
  subtitle: string;
  value?: string;
  points?: number;
  isCompleted: boolean;
  habitType: 'wake' | 'water' | 'study' | 'custom';
  iconName: keyof typeof Ionicons.glyphMap;
  onToggle: () => void;
  onPressDetails?: () => void;
}

export function HabitRow({
  title,
  subtitle,
  value,
  points,
  isCompleted,
  habitType,
  iconName,
  onToggle,
  onPressDetails,
}: HabitRowProps) {
  const theme = useTheme();

  // Curated habit identities matching design tokens
  const typeStyles = {
    wake: {
      tileBg: theme.isDark ? 'rgba(30, 158, 90, 0.2)' : '#E3F3E9',
      iconColor: theme.isDark ? '#5BDB8B' : '#16A34A',
    },
    water: {
      tileBg: theme.isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE',
      iconColor: theme.isDark ? '#38BDF8' : '#0284C7',
    },
    study: {
      tileBg: theme.isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF',
      iconColor: theme.isDark ? '#818CF8' : '#4F46E5',
    },
    custom: {
      tileBg: theme.colors.surfaceAlt,
      iconColor: theme.colors.primary,
    },
  }[habitType];

  const handleToggle = () => {
    Haptics.notificationAsync(
      isCompleted
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
    onToggle();
  };

  return (
    <Pressable
      onPress={onPressDetails}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isCompleted ? theme.colors.borderSubtle : theme.colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <HStack gap={14} align="center" style={styles.leftSection}>
        {/* Habit Icon Tile */}
        <View style={[styles.tile, { backgroundColor: typeStyles.tileBg }]}>
          <Ionicons name={iconName} size={22} color={typeStyles.iconColor} />
        </View>

        {/* Title & Subtitle */}
        <VStack gap={2} style={styles.textContainer}>
          <HStack gap={6} align="center">
            <Text
              variant="bodyStrong"
              color={isCompleted ? 'muted' : 'primary'}
              style={isCompleted ? styles.completedText : undefined}
            >
              {title}
            </Text>
            {points !== undefined && (
              <View style={styles.ptsBadge}>
                <Text variant="micro" color="secondary" style={styles.ptsText}>
                  +{points}
                </Text>
              </View>
            )}
          </HStack>

          <Text variant="caption" color="muted">
            {subtitle} {value ? `• ${value}` : ''}
          </Text>
        </VStack>
      </HStack>

      {/* Check Control Button (Min Touch Target 48dp) */}
      <Pressable
        onPress={handleToggle}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.checkButton,
          {
            backgroundColor: isCompleted ? '#1E9E5A' : 'transparent',
            borderColor: isCompleted ? '#16A34A' : theme.colors.border,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  ptsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
    backgroundColor: '#F0F4F1',
  },
  ptsText: {
    fontWeight: '700',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
