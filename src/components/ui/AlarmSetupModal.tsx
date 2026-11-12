import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useAlarmContext } from '@/context/AlarmContext';
import { PrimitiveTokens } from '@/theme/tokens.generated';
import {
  Button,
  Card,
  Badge,
  IconButton,
  Text,
  HStack,
  VStack,
} from '@/components/ui';
import { AlarmSoundId, AlarmMissionType } from '@/types/alarm';
import { formatAlarmTime12hr, calculateSleepCycles, getAlarmCountdown } from '@/utils/circadianAlarm';
import { alarmAudio } from '@/services/alarmAudio';

export interface AlarmSetupModalProps {
  visible: boolean;
  onClose: () => void;
}

// ----------------------------------------------------------------------------
// Minimal & Clean Configurations
// ----------------------------------------------------------------------------
const SOUND_OPTIONS: { id: AlarmSoundId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'sunrise-forest', label: 'Sunrise', icon: 'sunny-outline' },
  { id: 'ocean-waves', label: 'Ocean', icon: 'water-outline' },
  { id: 'zen-bowl', label: 'Zen', icon: 'notifications-outline' },
  { id: 'energetic-dawn', label: 'Dawn', icon: 'flash-outline' },
];

const MISSION_OPTIONS: {
  id: AlarmMissionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint: string;
}[] = [
  { id: 'none', label: 'Simple Tap', icon: 'hand-left-outline', hint: 'Tap screen to stop' },
  { id: 'water', label: 'Drink Water', icon: 'water-outline', hint: 'Drink 1 glass of water to stop' },
  { id: 'math', label: 'Math Sum', icon: 'calculator-outline', hint: 'Solve 1 simple sum to stop' },
];

const DAYS = [
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
  { id: 0, label: 'S' },
];

const QUICK_PRESETS = [
  { h: 5, m: 30, ampm: 'AM' as const, label: '5:30' },
  { h: 6, m: 0, ampm: 'AM' as const, label: '6:00' },
  { h: 6, m: 30, ampm: 'AM' as const, label: '6:30' },
  { h: 7, m: 0, ampm: 'AM' as const, label: '7:00' },
];

// ----------------------------------------------------------------------------
// Reusable Option Chip
// ----------------------------------------------------------------------------
interface OptionChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  flex?: boolean;
}

