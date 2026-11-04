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
  { id: 'sunrise-forest', label: 'Sunrise Forest', icon: 'sunny-outline', desc: 'Birds & morning breeze' },
  { id: 'ocean-waves', label: 'Ocean Tide', icon: 'water-outline', desc: 'Gentle rolling waves' },
  { id: 'zen-bowl', label: 'Tibetan Zen Bowl', icon: 'notifications-outline', desc: '528Hz acoustic chime' },
  { id: 'energetic-dawn', label: 'Energetic Dawn', icon: 'flash-outline', desc: 'Upbeat morning triad' },
];

const MISSION_OPTIONS: { id: AlarmMissionType; label: string; icon: string; desc: string; badge?: string }[] = [
  { id: 'water', label: 'Hydration Challenge', icon: 'water', desc: 'Drink 1 glass of water to stop alarm & auto-log 250ml', badge: 'RECOMMENDED' },
  { id: 'math', label: 'Quick Math Sum', icon: 'calculator-outline', desc: 'Solve a simple sum to awaken prefrontal cortex' },
  { id: 'none', label: 'Normal Swipe', icon: 'hand-left-outline', desc: 'Simple swipe to silence' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function AlarmSetupContent({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const { config, updateConfig } = useAlarmContext();

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // At least 1 day
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

  const amberLight = PrimitiveTokens.color.amber[100];
  const amberBorder = PrimitiveTokens.color.amber[300];
  const amberText = PrimitiveTokens.color.amber[800];
  const amberSolid = PrimitiveTokens.color.amber[400];

  return (
    <View style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
          
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
            {/* 1. BIG TIME SELECTOR */}
            <View style={[styles.timeBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
              <HStack align="center" justify="center" gap={8}>
                {/* Hour */}
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedHour(h => (h % 12) + 1);
                  }}
                  style={styles.timeDigitBtn}
                >
                  <Text variant="scoreDisplay" color="primary" style={styles.timeText}>
                    {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
                  </Text>
                  <Text variant="captionSm" color="muted">Hour ▾</Text>
                </TouchableOpacity>

                <Text variant="scoreDisplay" color="primary" style={styles.timeSeparator}>:</Text>

                {/* Minute */}
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMinute(m => (m + 5) % 60);
                  }}
                  style={styles.timeDigitBtn}
                >
                  <Text variant="scoreDisplay" color="primary" style={styles.timeText}>
                    {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                  </Text>
                  <Text variant="captionSm" color="muted">Min (+5) ▾</Text>
                </TouchableOpacity>

                {/* AM/PM Toggle */}
                <View style={styles.amPmColumn}>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedAmPm('AM');
                    }}
                    style={[
                      styles.amPmPill,
                      selectedAmPm === 'AM' && { backgroundColor: amberSolid }
                    ]}
                  >
                    <Text 
                      variant="captionSm" 
                      style={[
                        styles.amPmText,
                        selectedAmPm === 'AM' ? { color: '#000000' } : { color: theme.colors.textMuted }
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedAmPm('PM');
                    }}
                    style={[
                      styles.amPmPill,
                      selectedAmPm === 'PM' && { backgroundColor: amberSolid }
                    ]}
                  >
                    <Text 
                      variant="captionSm" 
                      style={[
                        styles.amPmText,
                        selectedAmPm === 'PM' ? { color: '#000000' } : { color: theme.colors.textMuted }
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </HStack>

              {/* REM Sleep Cycle Advice */}
              <View style={[styles.remBanner, { backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.12)' : PrimitiveTokens.color.amber[50], borderColor: amberBorder }]}>
                <Ionicons name="moon" size={16} color={amberText} />
                <Text variant="captionSm" style={{ color: amberText, flex: 1, fontWeight: '600' }}>
                  Optimal Bedtime: <Text variant="captionSm" style={{ fontWeight: '800', color: amberText }}>{formatAlarmTime12hr(optimalBedtime)}</Text> (5 full REM cycles · 7.5 hrs sleep)
                </Text>
              </View>
            </View>

            {/* 2. REPEAT DAYS */}
            <VStack gap={8} style={styles.section}>
              <Text variant="caption" color="muted" style={styles.sectionLabel}>
                REPEAT DAYS
              </Text>
              <HStack justify="space-between" align="center">
                {DAY_LABELS.map((dayLabel, idx) => {
                  const isActive = selectedDays.includes(idx);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => toggleDay(idx)}
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceAlt,
                          borderColor: isActive ? theme.colors.primary : theme.colors.borderSubtle,
                        }
                      ]}
                    >
                      <Text 
                        variant="caption" 
                        style={[
                          styles.dayText, 
                          { color: isActive ? '#FFFFFF' : theme.colors.textMuted }
                        ]}
                      >
                        {dayLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>

            {/* 3. GENTLE SUNRISE RAMP */}
            <VStack gap={8} style={styles.section}>
              <HStack justify="space-between" align="center">
                <Text variant="caption" color="muted" style={styles.sectionLabel}>
                  GENTLE VOLUME RAMP
                </Text>
                <Text variant="captionSm" color="muted">
                  {selectedRamp > 0 ? `Starts soft, peaks in ${selectedRamp}m` : 'Instant volume'}
                </Text>
              </HStack>
              <HStack gap={8}>
                {([0, 2, 5] as const).map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedRamp(mins);
                    }}
                    style={[
                      styles.rampPill,
                      {
                        backgroundColor: selectedRamp === mins ? amberLight : theme.colors.surfaceAlt,
                        borderColor: selectedRamp === mins ? amberSolid : theme.colors.borderSubtle,
                      }
                    ]}
                  >
                    <Text 
                      variant="captionSm" 
                      style={[
                        styles.rampText,
                        { color: selectedRamp === mins ? amberText : theme.colors.textMuted }
                      ]}
                    >
                      {mins === 0 ? 'Off (Instant)' : `${mins} Minutes`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </HStack>
            </VStack>

            {/* 4. SOUND SELECTION */}
            <VStack gap={8} style={styles.section}>
              <Text variant="caption" color="muted" style={styles.sectionLabel}>
                WAKE-UP SOUND
              </Text>
              <VStack gap={8}>
                {SOUND_OPTIONS.map((snd) => {
                  const isSelected = selectedSound === snd.id;
                  const isPreviewing = previewingSound === snd.id;
                  return (
                    <TouchableOpacity
                      key={snd.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSound(snd.id);
                      }}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isSelected ? (theme.isDark ? 'rgba(245, 158, 11, 0.1)' : PrimitiveTokens.color.amber[50]) : theme.colors.surface,
                          borderColor: isSelected ? amberBorder : theme.colors.borderSubtle,
                        }
                      ]}
                    >
                      <HStack justify="space-between" align="center" style={{ width: '100%' }}>
                        <HStack align="center" gap={10} style={{ flex: 1 }}>
                          <View style={[styles.soundIconBox, { backgroundColor: isSelected ? amberLight : theme.colors.surfaceAlt }]}>
                            <Ionicons name={snd.icon as any} size={18} color={isSelected ? amberText : theme.colors.textMuted} />
                          </View>
                          <VStack gap={2} style={{ flex: 1 }}>
                            <Text variant="body" color="primary" style={{ fontWeight: '700', fontSize: 13 }}>
                              {snd.label}
                            </Text>
                            <Text variant="captionSm" color="muted" style={{ fontSize: 11 }}>
                              {snd.desc}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Preview play button */}
                        <TouchableOpacity
                          onPress={() => handlePlayPreview(snd.id)}
                          style={[styles.previewBtn, { borderColor: theme.colors.borderSubtle }]}
                        >
                          <Ionicons 
                            name={isPreviewing ? "stop" : "play"} 
                            size={14} 
                            color={isPreviewing ? amberText : theme.colors.textMuted} 
                          />
                        </TouchableOpacity>
                      </HStack>
                    </TouchableOpacity>
                  );
                })}
              </VStack>
            </VStack>

            {/* 5. ANTI-SNOOZE MISSION */}
            <VStack gap={8} style={styles.section}>
              <Text variant="caption" color="muted" style={styles.sectionLabel}>
                ANTI-SNOOZE WAKE MISSION
              </Text>
              <VStack gap={8}>
                {MISSION_OPTIONS.map((msn) => {
                  const isSelected = selectedMission === msn.id;
                  return (
                    <TouchableOpacity
                      key={msn.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMission(msn.id);
                      }}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isSelected ? (theme.isDark ? 'rgba(245, 158, 11, 0.1)' : PrimitiveTokens.color.amber[50]) : theme.colors.surface,
                          borderColor: isSelected ? amberBorder : theme.colors.borderSubtle,
                        }
                      ]}
                    >
                      <HStack align="center" gap={10} style={{ width: '100%' }}>
                        <View style={[styles.soundIconBox, { backgroundColor: isSelected ? amberLight : theme.colors.surfaceAlt }]}>
                          <Ionicons name={msn.icon as any} size={18} color={isSelected ? amberText : theme.colors.textMuted} />
                        </View>
                        <VStack gap={2} style={{ flex: 1 }}>
                          <HStack align="center" gap={6}>
                            <Text variant="body" color="primary" style={{ fontWeight: '700', fontSize: 13 }}>
                              {msn.label}
                            </Text>
                            {msn.badge && (
                              <View style={[styles.missionBadge, { backgroundColor: PrimitiveTokens.color.amber[200] }]}>
                                <Text variant="captionSm" style={{ fontSize: 9, fontWeight: '800', color: PrimitiveTokens.color.amber[900] }}>
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

            {/* 6. BEDTIME REVERSE ALARM TOGGLE */}
            <View style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
              <HStack justify="space-between" align="center" style={{ width: '100%' }}>
                <VStack gap={2} style={{ flex: 1, paddingRight: 10 }}>
                  <Text variant="body" color="primary" style={{ fontWeight: '700', fontSize: 13 }}>
                    Bedtime Wind-Down Reminder
                  </Text>
                  <Text variant="captionSm" color="muted" style={{ fontSize: 11 }}>
                    Nudges you at {formatAlarmTime12hr(optimalBedtime)} so you get 5 full sleep cycles
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

            {/* Bottom Spacing */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Save Button */}
          <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle, backgroundColor: theme.colors.background }]}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeDigitBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  timeSeparator: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 48,
  },
  amPmColumn: {
    marginLeft: 8,
    gap: 4,
  },
  amPmPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  amPmText: {
    fontWeight: '800',
    fontSize: 11,
  },
  remBanner: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontWeight: '700',
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
