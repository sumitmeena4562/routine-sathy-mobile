import React from 'react';
import { StyleSheet, View, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { useAlarmContext } from '@/context/AlarmContext';
import { PrimitiveTokens } from '@/theme/tokens.generated';
import { Card } from './Card';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { formatAlarmTime12hr } from '@/utils/circadianAlarm';

interface AlarmCardProps {
  onOpenSettings: () => void;
}

export function AlarmCard({ onOpenSettings }: AlarmCardProps) {
  const theme = useTheme();
  const { config, toggleAlarm, countdownText, triggerTestAlarm } = useAlarmContext();

  const handleToggle = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleAlarm(val);
  };

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenSettings();
  };

  const formattedTime = formatAlarmTime12hr(config.time);

  const amberBg = theme.isDark ? 'rgba(245, 158, 11, 0.15)' : PrimitiveTokens.color.amber[100];
  const amberBorder = theme.isDark ? 'rgba(245, 158, 11, 0.3)' : PrimitiveTokens.color.amber[200];
  const amberIconColor = theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[800];

  return (
    <Card variant="surface" padding={16} radius={20} style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handleCardPress}
        style={styles.innerTouchable}
      >
        <HStack justify="space-between" align="center" style={styles.contentRow}>
          {/* Left info */}
          <HStack align="center" gap={12} style={styles.leftGroup}>
            <View 
              style={[
                styles.iconContainer, 
                { 
                  backgroundColor: config.enabled ? amberBg : theme.colors.surfaceAlt,
                  borderColor: config.enabled ? amberBorder : theme.colors.borderSubtle,
                }
              ]}
            >
              <Ionicons 
                name={config.enabled ? "alarm" : "alarm-outline"} 
                size={22} 
                color={config.enabled ? amberIconColor : theme.colors.textMuted} 
              />
            </View>

            <VStack gap={3}>
              <HStack align="center" gap={6}>
                <Text variant="body" color="primary" style={styles.alarmTitle}>
                  Circadian Alarm
                </Text>
                <View 
                  style={[
                    styles.timeBadge, 
                    { 
                      backgroundColor: config.enabled ? amberBg : theme.colors.surfaceAlt,
                      borderColor: config.enabled ? amberBorder : theme.colors.borderSubtle,
                    }
                  ]}
                >
                  <Text 
                    variant="captionSm" 
                    style={[
                      styles.timeBadgeText, 
                      { color: config.enabled ? amberIconColor : theme.colors.textMuted }
                    ]}
                  >
                    {formattedTime}
                  </Text>
                </View>
              </HStack>

              <Text variant="captionSm" color="muted" style={styles.countdownText}>
                {config.enabled ? `🔔 ${countdownText}` : 'Alarm is disabled'}
              </Text>
            </VStack>
          </HStack>

          {/* Right toggle & test icon */}
          <HStack align="center" gap={10}>
            {__DEV__ && config.enabled && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  triggerTestAlarm();
                }}
                style={[styles.testButton, { borderColor: theme.colors.borderSubtle }]}
              >
                <Ionicons name="play" size={12} color={theme.colors.textMuted} />
              </TouchableOpacity>
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
          </HStack>
        </HStack>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  innerTouchable: {
    width: '100%',
  },
  contentRow: {
    width: '100%',
  },
  leftGroup: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontWeight: '800',
    fontSize: 11,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '500',
  },
  testButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
