import React, { useState, useEffect, useMemo } from 'react';
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
import { PrimitiveTokens, TypographyScale } from '@/theme/tokens.generated';
import { Text } from './Text';
import { HStack, VStack } from './Box';
import { Button } from './Button';
import { AlarmSoundId, AlarmMissionType } from '@/types/alarm';
import { formatAlarmTime12hr, calculateSleepCycles, getAlarmCountdown } from '@/utils/circadianAlarm';
import { alarmAudio } from '@/services/alarmAudio';

interface AlarmSetupModalProps {
  visible: boolean;
  onClose: () => void;
}

const SOUND_OPTIONS: { id: AlarmSoundId; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { id: 'sunrise-forest', label: 'Sunrise Forest', icon: 'sunny', desc: 'Birds singing & morning breeze' },
  { id: 'ocean-waves', label: 'Ocean Tide', icon: 'water', desc: 'Relaxing ambient ocean swell' },
  { id: 'zen-bowl', label: 'Zen Temple Bowl', icon: 'notifications', desc: '528Hz acoustic meditation bell' },
  { id: 'energetic-dawn', label: 'Energetic Dawn', icon: 'flash', desc: 'Upbeat crystalline chimes' },
];

const MISSION_OPTIONS: { id: AlarmMissionType; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  {
    id: 'water',
    label: 'Drink Water',
    icon: 'water',
    desc: 'Drink 1 glass of water to stop alarm & auto-log 250ml hydration',
  },
  {
    id: 'math',
    label: 'Math Puzzle',
    icon: 'calculator',
    desc: 'Solve a simple sum to awaken your brain and silence alarm',
  },
  {
    id: 'none',
    label: 'Normal Tap',
    icon: 'hand-left',
    desc: 'Simple 1-tap dismiss without any morning challenge',
  },
];

// Monday to Sunday contiguous week layout
const DAYS = [
  { id: 1, label: 'M', name: 'Mon' },
  { id: 2, label: 'T', name: 'Tue' },
  { id: 3, label: 'W', name: 'Wed' },
  { id: 4, label: 'T', name: 'Thu' },
  { id: 5, label: 'F', name: 'Fri' },
  { id: 6, label: 'S', name: 'Sat' },
  { id: 0, label: 'S', name: 'Sun' },
];

