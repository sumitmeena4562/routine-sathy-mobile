import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useAlarmContext } from '@/context/AlarmContext';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { formatAlarmTime12hr } from '@/utils/circadianAlarm';

interface AlarmRingingModalProps {
  onWakeCompleted?: (result: { wakeUpTime: string; waterLogged?: number }) => void;
}

function createMathProblem(): { q: string; ans: number; options: number[] } {
  const n1 = Math.floor(Math.random() * 20) + 11;
  const n2 = Math.floor(Math.random() * 20) + 11;
  const sum = n1 + n2;
  const opts = [sum, sum - 2, sum + 3, sum + 1].sort(() => Math.random() - 0.5);
  return { q: `${n1} + ${n2}`, ans: sum, options: opts };
}

interface AlarmRingingContentProps {
  onWakeCompleted?: (result: { wakeUpTime: string; waterLogged?: number }) => void;
}

function AlarmRingingContent({ onWakeCompleted }: AlarmRingingContentProps) {
  const { config, dismissAlarm, snoozeAlarm } = useAlarmContext();
  const [mathProblem] = useState(createMathProblem);
  const [mathError, setMathError] = useState(false);

  // Pulse animation for sunrise emblem
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1200 }),
        withTiming(1.0, { duration: 1200 })
      ),
      -1,
      true
    );
  }, [pulseScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleWaterDismiss = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await dismissAlarm({ waterLogged: 0.25 });
    if (onWakeCompleted) {
      onWakeCompleted({ wakeUpTime: config.time, waterLogged: 0.25 });
    }
  };

  const handleMathAnswer = async (selected: number) => {
    if (selected === mathProblem.ans) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await dismissAlarm();
      if (onWakeCompleted) {
        onWakeCompleted({ wakeUpTime: config.time });
      }
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setMathError(true);
      setTimeout(() => setMathError(false), 1200);
    }
  };

  const handleNormalDismiss = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await dismissAlarm();
    if (onWakeCompleted) {
      onWakeCompleted({ wakeUpTime: config.time });
    }
  };

  const handleSnooze = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await snoozeAlarm(5);
  };

  const formattedTime = formatAlarmTime12hr(config.time);

  return (
    <LinearGradient
      colors={['#0F2D20', '#1C4A36', '#091A13']}
      style={styles.container}
    >
      <VStack align="center" justify="space-between" style={styles.contentWrap}>
        {/* Top Branding Header */}
        <VStack align="center" gap={4} style={styles.topHeader}>
          <Text variant="captionSm" style={styles.appHeaderTag}>
            ROUTINE SATHY · CIRCADIAN ANCHOR
          </Text>
          <Text variant="captionSm" style={styles.dawnSubtitle}>
            Sunrise synchronization active
          </Text>
        </VStack>

        {/* Center Pulsing Sunrise Emblem & Clock */}
        <VStack align="center" gap={16} style={styles.centerClockGroup}>
          <Animated.View style={[styles.sunriseOrb, animatedIconStyle]}>
            <LinearGradient
              colors={['#F59E0B', '#D97706', '#B45309']}
              style={styles.orbGradient}
            >
              <Ionicons name="sunny" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <VStack align="center" gap={4}>
            <Text style={styles.clockDisplay}>{formattedTime}</Text>
            <Text style={styles.morningGreeting}>
              Good morning! Time to anchor your circadian rhythm.
            </Text>
          </VStack>
        </VStack>

        {/* Wake-Up Mission Interactive Section */}
        <View style={styles.missionCard}>
          {config.mission === 'water' ? (
            <VStack align="center" gap={14}>
              <HStack align="center" gap={8}>
                <Ionicons name="water" size={20} color="#38BDF8" />
                <Text style={styles.missionTitle}>HYDRATION MISSION</Text>
              </HStack>
              <Text style={styles.missionDesc}>
                Drink 1 glass of water (250ml) to awaken your digestion and stop the alarm.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleWaterDismiss}
                style={styles.waterActionBtn}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.waterBtnGradient}
                >
                  <Ionicons name="water" size={22} color="#000000" />
                  <Text style={styles.waterBtnText}>
                    I Drank 250ml Water (Stop Alarm)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </VStack>
          ) : config.mission === 'math' ? (
            <VStack align="center" gap={14}>
              <HStack align="center" gap={8}>
                <Ionicons name="calculator" size={20} color="#F59E0B" />
                <Text style={styles.missionTitle}>PREFRONTAL WAKE SUM</Text>
              </HStack>
              <Text style={styles.mathQuestion}>{mathProblem.q} = ?</Text>
              {mathError && (
                <Text style={styles.errorText}>Incorrect sum, try again!</Text>
              )}

              <HStack gap={10} style={{ width: '100%' }}>
                {mathProblem.options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleMathAnswer(opt)}
                    style={styles.mathOptionBtn}
                  >
                    <Text style={styles.mathOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </HStack>
            </VStack>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleNormalDismiss}
              style={styles.waterActionBtn}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.waterBtnGradient}
              >
                <Ionicons name="sunny" size={22} color="#000000" />
                <Text style={styles.waterBtnText}>Stop Alarm & Start Day</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Action options: Snooze + Optional Stop Without Logging */}
          <HStack justify="center" align="center" gap={20} style={{ marginTop: 14, width: '100%' }}>
            <TouchableOpacity onPress={handleSnooze} hitSlop={8} style={styles.subtleActionBtn}>
              <HStack align="center" gap={6}>
                <Ionicons name="time-outline" size={15} color="#94A3B8" />
                <Text style={styles.subtleActionText}>Snooze (5m)</Text>
              </HStack>
            </TouchableOpacity>

            {config.mission !== 'none' && (
              <TouchableOpacity onPress={handleNormalDismiss} hitSlop={8} style={styles.subtleActionBtn}>
                <HStack align="center" gap={6}>
                  <Ionicons name="close-circle-outline" size={15} color="#94A3B8" />
                  <Text style={styles.subtleActionText}>Stop Without Logging</Text>
                </HStack>
              </TouchableOpacity>
            )}
          </HStack>
        </View>
      </VStack>
    </LinearGradient>
  );
}

export function AlarmRingingModal({ onWakeCompleted }: AlarmRingingModalProps) {
  const { isRinging } = useAlarmContext();

  if (!isRinging) return null;

  return (
    <Modal visible={isRinging} animationType="fade" transparent={false} statusBarTranslucent>
      <AlarmRingingContent onWakeCompleted={onWakeCompleted} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  topHeader: {
    marginTop: 10,
  },
  appHeaderTag: {
    color: '#F59E0B',
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 11,
  },
  dawnSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    fontSize: 12,
  },
  centerClockGroup: {
    marginVertical: 'auto',
  },
  sunriseOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockDisplay: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  morningGreeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
  },
  missionCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  missionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  missionDesc: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 270,
  },
  waterActionBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  waterBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  waterBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
  mathQuestion: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  mathOptionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mathOptionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  subtleActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  subtleActionText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  snoozeBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  snoozeText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '600',
  },
});
