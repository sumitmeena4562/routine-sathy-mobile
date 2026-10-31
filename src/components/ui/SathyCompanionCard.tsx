import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { RoutineSathyEmblem } from './RoutineSathyEmblem';

export interface SathyCompanionCardProps {
  score: number;
  userName: string;
  wakeUpTime?: string;
  waterIntake?: number;
  targetWater?: number;
  studyHours?: number;
  targetStudy?: number;
}

export function SathyCompanionCard({
  score,
  userName,
  wakeUpTime,
  waterIntake = 0,
  targetWater = 3.0,
  studyHours = 0,
  targetStudy = 4.0,
}: SathyCompanionCardProps) {
  const theme = useTheme();
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const isComplete = score >= 100;

  // Curate dynamic warm Hinglish message matching Sathy's brand voice
  let message = '';
  if (isComplete) {
    message = `Shaandar, ${firstName}! 🎯 Aaj pure 100/100 points ho gaye. Sunrise streak bilkul safe hai. Ab aaram karo aur kal subah fresh start karenge!`;
  } else if (!wakeUpTime) {
    message = `Subah bakhair, ${firstName}! 🌅 Pehla step wake-up log karo aur +250ml paani piyo. Pehle 30 points turant milenge!`;
  } else if (waterIntake < targetWater) {
    const leftWater = Math.max(0, targetWater - waterIntake).toFixed(1);
    message = `Bahut badhiya, ${firstName}! 💧 Bas ${leftWater}L paani bacha hai daily goal ke liye. Ek quick tap se add kar lo.`;
  } else if (studyHours < targetStudy) {
    const leftStudy = Math.max(0, targetStudy - studyHours).toFixed(1);
    message = `Almost there, ${firstName}! 📚 Bas ${leftStudy}h ki study bachi hai pure 100/100 score ke liye. Keep going!`;
  } else {
    message = `Good progress, ${firstName}! 🌿 Aaj ka rhythm bilkul on-track hai. Tap quick actions to reach your daily 100.`;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.mascotCol}>
          <View
            style={[
              styles.emblemHalo,
              {
                backgroundColor: theme.isDark
                  ? SemanticDarkTokens.color.bg.tileMint
                  : SemanticLightTokens.color.bg.tileMint,
              },
            ]}>
            <RoutineSathyEmblem size={28} />
          </View>
          <View>
            <View style={styles.sathyTitleRow}>
              <Text style={[styles.companionName, { color: theme.colors.text }]}>
                Sathy
              </Text>
              <View
                style={[
                  styles.companionBadge,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : PrimitiveTokens.color.neutral[200],
                  },
                ]}>
                <Text
                  style={[
                    styles.companionBadgeText,
                    { color: theme.colors.textSecondary },
                  ]}>
                  Routine Companion
                </Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {isComplete ? 'Daily goal celebrated' : 'Daily check-in'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sathy Message Bubble */}
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.borderSubtle,
          },
        ]}>
        <Text style={[styles.messageText, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PrimitiveTokens.radius['2xl'],
    borderWidth: 1,
    padding: PrimitiveTokens.space[4],
    marginBottom: PrimitiveTokens.space[4],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[3],
  },
  mascotCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space['2_5'],
  },
  emblemHalo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sathyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space['1_5'],
  },
  companionName: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
    letterSpacing: -0.2,
  },
  companionBadge: {
    paddingHorizontal: PrimitiveTokens.space['1_5'],
    paddingVertical: 2,
    borderRadius: PrimitiveTokens.radius.xs,
  },
  companionBadgeText: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 1,
  },
  messageBubble: {
    padding: PrimitiveTokens.space[3],
    borderRadius: PrimitiveTokens.radius.lg,
    borderWidth: 1,
  },
  messageText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    lineHeight: TypographyScale.bodySm.lineHeight,
  },
});