const OptionChip = memo(function OptionChip({
  label,
  icon,
  selected,
  onPress,
  flex = false,
}: OptionChipProps) {
  const theme = useTheme();
  const amberSolid = PrimitiveTokens.color.amber[400];
  const darkForest = PrimitiveTokens.color.forest[900];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.optionChip,
        flex && styles.chipFlex,
        selected
          ? { backgroundColor: amberSolid, borderColor: amberSolid }
          : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? darkForest : theme.colors.textSecondary}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        variant="captionSm"
        numberOfLines={1}
        style={[
          styles.chipLabel,
          selected
            ? { color: darkForest, fontWeight: '700' }
            : { color: theme.colors.textSecondary, fontWeight: '500' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

// ----------------------------------------------------------------------------
// Main Content Component
// ----------------------------------------------------------------------------
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
  const [selectedMission, setSelectedMission] = useState<AlarmMissionType>(config.mission || 'water');
  const [bedtimeNudge, setBedtimeNudge] = useState<boolean>(config.bedtimeReminderEnabled ?? true);
  const [previewingSound, setPreviewingSound] = useState<AlarmSoundId | null>(null);

  const isWeekdaysOnly =
    selectedDays.length === 5 && [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d));
  const isEveryday = selectedDays.length === 7;
  const isCustomDays = !isWeekdaysOnly && !isEveryday;
  const [showCustomDays, setShowCustomDays] = useState<boolean>(isCustomDays);

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
    const raw = getAlarmCountdown({
      ...config,
      enabled: true,
      time: time24hString,
      days: selectedDays,
      lastDismissedDate: undefined,
    });
    return raw.replace(/^in\s*/i, '');
  }, [config, time24hString, selectedDays]);

  const handleSetQuickNap = (minutes: number = 5) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const target = new Date(Date.now() + minutes * 60 * 1000);
    let h = target.getHours();
    const m = target.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedAmPm(ampm);

    // Ensure today's day of week is selected so the alarm triggers today
    const todayDay = new Date().getDay();
    setSelectedDays((prev) => (prev.includes(todayDay) ? prev : [...prev, todayDay]));
  };

  const sleepRecommendations = useMemo(() => {
    return calculateSleepCycles(time24hString);
  }, [time24hString]);

  const optimalBedtime = sleepRecommendations.find((r) => r.isRecommended)?.bedtime || '22:30';

  const stepHour = (delta: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHour((prev) => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const stepMinute = (delta: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMinute((prev) => (prev + delta + 60) % 60);
  };

  const toggleDay = (dayId: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId].sort();
    });
  };

  const repeatSummary = useMemo(() => {
    if (isEveryday) return 'Every day';
    if (isWeekdaysOnly) return 'Weekdays';
    return `${selectedDays.length} days`;
  }, [selectedDays, isEveryday, isWeekdaysOnly]);

  const handleSelectSound = async (soundId: AlarmSoundId) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSound(soundId);
    setPreviewingSound(soundId);
    await alarmAudio.playPreview(soundId);
    setTimeout(() => {
      setPreviewingSound((curr) => (curr === soundId ? null : curr));
    }, 3000);
  };

  const handleTogglePreview = async () => {
    if (previewingSound) {
      await alarmAudio.stop();
      setPreviewingSound(null);
    } else {
      setPreviewingSound(selectedSound);
      await alarmAudio.playPreview(selectedSound);
      setTimeout(() => {
        setPreviewingSound(null);
      }, 4000);
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
      gradualRampMinutes: config.gradualRampMinutes ?? 2,
      mission: selectedMission,
      bedtimeReminderEnabled: bedtimeNudge,
      lastDismissedDate: undefined,
      lastDismissedTime: undefined,
    });

    onClose();
  };

  const amberSolid = PrimitiveTokens.color.amber[400];
  const darkForest = PrimitiveTokens.color.forest[900];
  const formattedMinutes = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
  const formattedTimeLabel = `${selectedHour}:${formattedMinutes} ${selectedAmPm}`;
  const activeMission = MISSION_OPTIONS.find((m) => m.id === selectedMission) || MISSION_OPTIONS[0];

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          alarmAudio.stop();
          onClose();
        }}
      />

      <View style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
        {/* Grab Handle */}
        <View style={styles.grabHandleContainer}>
          <View style={[styles.grabHandle, { backgroundColor: theme.colors.borderSubtle }]} />
        </View>

        {/* Minimal Header */}
        <HStack justify="space-between" align="center" style={styles.sheetHeader}>
          <Text variant="h3" color="primary" style={styles.headerTitle}>
            Set Alarm
          </Text>

          <IconButton
            icon={<Ionicons name="close" size={18} color={theme.colors.text} />}
            size="sm"
            variant="tinted"
            onPress={() => {
              alarmAudio.stop();
              onClose();
            }}
            accessibilityLabel="Close"
          />
        </HStack>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ========================================================
              CARD 1: TIME DIAL & PRESETS
              ======================================================== */}
          <Card
            variant="surface"
            padding={theme.spacing.md}
            radius={theme.radius.xl}
            style={styles.cardContainer}
          >
            {/* Clock Dial: Hour | : | Min | AM/PM */}
            <HStack align="center" justify="center" gap={8} style={styles.clockRow}>
              {/* Hour */}
              <VStack align="center" gap={4}>
                <Text variant="captionSm" color="muted" style={styles.unitCaption}>
                  HOUR
                </Text>

                <View
                  style={[
                    styles.dialTile,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => stepHour(1)}
                    hitSlop={{ top: 12, bottom: 6, left: 14, right: 14 }}
                    style={styles.stepperArrow}
                  >
                    <Ionicons name="chevron-up" size={18} color={theme.colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => stepHour(1)}
                    activeOpacity={0.8}
                    style={styles.timeDigitBox}
                  >
                    <Text style={[styles.timeDigit, { color: theme.colors.text }]}>
                      {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => stepHour(-1)}
                    hitSlop={{ top: 6, bottom: 12, left: 14, right: 14 }}
                    style={styles.stepperArrow}
                  >
                    <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </VStack>

              {/* Colon */}
              <VStack align="center" justify="center" style={styles.colonWrap}>
                <Text style={[styles.timeColon, { color: amberSolid }]}>:</Text>
              </VStack>

              {/* Minute */}
              <VStack align="center" gap={4}>
                <Text variant="captionSm" color="muted" style={styles.unitCaption}>
                  MIN
                </Text>

                <View
                  style={[
                    styles.dialTile,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => stepMinute(5)}
                    hitSlop={{ top: 12, bottom: 6, left: 14, right: 14 }}
                    style={styles.stepperArrow}
                  >
                    <Ionicons name="chevron-up" size={18} color={theme.colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => stepMinute(5)}
                    activeOpacity={0.8}
                    style={styles.timeDigitBox}
                  >
                    <Text style={[styles.timeDigit, { color: theme.colors.text }]}>
                      {formattedMinutes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => stepMinute(-5)}
                    hitSlop={{ top: 6, bottom: 12, left: 14, right: 14 }}
                    style={styles.stepperArrow}
                  >
                    <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </VStack>

              {/* AM / PM */}
              <VStack align="center" gap={4}>
                <Text variant="captionSm" color="muted" style={[styles.unitCaption, { opacity: 0 }]}>
                  PERIOD
                </Text>

                <View
                  style={[
                    styles.amPmTile,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedAmPm('AM');
                    }}
                    style={[
                      styles.amPmSegmentBtn,
                      selectedAmPm === 'AM' && { backgroundColor: amberSolid },
                    ]}
                  >
                    <Text
                      style={[
                        styles.amPmSegmentText,
                        selectedAmPm === 'AM'
                          ? { color: darkForest, fontWeight: '800' }
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
                      styles.amPmSegmentBtn,
                      selectedAmPm === 'PM' && { backgroundColor: amberSolid },
                    ]}
                  >
                    <Text
                      style={[
                        styles.amPmSegmentText,
                        selectedAmPm === 'PM'
                          ? { color: darkForest, fontWeight: '800' }
                          : { color: theme.colors.textMuted },
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </VStack>
            </HStack>

            {/* Quick Presets with +5m Shortcut */}
            <HStack justify="space-between" gap={6} style={styles.presetRow}>
              <TouchableOpacity
                onPress={() => handleSetQuickNap(5)}
                style={[
                  styles.presetChip,
                  { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                ]}
              >
                <Text
                  variant="captionSm"
                  style={[styles.presetChipText, { color: amberSolid, fontWeight: '800' }]}
                >
                  +5m
                </Text>
              </TouchableOpacity>

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
                      variant="captionSm"
                      style={[
                        styles.presetChipText,
                        isSelected
                          ? { color: darkForest, fontWeight: '800' }
                          : { color: theme.colors.textSecondary, fontWeight: '600' },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </HStack>

            {/* Short & Sweet Countdown Badge */}
            <View style={styles.countdownRow}>
              <Badge
                label={`Rings in ${countdownPreview}`}
                variant="warning"
                size="md"
                style={{ alignSelf: 'center' }}
                textStyle={{ fontWeight: '700' }}
                icon={<Ionicons name="time" size={13} color={amberSolid} />}
              />
            </View>
          </Card>

          {/* ========================================================
              CARD 2: SETTINGS (MINIMAL TEXT, MAXIMUM CLARITY)
              ======================================================== */}
          <Card
            variant="surface"
            padding={theme.spacing.md}
            radius={theme.radius.xl}
            style={styles.cardContainer}
          >
            {/* 1. REPEAT */}
            <VStack gap={8}>
              <HStack justify="space-between" align="center">
                <Text variant="bodySm" color="primary" style={styles.sectionHeading}>
                  Repeat
                </Text>
                <Badge label={repeatSummary} variant="neutral" size="sm" />
              </HStack>

              <HStack gap={6}>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSelectedDays([1, 2, 3, 4, 5]);
                    setShowCustomDays(false);
                  }}
                  style={[
                    styles.quickPill,
                    isWeekdaysOnly && !showCustomDays
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Text
                    variant="captionSm"
                    style={[
                      styles.quickPillText,
                      isWeekdaysOnly && !showCustomDays
                        ? { color: darkForest, fontWeight: '700' }
                        : { color: theme.colors.textSecondary },
                    ]}
                  >
                    Weekdays
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                    setShowCustomDays(false);
                  }}
                  style={[
                    styles.quickPill,
                    isEveryday && !showCustomDays
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Text
                    variant="captionSm"
                    style={[
                      styles.quickPillText,
                      isEveryday && !showCustomDays
                        ? { color: darkForest, fontWeight: '700' }
                        : { color: theme.colors.textSecondary },
                    ]}
                  >
                    Every day
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setShowCustomDays((prev) => !prev);
                  }}
                  style={[
                    styles.quickPillSmall,
                    showCustomDays || isCustomDays
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Text
                    variant="captionSm"
                    style={[
                      styles.quickPillText,
                      showCustomDays || isCustomDays
                        ? { color: darkForest, fontWeight: '700' }
                        : { color: theme.colors.textSecondary },
                    ]}
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </HStack>

              {/* 7 Days Circles (Only if Custom) */}
              {showCustomDays && (
                <HStack justify="space-between" align="center" style={styles.daysRow}>
                  {DAYS.map((d) => {
                    const active = selectedDays.includes(d.id);
                    return (
                      <TouchableOpacity
                        key={d.id}
                        onPress={() => toggleDay(d.id)}
                        hitSlop={6}
                        style={[
                          styles.dayCircle,
                          active
                            ? { backgroundColor: amberSolid, borderColor: amberSolid }
                            : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayCircleText,
                            active
                              ? { color: darkForest, fontWeight: '700' }
                              : { color: theme.colors.textSecondary, fontWeight: '600' },
                          ]}
                        >
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </HStack>
              )}
            </VStack>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* 2. STOP METHOD */}
            <VStack gap={6}>
              <HStack justify="space-between" align="center">
                <Text variant="bodySm" color="primary" style={styles.sectionHeading}>
                  Stop Alarm
                </Text>
                <Text variant="captionSm" color="muted">
                  {activeMission.hint}
                </Text>
              </HStack>

              <HStack gap={6}>
                {MISSION_OPTIONS.map((msn) => (
                  <OptionChip
                    key={msn.id}
                    label={msn.label}
                    icon={msn.icon}
                    selected={selectedMission === msn.id}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedMission(msn.id);
                    }}
                    flex
                  />
                ))}
              </HStack>
            </VStack>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* 3. SOUND */}
            <VStack gap={6}>
              <HStack justify="space-between" align="center">
                <Text variant="bodySm" color="primary" style={styles.sectionHeading}>
                  Sound
                </Text>

                <TouchableOpacity
                  onPress={handleTogglePreview}
                  hitSlop={8}
                  style={[
                    styles.previewPill,
                    previewingSound
                      ? { backgroundColor: amberSolid, borderColor: amberSolid }
                      : { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
                  ]}
                >
                  <Ionicons
                    name={previewingSound ? 'stop' : 'play'}
                    size={10}
                    color={previewingSound ? darkForest : theme.colors.textSecondary}
                  />
                  <Text
                    variant="captionSm"
                    style={{
                      color: previewingSound ? darkForest : theme.colors.textSecondary,
                      fontWeight: '700',
                      fontSize: 11,
                    }}
                  >
                    {previewingSound ? 'Stop' : 'Listen'}
                  </Text>
                </TouchableOpacity>
              </HStack>

              {/* 4 Sound Chips */}
              <HStack gap={6}>
                {SOUND_OPTIONS.map((snd) => (
                  <OptionChip
                    key={snd.id}
                    label={snd.label}
                    icon={snd.icon}
                    selected={selectedSound === snd.id}
                    onPress={() => handleSelectSound(snd.id)}
                    flex
                  />
                ))}
              </HStack>
            </VStack>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* 4. BEDTIME REMINDER */}
            <HStack justify="space-between" align="center">
              <VStack gap={1} style={{ flex: 1, paddingRight: 8 }}>
                <Text variant="bodySm" color="primary" style={styles.sectionHeading}>
                  Bedtime Reminder
                </Text>
                <Text variant="captionSm" color="muted">
                  {formatAlarmTime12hr(optimalBedtime)} • 7.5h sleep
                </Text>
              </VStack>

              <Switch
                value={bedtimeNudge}
                onValueChange={setBedtimeNudge}
                trackColor={{ false: theme.colors.surfaceAlt, true: amberSolid }}
                thumbColor={bedtimeNudge ? '#FFFFFF' : theme.colors.textMuted}
              />
            </HStack>
          </Card>

          {/* Test Link */}
          <TouchableOpacity
            onPress={() => {
              alarmAudio.stop();
              onClose();
              setTimeout(triggerTestAlarm, 200);
            }}
            style={styles.testLink}
          >
            <Ionicons name="notifications-outline" size={12} color={theme.colors.textMuted} />
            <Text variant="captionSm" color="muted">
              Test Ringing Screen
            </Text>
          </TouchableOpacity>

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* Sticky Primary CTA */}
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.borderSubtle,
              paddingBottom: Math.max(insets.bottom + 8, Platform.OS === 'ios' ? 24 : 18),
            },
          ]}
        >
          <Button
            title={`Set Alarm for ${formattedTimeLabel}`}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Exported Modal Wrapper
// ----------------------------------------------------------------------------
export function AlarmSetupModal({ visible, onClose }: AlarmSetupModalProps) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <AlarmSetupContent onClose={onClose} />
    </Modal>
  );
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  grabHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  cardContainer: {
    marginBottom: 8,
  },
  clockRow: {
    paddingVertical: 2,
  },
  unitCaption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dialTile: {
    width: 82,
    height: 116,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stepperArrow: {
    width: 50,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  timeDigit: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  colonWrap: {
    width: 14,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  timeColon: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  amPmTile: {
    width: 52,
    height: 116,
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'space-between',
  },
  amPmSegmentBtn: {
    flex: 1,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amPmSegmentText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  presetRow: {
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
  },
  countdownRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  sectionHeading: {
    fontWeight: '600',
  },
  daysRow: {
    marginTop: 6,
    gap: 4,
  },
  dayCircle: {
    flex: 1,
    maxWidth: 40,
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleText: {
    fontSize: 13,
  },
  quickPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickPillSmall: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 11,
  },
  separator: {
    height: 1,
    marginVertical: 10,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipFlex: {
    flex: 1,
  },
  chipLabel: {
    fontSize: 11,
  },
  testLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
