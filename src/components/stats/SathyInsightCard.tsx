import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

export interface SathyInsightCardProps {
  bestDayName?: string;
  bestScore?: number;
  bestWakeTime?: string;
  isEmpty?: boolean;
  onPressAction?: () => void;
}

export function SathyInsightCard({
  bestDayName,
  bestScore,
  bestWakeTime,
  isEmpty = false,
  onPressAction,
}: SathyInsightCardProps) {
  const message = isEmpty
    ? 'I will share insights after 3 days of logging. For now, just log one small step today.'
    : bestDayName && bestScore
      ? `Your best day this week was ${bestDayName} (${bestScore} pts). You woke at ${bestWakeTime || '06:00 AM'} that morning. Try an early start tomorrow.`
      : 'Keep building daily consistency. Small steps create unstoppable momentum.';

  return (
    <View style={styles.card}>
      <View style={styles.avatarCircle}>
        <Ionicons name="sparkles" size={17} color="#5BDB8B" />
      </View>

      <View style={styles.contentCol}>
        <Text style={styles.eyebrow}>SATHY NOTICED</Text>
        <Text style={styles.messageText}>{message}</Text>

        {onPressAction && (
          <Pressable
            onPress={onPressAction}
            accessibilityRole="button"
            accessibilityLabel="Chat with Sathy"
            style={({ pressed }) => [
              styles.ctaBtn,
              pressed && { opacity: 0.85 },
            ]}>
            <Text style={styles.ctaText}>Chat with Sathy</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: PrimitiveTokens.space[3],
    alignItems: 'flex-start',
    backgroundColor: '#07261B', // Deep forest background
    borderRadius: PrimitiveTokens.radius.xl,
    padding: PrimitiveTokens.space[4],
    borderWidth: 1,
    borderColor: 'rgba(91, 219, 139, 0.2)',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(91, 219, 139, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentCol: {
    flex: 1,
  },
  eyebrow: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    color: '#6EE7B7', // Mint green highlight
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  messageText: {
    fontSize: 12.5,
    fontFamily: TypographyScale.body.fontFamily,
    color: '#F4F7F4',
    lineHeight: 18,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FBBF24', // Amber action
    borderRadius: PrimitiveTokens.radius.md,
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space[2],
    marginTop: PrimitiveTokens.space[2],
  },
  ctaText: {
    fontSize: 11,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
    color: '#0B3D2E',
  },
});
