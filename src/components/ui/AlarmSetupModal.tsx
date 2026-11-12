import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useAlarmContext } from '@/context/AlarmContext';
import { PrimitiveTokens } from '@/theme/tokens.generated';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { Button } from './Button';
import { AlarmSoundId, AlarmMissionType } from '@/types/alarm';
import { formatAlarmTime12hr, calculateSleepCycles } from '@/utils/circadianAlarm';
import { alarmAudio } from '@/services/alarmAudio';

interface AlarmSetupModalProps {
  visible: boolean;
  onClose: () => void;
}

const SOUND_OPTIONS: { id: AlarmSoundId; label: string; icon: string; desc: string }[] = [
  { id: 'sunrise-forest', label: 'Sunrise Forest', icon: 'sunny-outline', desc: 'Birds singing & soft morning breeze' },
  { id: 'ocean-waves', label: 'Ocean Tide', icon: 'water-outline', desc: 'Rhythmic rolling waves' },
  { id: 'zen-bowl', label: 'Tibetan Zen Bowl', icon: 'notifications-outline', desc: '528Hz acoustic temple chime' },
  { id: 'energetic-dawn', label: 'Energetic Dawn', icon: 'flash-outline', desc: 'Upbeat acoustic wake rhythm' },
];

const MISSION_OPTIONS: { id: AlarmMissionType; label: string; icon: string; desc: string; badge?: string }[] = [
  { id: 'water', label: 'Hydration Challenge', icon: 'water', desc: 'Drink 1 glass of water to silence & auto-log 250ml', badge: 'RECOMMENDED' },
  { id: 'math', label: 'Quick Math Sum', icon: 'calculator-outline', desc: 'Solve a simple sum to awaken prefrontal cortex' },
  { id: 'none', label: 'Normal Swipe', icon: 'hand-left-outline', desc: 'Simple tap to stop alarm' },
];

const DAY_LABELS = [
  { label: 'S', name: 'Sun' },
  { label: 'M', name: 'Mon' },
  { label: 'T', name: 'Tue' },
  { label: 'W', name: 'Wed' },
  { label: 'T', name: 'Thu' },
  { label: 'F', name: 'Fri' },
  { label: 'S', name: 'Sat' },
];

const TIME_PRESETS = [
  { h: 5, m: 30, ampm: 'AM' as const, label: '5:30 AM' },
  { h: 6, m: 0, ampm: 'AM' as const, label: '6:00 AM' },
  { h: 6, m: 30, ampm: 'AM' as const, label: '6:30 AM' },
  { h: 7, m: 0, ampm: 'AM' as const, label: '7:00 AM' },
];

