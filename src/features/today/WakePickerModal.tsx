import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { formatTime12hr as formatWakeTimeDisplay } from '@/utils/dateTime';
import { triggerHaptic } from '@/utils/haptics';

export interface WakePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (wakeUpTime: string) => void;
  onReset?: () => void;
  currentWakeUpTime?: string | null;
  targetWakeUp?: string;
}

function getInitialPickerTime(currentWakeUpTime?: string | null, targetWakeUp: string = '06:00') {
  if (currentWakeUpTime) return currentWakeUpTime;
  const now = new Date();
  if (now.getHours() < 10) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return targetWakeUp;
}

export function WakePickerModal({
  visible,
  onClose,
  onSave,
  onReset,
  currentWakeUpTime,
  targetWakeUp = '06:00',
}: WakePickerModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <WakePickerModalContent
        onClose={onClose}
        onSave={onSave}
        onReset={onReset}
        currentWakeUpTime={currentWakeUpTime}
        targetWakeUp={targetWakeUp}
      />
    </Modal>
  );
}

function WakePickerModalContent({
  onClose,
  onSave,
  onReset,
  currentWakeUpTime,
  targetWakeUp = '06:00',
}: Omit<WakePickerModalProps, 'visible'>) {
  const theme = useTheme();
  const [pickerWakeTime, setPickerWakeTime] = useState<string>(() =>
    getInitialPickerTime(currentWakeUpTime, targetWakeUp)
  );

  const adjustPickerMinutes = (deltaMinutes: number) => {
    triggerHaptic('light');
    const [h, m] = pickerWakeTime.split(':').map(Number);
    let totalMins = (isNaN(h) ? 6 : h) * 60 + (isNaN(m) ? 0 : m) + deltaMinutes;
    // Bound between 00:00 (0 mins) and 23:59 (1439 mins)
    totalMins = Math.max(0, Math.min(1439, totalMins));
    const nextH = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const nextM = String(totalMins % 60).padStart(2, '0');
    setPickerWakeTime(`${nextH}:${nextM}`);
  };

  const setPickerHour = (hour: number) => {
    triggerHaptic('light');
    const [, m] = pickerWakeTime.split(':').map(Number);
    const minute = isNaN(m) ? 0 : m;
    const nextH = String(Math.max(0, Math.min(23, hour))).padStart(2, '0');
    const nextM = String(minute).padStart(2, '0');
    setPickerWakeTime(`${nextH}:${nextM}`);
  };

  const setPickerMinute = (minute: number) => {
    triggerHaptic('light');
    const [h] = pickerWakeTime.split(':').map(Number);
    const hour = isNaN(h) ? 6 : h;
    const nextH = String(hour).padStart(2, '0');
    const nextM = String(Math.max(0, Math.min(59, minute))).padStart(2, '0');
    setPickerWakeTime(`${nextH}:${nextM}`);
  };

  const [pickerHourVal, pickerMinuteVal] = (() => {
    const [h, m] = pickerWakeTime.split(':').map(Number);
    return [isNaN(h) ? 6 : h, isNaN(m) ? 0 : m];
  })();

  const previewWakePoints = (() => {
    const [h, m] = pickerWakeTime.split(':').map(Number);
    const wakeMinutes = (h || 0) * 60 + (m || 0);

    const [th, tm] = targetWakeUp.split(':').map(Number);
    const targetWakeMinutes = (th || 0) * 60 + (tm || 0);
    const limitWakeMinutes = targetWakeMinutes + 240;

    if (wakeMinutes <= targetWakeMinutes) {
      return 30;
    } else if (wakeMinutes < limitWakeMinutes) {
      const penalty = ((wakeMinutes - targetWakeMinutes) / 240) * 30;
      return Math.round(Math.max(0, 30 - penalty));
    }
    return 0;
  })();

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {currentWakeUpTime ? 'Edit Wake-up Time' : 'Log Wake-up Time'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Target: {formatWakeTimeDisplay(targetWakeUp)}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close time picker"
              style={[styles.modalCloseBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Prominent Selected Clock Display */}
          <View
            style={[
              styles.modalClockBox,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(251, 191, 36, 0.08)'
                  : 'rgba(251, 191, 36, 0.12)',
                borderColor: theme.isDark
                  ? 'rgba(251, 191, 36, 0.3)'
                  : PrimitiveTokens.color.amber[300],
              },
            ]}>
            <Ionicons
              name="sunny"
              size={24}
              color={
                theme.isDark
                  ? PrimitiveTokens.color.amber[400]
                  : PrimitiveTokens.color.amber[600]
              }
            />
            <Text
              style={[
                styles.modalClockText,
                {
                  color: theme.isDark
                    ? PrimitiveTokens.color.amber[300]
                    : PrimitiveTokens.color.amber[800],
                },
              ]}>
              {formatWakeTimeDisplay(pickerWakeTime)}
            </Text>
            <View
              style={[
                styles.modalPtsBadge,
                {
                  backgroundColor:
                    previewWakePoints >= 30
                      ? theme.colors.successMuted
                      : theme.colors.surfaceAlt,
                  borderColor:
                    previewWakePoints >= 30
                      ? theme.colors.successBorder
                      : theme.colors.borderSubtle,
                },
              ]}>
              <Text
                style={[
                  styles.modalPtsText,
                  {
                    color:
                      previewWakePoints >= 30
                        ? theme.colors.success
                        : theme.colors.textSecondary,
                  },
                ]}>
                {previewWakePoints}/30 pts
              </Text>
            </View>
          </View>

          {/* Interactive Hour Selector (Horizontal Scroll) */}
          <View style={styles.pickerSectionHeader}>
            <Text style={[styles.pickerSectionLabel, { color: theme.colors.textSecondary }]}>
              HOUR (AM / PM)
            </Text>
            <View style={styles.fineTuneRow}>
              <Pressable
                onPress={() => adjustPickerMinutes(-60)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>-1h</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustPickerMinutes(60)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>+1h</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pickerChipsScroll}>
            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((hour) => {
              const isSelected = pickerHourVal === hour;
              const displayH = hour % 12 === 0 ? 12 : hour % 12;
              const period = hour < 12 ? 'AM' : 'PM';
              return (
                <Pressable
                  key={hour}
                  onPress={() => setPickerHour(hour)}
                  style={[
                    styles.pickerChip,
                    isSelected
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.borderSubtle,
                        },
                  ]}>
                  <Text
                    style={[
                      styles.pickerChipText,
                      {
                        color: isSelected
                          ? theme.colors.primaryForeground
                          : theme.colors.text,
                      },
                    ]}>
                    {String(displayH).padStart(2, '0')} {period}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Interactive Minute Selector (Horizontal Scroll + Micro Step) */}
          <View style={[styles.pickerSectionHeader, { marginTop: PrimitiveTokens.space[3] }]}>
            <Text style={[styles.pickerSectionLabel, { color: theme.colors.textSecondary }]}>
              MINUTE
            </Text>
            <View style={styles.fineTuneRow}>
              <Pressable
                onPress={() => adjustPickerMinutes(-1)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>-1m</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustPickerMinutes(1)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>+1m</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustPickerMinutes(-5)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>-5m</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustPickerMinutes(5)}
                hitSlop={6}
                style={[styles.microStepBtn, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.microStepText, { color: theme.colors.text }]}>+5m</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pickerChipsScroll}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => {
              const isSelected = pickerMinuteVal === min;
              return (
                <Pressable
                  key={min}
                  onPress={() => setPickerMinute(min)}
                  style={[
                    styles.pickerChip,
                    isSelected
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.borderSubtle,
                        },
                  ]}>
                  <Text
                    style={[
                      styles.pickerChipText,
                      {
                        color: isSelected
                          ? theme.colors.primaryForeground
                          : theme.colors.text,
                      },
                    ]}>
                    :{String(min).padStart(2, '0')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Quick 1-tap shortcuts */}
          <View style={styles.modalPresetsRow}>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                const now = new Date();
                const h = String(now.getHours()).padStart(2, '0');
                const m = String(now.getMinutes()).padStart(2, '0');
                setPickerWakeTime(`${h}:${m}`);
              }}
              style={[
                styles.modalPresetPill,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSubtle },
              ]}>
              <Ionicons name="time-outline" size={12} color={theme.colors.text} />
              <Text style={[styles.modalPresetText, { color: theme.colors.text }]}>Right Now</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic('light');
                setPickerWakeTime(targetWakeUp);
              }}
              style={[
                styles.modalPresetPill,
                pickerWakeTime === targetWakeUp
                  ? {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    }
                  : {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.borderSubtle,
                    },
              ]}>
              <Ionicons
                name="flag"
                size={11}
                color={
                  pickerWakeTime === targetWakeUp
                    ? theme.colors.primaryForeground
                    : theme.colors.text
                }
              />
              <Text
                style={[
                  styles.modalPresetText,
                  {
                    color:
                      pickerWakeTime === targetWakeUp
                        ? theme.colors.primaryForeground
                        : theme.colors.text,
                  },
                ]}>
                Target ({formatWakeTimeDisplay(targetWakeUp)})
              </Text>
            </Pressable>
          </View>

          {/* CTA Buttons */}
          <View style={styles.modalActionsRow}>
            {currentWakeUpTime && onReset ? (
              <Pressable
                onPress={() => {
                  onReset();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Reset wake-up time"
                style={({ pressed }) => [
                  styles.modalResetBtn,
                  { borderColor: theme.colors.borderSubtle },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
                <Text style={[styles.modalResetBtnText, { color: theme.colors.error }]}>
                  Reset
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => {
                onSave(pickerWakeTime);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Save wake-up time"
              style={({ pressed }) => [
                styles.modalSaveBtn,
                { backgroundColor: theme.colors.primary },
                pressed && { opacity: 0.85 },
              ]}>
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.colors.primaryForeground}
              />
              <Text
                style={[
                  styles.modalSaveBtnText,
                  { color: theme.colors.primaryForeground },
                ]}>
                Save Wake-up Time
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PrimitiveTokens.space[4],
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: PrimitiveTokens.radius['2xl'],
    borderWidth: 1,
    padding: PrimitiveTokens.space[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[4],
  },
  modalTitle: {
    fontSize: TypographyScale.h4.fontSize,
    fontFamily: TypographyScale.h4.fontFamily,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space[4],
    paddingHorizontal: PrimitiveTokens.space[4],
    borderRadius: PrimitiveTokens.radius.xl,
    borderWidth: 1,
    marginBottom: PrimitiveTokens.space[4],
  },
  modalClockText: {
    fontSize: 26,
    fontFamily: TypographyScale.h3.fontFamily,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalPtsBadge: {
    paddingHorizontal: PrimitiveTokens.space[2],
    paddingVertical: 3,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  modalPtsText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  modalSteppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[3],
    marginBottom: PrimitiveTokens.space[4],
  },
  pickerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PrimitiveTokens.space[1],
  },
  pickerSectionLabel: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fineTuneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[1],
  },
  microStepBtn: {
    paddingHorizontal: PrimitiveTokens.space[2],
    paddingVertical: 3,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  microStepText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  pickerChipsScroll: {
    flexDirection: 'row',
    gap: PrimitiveTokens.space[1],
    paddingVertical: PrimitiveTokens.space[1],
  },
  pickerChip: {
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space[2],
    borderRadius: PrimitiveTokens.radius.md,
    borderWidth: 1,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerChipText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '700',
  },
  modalPresetsHeading: {
    fontSize: 10,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modalPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PrimitiveTokens.space[1],
    marginBottom: PrimitiveTokens.space[5],
  },
  modalPresetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: PrimitiveTokens.space['2_5'],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  modalPresetText: {
    fontSize: 11,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '600',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[2],
  },
  modalResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: PrimitiveTokens.space[3],
    height: 44,
    borderRadius: PrimitiveTokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  modalResetBtnText: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space[1],
    height: 44,
    borderRadius: PrimitiveTokens.radius.md,
  },
  modalSaveBtnText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontWeight: '700',
  },
});
