import React from 'react';
import { StyleSheet, View, Pressable, Switch, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { useAlarmContext } from '@/context/AlarmContext';
import { PrimitiveTokens, TypographyScale } from '@/theme/tokens.generated';
import { formatAlarmTime12hr } from '@/utils/circadianAlarm';

interface AlarmCardProps {
  onOpenSettings: () => void;
}

export function AlarmCard({ onOpenSettings }: AlarmCardProps) {
  const theme = useTheme();
  const { config, toggleAlarm, countdownText, triggerTestAlarm } = useAlarmContext();

  const handleToggle = (val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleAlarm(val);
  };

  const handleCardPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onOpenSettings();
  };

  const formattedTime = formatAlarmTime12hr(config.time);

  return (
    <View
      style={[
        styles.anchorCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        onPress={handleCardPress}
        accessibilityRole="button"
        accessibilityLabel="Customize Circadian Wake Alarm"
        style={({ pressed }) => [styles.anchorLeft, pressed && { opacity: 0.8 }]}
      >
        <View
          style={[
            styles.anchorIconTile,
            {
              backgroundColor: theme.isDark
                ? 'rgba(245, 158, 11, 0.15)'
                : PrimitiveTokens.color.amber[100],
            },
          ]}
        >
          <Ionicons
            name={config.enabled ? 'alarm' : 'alarm-outline'}
            size={20}
            color={
              theme.isDark
                ? PrimitiveTokens.color.amber[400]
                : PrimitiveTokens.color.amber[700]
            }
          />
        </View>

        <View style={styles.anchorDetails}>
          <View style={styles.anchorTitleRow}>
            <Text style={[styles.anchorTitle, { color: theme.colors.text }]}>
              Circadian Alarm
            </Text>
            <View
              style={[
                styles.timeBadge,
                {
                  backgroundColor: config.enabled
                    ? (theme.isDark ? 'rgba(245, 158, 11, 0.15)' : PrimitiveTokens.color.amber[100])
                    : theme.colors.surfaceAlt,
                  borderColor: config.enabled
                    ? (theme.isDark ? 'rgba(245, 158, 11, 0.3)' : PrimitiveTokens.color.amber[300])
                    : theme.colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.timeBadgeText,
                  {
                    color: config.enabled
                      ? (theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[800])
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {formattedTime}
              </Text>
            </View>
          </View>

          <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
            {config.enabled ? `🔔 ${countdownText}` : 'Alarm is disabled'}
          </Text>
        </View>
      </Pressable>

      {/* Right controls: Play test button + Toggle switch */}
      <View style={styles.rightControls}>
        {__DEV__ && config.enabled && (
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              triggerTestAlarm();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Test Alarm Ringing Screen"
            style={({ pressed }) => [
              styles.testBtn,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.borderSubtle,
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="play" size={13} color={theme.colors.textSecondary} />
          </Pressable>
        )}

        <Switch
          value={config.enabled}
          onValueChange={handleToggle}
          trackColor={{
            false: theme.colors.surfaceAlt,
            true: PrimitiveTokens.color.amber[400],
          }}
          thumbColor={config.enabled ? '#FFFFFF' : theme.colors.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: PrimitiveTokens.radius.xl,
    borderWidth: 1,
    padding: PrimitiveTokens.space[3],
    marginVertical: 4,
  },
  anchorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    paddingRight: PrimitiveTokens.space[2],
  },
  anchorIconTile: {
    width: 44,
    height: 44,
    borderRadius: PrimitiveTokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorDetails: {
    flex: 1,
  },
  anchorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anchorTitle: {
    fontSize: TypographyScale.bodySm.fontSize,
    lineHeight: TypographyScale.bodySm.lineHeight,
    fontWeight: '700',
  },
  timeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: PrimitiveTokens.radius.sm,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  anchorMeta: {
    fontSize: TypographyScale.captionSm.fontSize,
    lineHeight: TypographyScale.captionSm.lineHeight,
    marginTop: 2,
    fontWeight: '500',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testBtn: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: PrimitiveTokens.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
