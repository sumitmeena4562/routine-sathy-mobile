import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { useAlarmContext } from '@/context/AlarmContext';
import { PrimitiveTokens } from '@/theme/tokens.generated';
import { Text } from './Text';
import { HStack, VStack } from './Box';

export interface AlarmRingingModalProps {
  onWakeCompleted?: (result: { wakeUpTime: string; waterLogged?: number }) => void;
}

// ----------------------------------------------------------------------------
// Simple Random Math Question Generator
// ----------------------------------------------------------------------------
function createMathProblem(): { q: string; ans: number; options: number[] } {
  const n1 = Math.floor(Math.random() * 15) + 6; // 6 to 20
  const n2 = Math.floor(Math.random() * 15) + 4; // 4 to 18
  const sum = n1 + n2;
  const wrong1 = sum - 2;
  const wrong2 = sum + 3;
  const wrong3 = sum + 1;
  const opts = Array.from(new Set([sum, wrong1, wrong2, wrong3])).slice(0, 4);
  opts.sort(() => Math.random() - 0.5);
  return { q: `${n1} + ${n2}`, ans: sum, options: opts };
}

// ----------------------------------------------------------------------------
// Main Alarm Ringing Content
// ----------------------------------------------------------------------------
function AlarmRingingContent({ onWakeCompleted }: AlarmRingingModalProps) {
  const insets = useSafeAreaInsets();
  const { config, dismissAlarm, snoozeAlarm, snoozeCount, maxSnoozes } = useAlarmContext();

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [mathProblem] = useState(createMathProblem);
  const [mathError, setMathError] = useState(false);

  // Live real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const snoozesLeft = Math.max(0, maxSnoozes - snoozeCount);
  const canSnooze = snoozesLeft > 0;

  // Gentle breathing pulse animation for the sunrise orb
  const pulseScale = useSharedValue(1);
  const pulseGlow = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1400 }),
        withTiming(1.0, { duration: 1400 })
      ),
      -1,
      true
    );
    pulseGlow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1400 }),
        withTiming(0.4, { duration: 1400 })
      ),
      -1,
      true
    );
  }, [pulseScale, pulseGlow]);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseGlow.value,
  }));

  // Handlers
  const handleWaterDismiss = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await dismissAlarm({ waterLogged: 0.25 });
    onWakeCompleted?.({ wakeUpTime: config.time, waterLogged: 0.25 });
  };

  const handleMathAnswer = async (selected: number) => {
    if (selected === mathProblem.ans) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await dismissAlarm();
      onWakeCompleted?.({ wakeUpTime: config.time });
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
    onWakeCompleted?.({ wakeUpTime: config.time });
  };

  const handleSnooze = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await snoozeAlarm(5);
  };

  // Formatted Current Time & Date
  const { timeString, ampmString, dateString } = useMemo(() => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dateFormatted = `${days[currentTime.getDay()]}, ${months[currentTime.getMonth()]} ${currentTime.getDate()}`;

    return {
      timeString: `${formattedHours}:${formattedMinutes}`,
      ampmString: ampm,
      dateString: dateFormatted,
    };
  }, [currentTime]);

  const amberSolid = PrimitiveTokens.color.amber[400];
  const darkForest = PrimitiveTokens.color.forest[950];

  return (
    <LinearGradient
      colors={['#051810', '#0A2D20', '#03120B']}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View
        style={[
          styles.contentWrap,
          {
            paddingTop: Math.max(insets.top + 16, 44),
            paddingBottom: Math.max(insets.bottom + 16, 28),
          },
        ]}
      >
        {/* Top Header Tag */}
        <VStack align="center" gap={4} style={styles.topHeader}>
          <HStack align="center" gap={6}>
            <Ionicons name="sunny-outline" size={14} color={amberSolid} />
            <Text style={[styles.headerTag, { color: amberSolid }]}>
              ROUTINE SATHY
            </Text>
          </HStack>
          <Text style={styles.dateText}>{dateString}</Text>
        </VStack>

        {/* Center Section: Glowing Sunrise Emblem & Live Digital Clock */}
        <VStack align="center" gap={20} style={styles.centerClockGroup}>
          <View style={styles.orbWrapper}>
            {/* Outer expanding glow ring */}
            <Animated.View style={[styles.glowRing, animatedGlowStyle]} />

            {/* Pulsing center sun orb */}
            <Animated.View style={[styles.sunriseOrb, animatedOrbStyle]}>
              <LinearGradient
                colors={['#FCD34D', '#F59E0B', '#D97706']}
                style={styles.orbGradient}
              >
                <Ionicons name="sunny" size={44} color={darkForest} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Large, Beautiful Digital Clock Display */}
          <VStack align="center" gap={4}>
            <HStack align="flex-end" justify="center" gap={6}>
              <Text style={styles.clockDigits}>{timeString}</Text>
              <Text style={styles.clockAmPm}>{ampmString}</Text>
            </HStack>
            <Text style={styles.morningGreeting}>
              Good morning! Time to start your day.
            </Text>
          </VStack>
        </VStack>

        {/* Bottom Interactive Action Card */}
        <View style={styles.actionCard}>
          {/* ========================================================
              CASE 1: WATER CHALLENGE
              ======================================================== */}
          {config.mission === 'water' ? (
            <VStack align="center" gap={12} style={{ width: '100%' }}>
              <HStack align="center" gap={6}>
                <Ionicons name="water" size={18} color="#38BDF8" />
                <Text style={styles.missionTitle}>Drink 1 Glass of Water</Text>
              </HStack>

              <Text style={styles.missionHint}>
                Drink 250ml water to silence alarm & log hydration
              </Text>

              {/* Primary Stop & Log Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleWaterDismiss}
                style={styles.primaryActionBtn}
              >
                <LinearGradient
                  colors={['#FDE68A', '#F59E0B']}
                  style={styles.btnGradient}
                >
                  <Ionicons name="water" size={20} color={darkForest} />
                  <Text style={[styles.btnText, { color: darkForest }]}>
                    I Drank Water (Stop Alarm)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Snooze & Skip Row */}
              <HStack justify="space-between" align="center" style={styles.subActionsRow}>
                <TouchableOpacity
                  onPress={canSnooze ? handleSnooze : undefined}
                  disabled={!canSnooze}
                  hitSlop={8}
                  style={[styles.secondaryPill, !canSnooze && { opacity: 0.4 }]}
                >
                  <Ionicons name="time-outline" size={14} color="#CBD5E1" />
                  <Text style={styles.secondaryPillText}>
                    {canSnooze ? `Snooze (${config.snoozeMinutes || 5}m)` : 'No snoozes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNormalDismiss}
                  hitSlop={8}
                  style={styles.secondaryPill}
                >
                  <Text style={styles.secondaryPillText}>Just Stop</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          ) : config.mission === 'math' ? (
            /* ========================================================
                CASE 2: MATH CHALLENGE
                ======================================================== */
            <VStack align="center" gap={12} style={{ width: '100%' }}>
              <Text style={styles.missionTitle}>Solve to Stop Alarm</Text>
              <Text style={styles.mathQuestion}>{mathProblem.q} = ?</Text>

              {mathError && (
                <Text style={styles.mathErrorText}>Wrong sum! Try again.</Text>
              )}

              {/* 4 Answer Option Pads */}
              <HStack gap={8} style={{ width: '100%' }}>
                {mathProblem.options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleMathAnswer(opt)}
                    style={styles.mathOptionPad}
                  >
                    <Text style={styles.mathOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </HStack>

              {/* Snooze & Skip */}
              <HStack justify="space-between" align="center" style={styles.subActionsRow}>
                <TouchableOpacity
                  onPress={canSnooze ? handleSnooze : undefined}
                  disabled={!canSnooze}
                  hitSlop={8}
                  style={[styles.secondaryPill, !canSnooze && { opacity: 0.4 }]}
                >
                  <Ionicons name="time-outline" size={14} color="#CBD5E1" />
                  <Text style={styles.secondaryPillText}>
                    {canSnooze ? `Snooze (${config.snoozeMinutes || 5}m)` : 'No snoozes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNormalDismiss}
                  hitSlop={8}
                  style={styles.secondaryPill}
                >
                  <Text style={styles.secondaryPillText}>Skip & Stop</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          ) : (
            /* ========================================================
                CASE 3: NORMAL 1-TAP ALARM
                ======================================================== */
            <VStack align="center" gap={12} style={{ width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNormalDismiss}
                style={styles.primaryActionBtn}
              >
                <LinearGradient
                  colors={['#FDE68A', '#F59E0B']}
                  style={styles.btnGradient}
                >
                  <Ionicons name="sunny" size={22} color={darkForest} />
                  <Text style={[styles.btnText, { color: darkForest }]}>
                    Stop Alarm
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Snooze Button */}
              {canSnooze && (
                <TouchableOpacity
                  onPress={handleSnooze}
                  hitSlop={8}
                  style={styles.snoozePill}
                >
                  <Ionicons name="time-outline" size={15} color="#CBD5E1" />
                  <Text style={styles.snoozePillText}>
                    Snooze for {config.snoozeMinutes || 5} mins
                  </Text>
                </TouchableOpacity>
              )}
            </VStack>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

// ----------------------------------------------------------------------------
// Exported Modal Wrapper
// ----------------------------------------------------------------------------
export function AlarmRingingModal({ onWakeCompleted }: AlarmRingingModalProps) {
  const { isRinging } = useAlarmContext();

  if (!isRinging) return null;

  return (
    <Modal visible={isRinging} animationType="fade" transparent={false} statusBarTranslucent>
      <AlarmRingingContent onWakeCompleted={onWakeCompleted} />
    </Modal>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHeader: {
    alignItems: 'center',
    marginTop: 6,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginTop: 2,
  },
  centerClockGroup: {
    alignItems: 'center',
    marginVertical: 'auto',
  },
  orbWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  sunriseOrb: {
    width: 86,
    height: 86,
    borderRadius: 43,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockDigits: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    lineHeight: 60,
  },
  clockAmPm: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginLeft: 2,
  },
  morningGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
  },
  missionTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  missionHint: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: -4,
  },
  primaryActionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontWeight: '800',
    fontSize: 15,
  },
  subActionsRow: {
    width: '100%',
    marginTop: 4,
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryPillText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  mathQuestion: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  mathErrorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  mathOptionPad: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mathOptionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  snoozePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  snoozePillText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