function AlarmSetupContent({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { config, updateConfig, triggerTestAlarm } = useAlarmContext();

  const [selectedHour, setSelectedHour] = useState(() => {
    const [hStr] = (config.time || '06:00').split(':');
    let h = parseInt(hStr, 10) || 6;
    h = h % 12 || 12;
    return h;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const [, mStr] = (config.time || '06:00').split(':');
    return parseInt(mStr, 10) || 0;
  });
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(() => {
    const [hStr] = (config.time || '06:00').split(':');
    const h = parseInt(hStr, 10) || 6;
    return h >= 12 ? 'PM' : 'AM';
  });
  const [selectedDays, setSelectedDays] = useState<number[]>(config.days || [1, 2, 3, 4, 5]);
  const [selectedSound, setSelectedSound] = useState<AlarmSoundId>(config.sound || 'sunrise-forest');
  const [selectedRamp, setSelectedRamp] = useState<0 | 2 | 5>(config.gradualRampMinutes ?? 2);
  const [selectedMission, setSelectedMission] = useState<AlarmMissionType>(config.mission || 'water');
  const [bedtimeNudge, setBedtimeNudge] = useState<boolean>(config.bedtimeReminderEnabled ?? true);
  const [previewingSound, setPreviewingSound] = useState<AlarmSoundId | null>(null);

  // Clean up sound preview on unmount
  useEffect(() => {
    return () => {
      alarmAudio.stop();
    };
  }, []);

  const time24hString = React.useMemo(() => {
    let h24 = selectedHour;
    if (selectedAmPm === 'PM' && h24 < 12) h24 += 12;
    if (selectedAmPm === 'AM' && h24 === 12) h24 = 0;
    return `${h24 < 10 ? '0' : ''}${h24}:${selectedMinute < 10 ? '0' : ''}${selectedMinute}`;
  }, [selectedHour, selectedMinute, selectedAmPm]);

  const sleepRecommendations = React.useMemo(() => {
    return calculateSleepCycles(time24hString);
  }, [time24hString]);

  const optimalBedtime = sleepRecommendations.find(r => r.isRecommended)?.bedtime || '22:30';

  const toggleDay = (dayIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // At least 1 day
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const setWeekdayPreset = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const setEverydayPreset = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handlePlayPreview = async (soundId: AlarmSoundId) => {
    if (previewingSound === soundId) {
      await alarmAudio.stop();
      setPreviewingSound(null);
    } else {
      setPreviewingSound(soundId);
      const stopFn = await alarmAudio.playPreview(soundId);
      setTimeout(() => {
        setPreviewingSound(null);
      }, 5000);
      void stopFn;
    }
  };

  const handleSave = async () => {
    await alarmAudio.stop();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await updateConfig({
      enabled: true,
      time: time24hString,
      days: selectedDays,
      sound: selectedSound,
      gradualRampMinutes: selectedRamp,
      mission: selectedMission,
      bedtimeReminderEnabled: bedtimeNudge,
    });

    onClose();
  };

  const handleTestRingingScreen = () => {
    alarmAudio.stop();
    onClose();
    setTimeout(() => {
      triggerTestAlarm();
    }, 250);
  };

  const amberLight = theme.isDark ? 'rgba(245, 158, 11, 0.15)' : PrimitiveTokens.color.amber[100];
  const amberBorder = theme.isDark ? 'rgba(245, 158, 11, 0.35)' : PrimitiveTokens.color.amber[300];
  const amberText = theme.isDark ? PrimitiveTokens.color.amber[400] : PrimitiveTokens.color.amber[800];
  const amberSolid = PrimitiveTokens.color.amber[400];

  const isWeekdaysOnly = selectedDays.length === 5 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d));
  const isEveryday = selectedDays.length === 7;

  return (
    <View style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
      {/* Top Grab Handle */}
      <View style={styles.grabHandleContainer}>
        <View style={[styles.grabHandle, { backgroundColor: theme.colors.borderSubtle }]} />
      </View>

      {/* Header */}
      <HStack justify="space-between" align="center" style={styles.sheetHeader}>
        <VStack gap={2}>
          <Text variant="h3" color="primary" style={styles.headerTitle}>
            Circadian Wake Alarm
          </Text>
          <Text variant="captionSm" color="muted">
            Align morning anchor with natural sleep cycles
          </Text>
        </VStack>

        <TouchableOpacity 
          onPress={() => {
            alarmAudio.stop();
            onClose();
          }}
          style={[styles.closeButton, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="close" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </HStack>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 1. INTUITIVE TIME SELECTOR WITH STEPPERS & PRESETS */}
        <View style={[styles.timeBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
          <HStack align="center" justify="center" gap={12}>
            {/* Hour Stepper */}
            <VStack align="center" gap={2}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedHour(h => (h % 12) + 1);
                }}
                hitSlop={6}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Ionicons name="chevron-up" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <Text variant="scoreDisplay" color="primary" style={styles.timeDigit}>
                {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedHour(h => (h === 1 ? 12 : h - 1));
                }}
                hitSlop={6}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
              </TouchableOpacity>
              <Text variant="captionSm" color="muted" style={{ fontSize: 10 }}>Hour</Text>
            </VStack>

            <Text variant="h1" color="muted" style={styles.timeSeparator}>:</Text>

            {/* Minute Stepper */}
            <VStack align="center" gap={2}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMinute(m => (m + 5) % 60);
                }}
                hitSlop={6}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Ionicons name="chevron-up" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <Text variant="scoreDisplay" color="primary" style={styles.timeDigit}>
                {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMinute(m => (m === 0 ? 55 : m - 5));
                }}
                hitSlop={6}
                style={[styles.stepperBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
              </TouchableOpacity>
              <Text variant="captionSm" color="muted" style={{ fontSize: 10 }}>Min</Text>
            </VStack>

            {/* AM / PM Toggle */}
            <VStack gap={6} style={styles.amPmColumn}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAmPm('AM');
                }}
                style={[
                  styles.amPmPill,
                  selectedAmPm === 'AM'
                    ? { backgroundColor: amberSolid }
                    : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle, borderWidth: 1 }
                ]}
              >
                <Text
                  variant="captionSm"
                  style={[
                    styles.amPmText,
                    selectedAmPm === 'AM' ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textMuted }
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAmPm('PM');
                }}
                style={[
                  styles.amPmPill,
                  selectedAmPm === 'PM'
                    ? { backgroundColor: amberSolid }
                    : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle, borderWidth: 1 }
                ]}
              >
                <Text
                  variant="captionSm"
                  style={[
                    styles.amPmText,
                    selectedAmPm === 'PM' ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textMuted }
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </VStack>
          </HStack>

          {/* Quick Preset Pills */}
          <HStack gap={8} justify="center" style={styles.presetsRow}>
            {TIME_PRESETS.map((preset) => {
              const isMatch = selectedHour === preset.h && selectedMinute === preset.m && selectedAmPm === preset.ampm;
              return (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSelectedHour(preset.h);
                    setSelectedMinute(preset.m);
                    setSelectedAmPm(preset.ampm);
                  }}
                  style={[
                    styles.presetPill,
                    isMatch
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isMatch ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textSecondary }
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>

          {/* Circadian REM Sleep Cycle Advisor Card */}
          <View style={[styles.remBanner, { backgroundColor: amberLight, borderColor: amberBorder }]}>
            <Ionicons name="moon" size={18} color={amberText} style={{ marginTop: 2 }} />
            <VStack gap={2} style={{ flex: 1 }}>
              <Text variant="bodySm" style={{ color: amberText, fontWeight: '800' }}>
                Ideal Bedtime: {formatAlarmTime12hr(optimalBedtime)}
              </Text>
              <Text variant="captionSm" style={{ color: amberText, opacity: 0.95, lineHeight: 17 }}>
                5 full REM cycles (7h 30m sleep). Waking at the end of a cycle prevents morning sleep inertia.
              </Text>
            </VStack>
          </View>
        </View>

        {/* 2. REPEAT DAYS WITH QUICK PRESETS */}
        <VStack gap={8} style={styles.section}>
          <HStack justify="space-between" align="center">
            <Text variant="captionSm" color="muted" style={styles.sectionLabel}>
              REPEAT SCHEDULE
            </Text>
            <HStack gap={6}>
              <TouchableOpacity onPress={setWeekdayPreset} style={[styles.filterPill, isWeekdaysOnly && { backgroundColor: amberSolid }]}>
                <Text style={[styles.filterPillText, isWeekdaysOnly ? { color: '#000000', fontWeight: '700' } : { color: theme.colors.textMuted }]}>
                  Weekdays
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={setEverydayPreset} style={[styles.filterPill, isEveryday && { backgroundColor: amberSolid }]}>
                <Text style={[styles.filterPillText, isEveryday ? { color: '#000000', fontWeight: '700' } : { color: theme.colors.textMuted }]}>
                  Every day
                </Text>
              </TouchableOpacity>
            </HStack>
          </HStack>

          <HStack justify="space-between" align="center">
            {DAY_LABELS.map((day, idx) => {
              const isActive = selectedDays.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleDay(idx)}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isActive ? amberSolid : theme.colors.surfaceAlt,
                      borderColor: isActive ? amberSolid : theme.colors.borderSubtle,
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.dayText, 
                      { color: isActive ? '#000000' : theme.colors.textMuted }
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>
        </VStack>

        {/* 3. GENTLE VOLUME RAMP (CRESCENDO) */}
        <VStack gap={8} style={styles.section}>
          <HStack justify="space-between" align="center">
            <Text variant="captionSm" color="muted" style={styles.sectionLabel}>
              VOLUME CRESCENDO
            </Text>
            <Text variant="captionSm" color="primary">
              {selectedRamp > 0 ? `Gentle ${selectedRamp}m ramp (10% → 100%)` : 'Instant 100% volume'}
            </Text>
          </HStack>
          <HStack gap={8}>
            {([0, 2, 5] as const).map((mins) => {
              const isActive = selectedRamp === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedRamp(mins);
                  }}
                  style={[
                    styles.rampPill,
                    {
                      backgroundColor: isActive ? amberSolid : theme.colors.surfaceAlt,
                      borderColor: isActive ? amberSolid : theme.colors.borderSubtle,
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.rampText,
                      { color: isActive ? '#000000' : theme.colors.textSecondary, fontWeight: isActive ? '800' : '600' }
                    ]}
                  >
                    {mins === 0 ? 'Instant' : `${mins} Mins (Ideal)`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>
        </VStack>

        {/* 4. NATURE SOUND SELECTION WITH EXPLICIT CHECKMARK */}
        <VStack gap={8} style={styles.section}>
          <Text variant="captionSm" color="muted" style={styles.sectionLabel}>
            CIRCADIAN SOUND
          </Text>
          <VStack gap={8}>
            {SOUND_OPTIONS.map((snd) => {
              const isSelected = selectedSound === snd.id;
              const isPreviewing = previewingSound === snd.id;
              return (
                <TouchableOpacity
                  key={snd.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSound(snd.id);
                  }}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected ? amberLight : theme.colors.surface,
                      borderColor: isSelected ? amberSolid : theme.colors.borderSubtle,
                      borderWidth: isSelected ? 1.5 : 1,
                    }
                  ]}
                >
                  <HStack justify="space-between" align="center" style={{ width: '100%' }}>
                    <HStack align="center" gap={10} style={{ flex: 1 }}>
                      <View style={[styles.soundIconBox, { backgroundColor: isSelected ? amberSolid : theme.colors.surfaceAlt }]}>
                        <Ionicons 
                          name={snd.icon as any} 
                          size={18} 
                          color={isSelected ? '#000000' : theme.colors.textMuted} 
                        />
                      </View>
                      <VStack gap={2} style={{ flex: 1 }}>
                        <HStack align="center" gap={6}>
                          <Text variant="body" color="primary" style={{ fontWeight: isSelected ? '800' : '600', fontSize: 13 }}>
                            {snd.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color={amberText} />
                          )}
                        </HStack>
                        <Text variant="captionSm" color="muted" style={{ fontSize: 11 }}>
                          {snd.desc}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Preview play button */}
                    <TouchableOpacity
                      onPress={() => handlePlayPreview(snd.id)}
                      hitSlop={6}
                      style={[
                        styles.previewBtn,
                        isPreviewing
                          ? { backgroundColor: amberSolid, borderColor: amberSolid }
                          : { borderColor: theme.colors.borderSubtle }
                      ]}
                    >
                      <Ionicons 
                        name={isPreviewing ? "stop" : "play"} 
                        size={13} 
                        color={isPreviewing ? '#000000' : theme.colors.textMuted} 
                      />
                    </TouchableOpacity>
                  </HStack>
                </TouchableOpacity>
              );
            })}
          </VStack>
        </VStack>

        {/* 5. ANTI-SNOOZE MISSION SELECTION */}
        <VStack gap={8} style={styles.section}>
          <Text variant="captionSm" color="muted" style={styles.sectionLabel}>
            WAKE MISSION (ANTI-SNOOZE)
          </Text>
          <VStack gap={8}>
            {MISSION_OPTIONS.map((msn) => {
              const isSelected = selectedMission === msn.id;
              return (
                <TouchableOpacity
                  key={msn.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMission(msn.id);
                  }}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected ? amberLight : theme.colors.surface,
                      borderColor: isSelected ? amberSolid : theme.colors.borderSubtle,
                      borderWidth: isSelected ? 1.5 : 1,
                    }
                  ]}
                >
                  <HStack align="center" gap={10} style={{ width: '100%' }}>
                    <View style={[styles.soundIconBox, { backgroundColor: isSelected ? amberSolid : theme.colors.surfaceAlt }]}>
                      <Ionicons 
                        name={msn.icon as any} 
                        size={18} 
                        color={isSelected ? '#000000' : theme.colors.textMuted} 
                      />
                    </View>
                    <VStack gap={2} style={{ flex: 1 }}>
                      <HStack align="center" gap={6}>
                        <Text variant="body" color="primary" style={{ fontWeight: isSelected ? '800' : '600', fontSize: 13 }}>
                          {msn.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color={amberText} />
                        )}
                        {msn.badge && (
                          <View style={[styles.missionBadge, { backgroundColor: amberSolid }]}>
                            <Text variant="captionSm" style={{ fontSize: 9, fontWeight: '800', color: '#000000' }}>
                              {msn.badge}
                            </Text>
                          </View>
                        )}
                      </HStack>
                      <Text variant="captionSm" color="muted" style={{ fontSize: 11 }}>
                        {msn.desc}
                      </Text>
                    </VStack>
                  </HStack>
                </TouchableOpacity>
              );
            })}
          </VStack>
        </VStack>

        {/* 6. BEDTIME REVERSE REMINDER SWITCH */}
        <View style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
          <HStack justify="space-between" align="center" style={{ width: '100%' }}>
            <VStack gap={2} style={{ flex: 1, paddingRight: 10 }}>
              <Text variant="body" color="primary" style={{ fontWeight: '700', fontSize: 13 }}>
                Bedtime Wind-Down Alert
              </Text>
              <Text variant="captionSm" color="muted" style={{ fontSize: 11 }}>
                Gentle reminder at {formatAlarmTime12hr(optimalBedtime)} to complete 5 REM cycles
              </Text>
            </VStack>
            <Switch
              value={bedtimeNudge}
              onValueChange={setBedtimeNudge}
              trackColor={{ false: theme.colors.surfaceAlt, true: amberSolid }}
              thumbColor={bedtimeNudge ? '#FFFFFF' : theme.colors.textMuted}
            />
          </HStack>
        </View>

        {/* 7. DEV/USER TEST TRIGGER BUTTON */}
        <TouchableOpacity
          onPress={handleTestRingingScreen}
          style={[styles.testRingingBtn, { borderColor: theme.colors.borderSubtle, backgroundColor: theme.colors.surface }]}
        >
          <HStack align="center" justify="center" gap={8}>
            <Ionicons name="play-circle" size={18} color={theme.colors.textSecondary} />
            <Text variant="caption" color="secondary" style={{ fontWeight: '700' }}>
              Preview Full Ringing & Mission Screen
            </Text>
          </HStack>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FOOTER SAVE BUTTON WITH SAFE AREA PADDING */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.background,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 16),
          }
        ]}
      >
        <Button
          title="Save & Activate Alarm"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSave}
        />
      </View>
    </View>
  );
}

export function AlarmSetupModal({ visible, onClose }: AlarmSetupModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        alarmAudio.stop();
        onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <AlarmSetupContent onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  grabHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 18,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  timeBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  stepperBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigit: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 52,
  },
  timeSeparator: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 48,
    marginTop: -10,
  },
  amPmColumn: {
    marginLeft: 8,
    gap: 6,
  },
  amPmPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amPmText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetsRow: {
    marginTop: 14,
    width: '100%',
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  remBanner: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  section: {
    width: '100%',
  },
  sectionLabel: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontWeight: '800',
    fontSize: 13,
  },
  rampPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rampText: {
    fontSize: 12,
  },
  optionCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  soundIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  missionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  settingRow: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  testRingingBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