const QUICK_PRESETS = [
  { h: 5, m: 30, ampm: 'AM' as const, label: '5:30 AM' },
  { h: 6, m: 0, ampm: 'AM' as const, label: '6:00 AM' },
  { h: 6, m: 30, ampm: 'AM' as const, label: '6:30 AM' },
  { h: 7, m: 0, ampm: 'AM' as const, label: '7:00 AM' },
  { h: 7, m: 30, ampm: 'AM' as const, label: '7:30 AM' },
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

  // Stop sound preview when modal closes
  useEffect(() => {
    return () => {
      alarmAudio.stop();
    };
  }, []);

  const time24hString = useMemo(() => {
    let h24 = selectedHour;
    if (selectedAmPm === 'PM' && h24 < 12) h24 += 12;
    if (selectedAmPm === 'AM' && h24 === 12) h24 = 0;
    return `${h24 < 10 ? '0' : ''}${h24}:${selectedMinute < 10 ? '0' : ''}${selectedMinute}`;
  }, [selectedHour, selectedMinute, selectedAmPm]);

  const countdownPreview = useMemo(() => {
    return getAlarmCountdown({
      ...config,
      enabled: true,
      time: time24hString,
      days: selectedDays,
    });
  }, [config, time24hString, selectedDays]);

  const sleepRecommendations = useMemo(() => {
    return calculateSleepCycles(time24hString);
  }, [time24hString]);

  const optimalBedtime = sleepRecommendations.find((r) => r.isRecommended)?.bedtime || '22:30';

  // Step adjustment for minutes (-15m, +15m, etc.)
  const adjustMinutes = (deltaMinutes: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let totalMinutes = selectedHour * 60 + selectedMinute + deltaMinutes;
    if (selectedAmPm === 'PM' && selectedHour < 12) totalMinutes += 12 * 60;
    if (selectedAmPm === 'AM' && selectedHour === 12) totalMinutes -= 12 * 60;

    // Wrap around 24 hours
    totalMinutes = (totalMinutes + 24 * 60) % (24 * 60);

    const newH24 = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    const newAmPm = newH24 >= 12 ? 'PM' : 'AM';
    const newH12 = newH24 % 12 || 12;

    setSelectedHour(newH12);
    setSelectedMinute(newM);
    setSelectedAmPm(newAmPm);
  };

  const toggleDay = (dayId: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // At least 1 day selected
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort();
      }
    });
  };

  const handlePlayPreview = async (soundId: AlarmSoundId) => {
    if (previewingSound === soundId) {
      await alarmAudio.stop();
      setPreviewingSound(null);
    } else {
      setPreviewingSound(soundId);
      await alarmAudio.playPreview(soundId);
      setTimeout(() => {
        setPreviewingSound(null);
      }, 5000);
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

  const isWeekdaysOnly =
    selectedDays.length === 5 && [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d));
  const isEveryday = selectedDays.length === 7;

  const amberSolid = PrimitiveTokens.color.amber[400];
  const amberBg = theme.isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.10)';
  const amberBorder = theme.isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)';

  return (
    <View style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
      {/* Top Grab Handle */}
      <View style={styles.grabHandleContainer}>
        <View style={[styles.grabHandle, { backgroundColor: theme.colors.borderSubtle }]} />
      </View>

      {/* Header Bar */}
      <HStack justify="space-between" align="center" style={styles.sheetHeader}>
        <VStack gap={2}>
          <Text variant="h3" color="primary" style={styles.headerTitle}>
            Set Alarm
          </Text>
          <Text variant="captionSm" color="muted">
            Gentle morning anchor & sleep alignment
          </Text>
        </VStack>

        <TouchableOpacity
          onPress={() => {
            alarmAudio.stop();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close alarm settings"
          style={[styles.closeButton, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="close" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </HStack>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            1. HERO DIGITAL CLOCK DISPLAY (CLEAR & INTUITIVE)
            ======================================================== */}
        <View
          style={[
            styles.heroClockCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle },
          ]}
        >
          {/* Big Digital Readout */}
          <HStack align="center" justify="center" gap={8} style={styles.digitsRow}>
            {/* Hour Block */}
            <View style={styles.digitBlock}>
              <Text style={[styles.hugeDigit, { color: theme.colors.text }]}>
                {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
              </Text>
              <Text style={[styles.digitLabel, { color: theme.colors.textMuted }]}>Hour</Text>
            </View>

            <Text style={[styles.hugeSeparator, { color: PrimitiveTokens.color.amber[400] }]}>:</Text>

            {/* Minute Block */}
            <View style={styles.digitBlock}>
              <Text style={[styles.hugeDigit, { color: theme.colors.text }]}>
                {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
              </Text>
              <Text style={[styles.digitLabel, { color: theme.colors.textMuted }]}>Minute</Text>
            </View>

            {/* AM / PM Toggle Pill */}
            <View style={[styles.amPmContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAmPm('AM');
                }}
                style={[
                  styles.amPmSegment,
                  selectedAmPm === 'AM' && { backgroundColor: amberSolid },
                ]}
              >
                <Text
                  style={[
                    styles.amPmText,
                    selectedAmPm === 'AM'
                      ? { color: '#000000', fontWeight: '800' }
                      : { color: theme.colors.textMuted },
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
                  styles.amPmSegment,
                  selectedAmPm === 'PM' && { backgroundColor: amberSolid },
                ]}
              >
                <Text
                  style={[
                    styles.amPmText,
                    selectedAmPm === 'PM'
                      ? { color: '#000000', fontWeight: '800' }
                      : { color: theme.colors.textMuted },
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </HStack>

          {/* Quick Adjustment Steppers (-1h, -15m, +15m, +1h) */}
          <HStack justify="center" gap={8} style={styles.steppersRow}>
            <TouchableOpacity
              onPress={() => adjustMinutes(-60)}
              style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.stepBtnText, { color: theme.colors.text }]}>-1 hr</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => adjustMinutes(-15)}
              style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.stepBtnText, { color: theme.colors.text }]}>-15 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => adjustMinutes(15)}
              style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.stepBtnText, { color: theme.colors.text }]}>+15 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => adjustMinutes(60)}
              style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.stepBtnText, { color: theme.colors.text }]}>+1 hr</Text>
            </TouchableOpacity>
          </HStack>

          {/* 1-Tap Morning Presets */}
          <View style={styles.presetsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
              {QUICK_PRESETS.map((preset) => {
                const isSelected =
                  selectedHour === preset.h &&
                  selectedMinute === preset.m &&
                  selectedAmPm === preset.ampm;
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
                      styles.presetChip,
                      isSelected
                        ? { backgroundColor: amberSolid, borderColor: amberSolid }
                        : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected
                          ? { color: '#000000', fontWeight: '800' }
                          : { color: theme.colors.textSecondary },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Friendly Dynamic Ring Time Feedback */}
          <HStack align="center" justify="center" gap={6} style={[styles.countdownPill, { backgroundColor: amberBg, borderColor: amberBorder }]}>
            <Ionicons name="time" size={14} color={PrimitiveTokens.color.amber[400]} />
            <Text style={[styles.countdownText, { color: PrimitiveTokens.color.amber[400] }]}>
              Rings {countdownPreview}
            </Text>
          </HStack>
        </View>

        {/* ========================================================
            2. REPEAT DAYS (INTUITIVE & SIMPLE)
            ======================================================== */}
        <VStack gap={10} style={styles.sectionCard}>
          <HStack justify="space-between" align="center">
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Repeat
            </Text>
            {/* Quick schedule buttons */}
            <HStack gap={6}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setSelectedDays([1, 2, 3, 4, 5]);
                }}
                style={[
                  styles.repeatShortcutBtn,
                  isWeekdaysOnly
                    ? { backgroundColor: amberSolid }
                    : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.repeatShortcutText,
                    isWeekdaysOnly ? { color: '#000000', fontWeight: '700' } : { color: theme.colors.textSecondary },
                  ]}
                >
                  Weekdays
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                }}
                style={[
                  styles.repeatShortcutBtn,
                  isEveryday
                    ? { backgroundColor: amberSolid }
                    : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.repeatShortcutText,
                    isEveryday ? { color: '#000000', fontWeight: '700' } : { color: theme.colors.textSecondary },
                  ]}
                >
                  Every day
                </Text>
              </TouchableOpacity>
            </HStack>
          </HStack>

          {/* Monday to Sunday day circles */}
          <HStack justify="space-between" align="center" style={styles.daysRow}>
            {DAYS.map((d) => {
              const active = selectedDays.includes(d.id);
              return (
                <TouchableOpacity
                  key={d.name}
                  onPress={() => toggleDay(d.id)}
                  style={[
                    styles.dayPill,
                    active
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      active ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textMuted },
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>
        </VStack>

        {/* ========================================================
            3. WAKE MISSION (ANTI-SNOOZE CHALLENGE)
            ======================================================== */}
        <VStack gap={10} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Morning Mission (Anti-Snooze)
          </Text>

          {/* 3-way Segmented Control */}
          <HStack gap={8} style={styles.missionTabsRow}>
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
                    styles.missionTab,
                    isSelected
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Ionicons
                    name={msn.icon}
                    size={16}
                    color={isSelected ? '#000000' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.missionTabText,
                      isSelected ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textSecondary },
                    ]}
                  >
                    {msn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>

          {/* Active Mission Explanation */}
          <View style={[styles.missionDescBox, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={PrimitiveTokens.color.amber[400]}
              style={{ marginTop: 1 }}
            />
            <Text style={[styles.missionDescText, { color: theme.colors.textSecondary }]}>
              {MISSION_OPTIONS.find((m) => m.id === selectedMission)?.desc}
            </Text>
          </View>
        </VStack>

        {/* ========================================================
            4. ALARM SOUND TONES (COMPACT LIST WITH 1-TAP PREVIEW)
            ======================================================== */}
        <VStack gap={10} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Alarm Tone
          </Text>

          <VStack gap={8}>
            {SOUND_OPTIONS.map((snd) => {
              const isSelected = selectedSound === snd.id;
              const isPlaying = previewingSound === snd.id;

              return (
                <TouchableOpacity
                  key={snd.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSound(snd.id);
                  }}
                  style={[
                    styles.soundRow,
                    isSelected
                      ? { backgroundColor: amberBg, borderColor: amberSolid, borderWidth: 1.5 }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle, borderWidth: 1 },
                  ]}
                >
                  <HStack align="center" gap={10} style={{ flex: 1 }}>
                    <View
                      style={[
                        styles.soundIconBadge,
                        { backgroundColor: isSelected ? amberSolid : theme.colors.surface },
                      ]}
                    >
                      <Ionicons
                        name={snd.icon}
                        size={16}
                        color={isSelected ? '#000000' : theme.colors.textMuted}
                      />
                    </View>

                    <VStack gap={2} style={{ flex: 1 }}>
                      <HStack align="center" gap={6}>
                        <Text
                          style={[
                            styles.soundRowTitle,
                            { color: theme.colors.text, fontWeight: isSelected ? '800' : '600' },
                          ]}
                        >
                          {snd.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color={PrimitiveTokens.color.amber[400]} />
                        )}
                      </HStack>
                      <Text style={[styles.soundRowDesc, { color: theme.colors.textSecondary }]}>
                        {snd.desc}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Play / Stop Preview Button */}
                  <TouchableOpacity
                    onPress={() => handlePlayPreview(snd.id)}
                    hitSlop={8}
                    style={[
                      styles.soundPreviewPill,
                      isPlaying
                        ? { backgroundColor: amberSolid, borderColor: amberSolid }
                        : { borderColor: theme.colors.borderSubtle },
                    ]}
                  >
                    <Ionicons
                      name={isPlaying ? 'stop' : 'play'}
                      size={12}
                      color={isPlaying ? '#000000' : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.soundPreviewText,
                        isPlaying ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textSecondary },
                      ]}
                    >
                      {isPlaying ? 'Stop' : 'Listen'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </VStack>
        </VStack>

        {/* ========================================================
            5. GENTLE VOLUME RAMP (CRESCENDO) & BEDTIME WIND-DOWN
            ======================================================== */}
        <VStack gap={10} style={styles.sectionCard}>
          <HStack justify="space-between" align="center">
            <VStack gap={2}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Volume Crescendo
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Gradually wake up without high cortisol spikes
              </Text>
            </VStack>
          </HStack>

          <HStack gap={8}>
            {([0, 2, 5] as const).map((mins) => {
              const active = selectedRamp === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedRamp(mins);
                  }}
                  style={[
                    styles.rampOptionPill,
                    active
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Text
                    style={[
                      styles.rampOptionText,
                      active ? { color: '#000000', fontWeight: '800' } : { color: theme.colors.textSecondary },
                    ]}
                  >
                    {mins === 0 ? 'Instant' : `${mins} min (Soft)`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </HStack>
        </VStack>

        {/* Bedtime Wind-Down Reminder Card */}
        <View
          style={[
            styles.bedtimeRow,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle },
          ]}
        >
          <HStack justify="space-between" align="center" style={{ width: '100%' }}>
            <HStack align="center" gap={10} style={{ flex: 1, paddingRight: 10 }}>
              <View style={[styles.bedtimeIconBadge, { backgroundColor: amberBg }]}>
                <Ionicons name="moon" size={17} color={PrimitiveTokens.color.amber[400]} />
              </View>
              <VStack gap={2} style={{ flex: 1 }}>
                <Text style={[styles.bedtimeTitle, { color: theme.colors.text }]}>
                  Bedtime Reminder ({formatAlarmTime12hr(optimalBedtime)})
                </Text>
                <Text style={[styles.bedtimeSub, { color: theme.colors.textSecondary }]}>
                  Sleep by {formatAlarmTime12hr(optimalBedtime)} for 5 full REM cycles (7.5h sleep)
                </Text>
              </VStack>
            </HStack>

            <Switch
              value={bedtimeNudge}
              onValueChange={setBedtimeNudge}
              trackColor={{ false: theme.colors.surfaceAlt, true: amberSolid }}
              thumbColor={bedtimeNudge ? '#FFFFFF' : theme.colors.textMuted}
            />
          </HStack>
        </View>

        {/* Test Ringing Screen Link */}
        <TouchableOpacity
          onPress={handleTestRingingScreen}
          style={[styles.testRingingRow, { borderColor: theme.colors.borderSubtle }]}
        >
          <Ionicons name="notifications-outline" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.testRingingText, { color: theme.colors.textSecondary }]}>
            Test Ringing & Wake Screen
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ========================================================
          6. FIXED FOOTER SAVE ACTION
          ======================================================== */}
      <View
        style={[
          styles.footerBar,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.borderSubtle,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 16),
          },
        ]}
      >
        <Button
          title={`Set Alarm for ${selectedHour}:${selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute} ${selectedAmPm}`}
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
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <AlarmSetupContent onClose={onClose} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSheet: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  grabHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  grabHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    letterSpacing: -0.4,
    fontWeight: '800',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // 1. Hero Digital Clock Styles
  heroClockCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  digitsRow: {
    marginBottom: 14,
  },
  digitBlock: {
    alignItems: 'center',
  },
  hugeDigit: {
    fontSize: 54,
    fontFamily: TypographyScale.h1.fontFamily,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 62,
  },
  digitLabel: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  hugeSeparator: {
    fontSize: 48,
    fontWeight: '900',
    marginHorizontal: 4,
    marginBottom: 12,
  },
  amPmContainer: {
    borderRadius: 12,
    padding: 4,
    marginLeft: 10,
    gap: 4,
  },
  amPmSegment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amPmText: {
    fontSize: 13,
    fontFamily: TypographyScale.caption.fontFamily,
  },
  steppersRow: {
    width: '100%',
    marginBottom: 14,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  presetsWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  presetsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  countdownPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },

  // Section Styles
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: TypographyScale.h4.fontFamily,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },

  // Repeat Schedule Styles
  repeatShortcutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  repeatShortcutText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  daysRow: {
    marginTop: 4,
  },
  dayPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillText: {
    fontSize: 13,
    fontFamily: TypographyScale.caption.fontFamily,
  },

  // Wake Mission Styles
  missionTabsRow: {
    width: '100%',
  },
  missionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  missionTabText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  missionDescBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  missionDescText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },

  // Sound Tone Styles
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  soundIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundRowTitle: {
    fontSize: 13,
    fontFamily: TypographyScale.bodySm.fontFamily,
  },
  soundRowDesc: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  soundPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  soundPreviewText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },

  // Crescendo Pill Styles
  rampOptionPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rampOptionText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },

  // Bedtime Row Styles
  bedtimeRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  bedtimeIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedtimeTitle: {
    fontSize: 13,
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontWeight: '800',
  },
  bedtimeSub: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
    lineHeight: 15,
  },

  // Test Ringing Row Styles
  testRingingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  testRingingText: {
    fontSize: 12,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },

  // Footer Styles
  footerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
