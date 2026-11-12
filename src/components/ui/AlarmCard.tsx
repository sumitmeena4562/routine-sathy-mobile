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
  embedded?: boolean;
}

export function AlarmCard({ onOpenSettings, embedded = false }: AlarmCardProps) {
  const theme = useTheme();
  const { config, toggleAlarm, countdownText } = useAlarmContext();

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

  const amberBg = theme.isDark ? 'rgba(245, 158, 11, 0.15)' : PrimitiveTokens.color.amber[100];
  const amberBorder = theme.isDark ? 'rgba(245, 158, 11, 0.3)' : PrimitiveTokens.color.amber[300];
  const amberText = theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[800];

  return (
    <View
      style={[
        embedded ? styles.embeddedContainer : styles.standaloneCard,
        !embedded && {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        onPress={handleCardPress}
        accessibilityRole="button"
        accessibilityLabel="Customize Circadian Wake Alarm"
        style={({ pressed }) => [styles.anchorLeft, pressed && { opacity: 0.75 }]}
      >
        <View
          style={[
            styles.miniIconTile,
            {
              backgroundColor: config.enabled ? amberBg : theme.colors.surfaceAlt,
              borderColor: config.enabled ? amberBorder : theme.colors.borderSubtle,
            },
          ]}
        >
          <Ionicons
            name={config.enabled ? 'alarm' : 'alarm-outline'}
            size={16}
            color={config.enabled ? amberText : theme.colors.textMuted}
          />
        </View>

        <View style={styles.anchorDetails}>
          <View style={styles.anchorTitleRow}>
            <Text style={[styles.alarmTitle, { color: theme.colors.text }]}>
              Circadian Alarm
            </Text>
            <View
              style={[
                styles.timeBadge,
                {
                  backgroundColor: config.enabled ? amberBg : theme.colors.surfaceAlt,
                  borderColor: config.enabled ? amberBorder : theme.colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.timeBadgeText,
                  { color: config.enabled ? amberText : theme.colors.textMuted },
                ]}
              >
                {formattedTime}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} style={{ marginLeft: 2 }} />
          </View>

          <Text style={[styles.anchorMeta, { color: theme.colors.textSecondary }]}>
            {config.enabled ? `🔔 ${countdownText}` : 'Alarm is turned off'}
          </Text>
        </View>
      </Pressable>

      {/* Right toggle */}
      <View style={styles.rightControls}>
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
  embeddedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 2,
    width: '100%',
  },
  standaloneCard: {
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
    gap: 10,
    paddingRight: 8,
  },
  miniIconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorDetails: {
    flex: 1,
  },
  anchorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alarmTitle: {
    fontSize: TypographyScale.caption.fontSize,
    lineHeight: TypographyScale.caption.lineHeight,
    fontWeight: '700',
  },
  timeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: PrimitiveTokens.radius.sm,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  anchorMeta: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
    fontWeight: '500',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
