import React from 'react';
import {
  Modal,
  Pressable,
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

export interface DayDetailData {
  dayName: string;
  dateStr: string;
  score: number;
  wakeUpTime?: string | null;
  wakePts: number;
  waterIntake: number;
  waterPts: number;
  studyHours: number;
  studyPts: number;
}

export interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: DayDetailData | null;
}

export function DayDetailModal({ visible, onClose, data }: DayDetailModalProps) {
  const theme = useTheme();

  if (!data) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSubtle,
            },
          ]}>
          {/* Header Row */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetEyebrow, { color: theme.colors.textMuted }]}>
              {data.dateStr.toUpperCase()}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close day details">
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {/* Big Score Header */}
          <View style={styles.scoreRow}>
            <Text style={[styles.bigScore, { color: theme.colors.text }]}>
              {data.score}
              <Text style={[styles.scoreMax, { color: theme.colors.textMuted }]}> / 100</Text>
            </Text>
          </View>

          {/* Breakdown Rows */}
          <View style={[styles.breakdownList, { borderTopColor: theme.colors.borderSubtle }]}>
            {/* Wake-up */}
            <View style={[styles.detailRow, { borderBottomColor: theme.colors.borderSubtle }]}>
              <View style={styles.metricLabelRow}>
                <Ionicons
                  name="sunny-outline"
                  size={16}
                  color={
                    theme.isDark
                      ? PrimitiveTokens.color.amber[400]
                      : PrimitiveTokens.color.amber[600]
                  }
                />
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Wake-up
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {data.wakeUpTime || '--:--'} · {data.wakePts}/30
              </Text>
            </View>

            {/* Water */}
            <View style={[styles.detailRow, { borderBottomColor: theme.colors.borderSubtle }]}>
              <View style={styles.metricLabelRow}>
                <Ionicons
                  name="water-outline"
                  size={16}
                  color={
                    theme.isDark
                      ? PrimitiveTokens.color.sky[400]
                      : PrimitiveTokens.color.sky[600]
                  }
                />
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Water
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {data.waterIntake.toFixed(1)}L · {data.waterPts}/30
              </Text>
            </View>

            {/* Study */}
            <View style={[styles.detailRow, { borderBottomColor: theme.colors.borderSubtle }]}>
              <View style={styles.metricLabelRow}>
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={
                    theme.isDark
                      ? PrimitiveTokens.color.indigo[400]
                      : PrimitiveTokens.color.indigo[600]
                  }
                />
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Study & Focus
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {data.studyHours.toFixed(1)}h · {data.studyPts}/40
              </Text>
            </View>
          </View>

          {/* Close Action Button */}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: theme.isDark
                  ? PrimitiveTokens.color.amber[400]
                  : PrimitiveTokens.color.amber[500],
              },
              pressed && { opacity: 0.85 },
            ]}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: PrimitiveTokens.radius['2xl'],
    borderTopRightRadius: PrimitiveTokens.radius['2xl'],
    borderWidth: 1,
    padding: PrimitiveTokens.space[5],
    paddingBottom: PrimitiveTokens.space[6],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PrimitiveTokens.space[2],
  },
  sheetEyebrow: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreRow: {
    marginBottom: PrimitiveTokens.space[4],
  },
  bigScore: {
    fontSize: 36,
    fontFamily: TypographyScale.scoreDisplay.fontFamily,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownList: {
    borderTopWidth: 1,
    marginBottom: PrimitiveTokens.space[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: PrimitiveTokens.space[3],
    borderBottomWidth: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space[2],
  },
  metricLabel: {
    fontSize: TypographyScale.body.fontSize,
    fontFamily: TypographyScale.body.fontFamily,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
  },
  closeBtn: {
    height: 44,
    borderRadius: PrimitiveTokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: PrimitiveTokens.space[2],
  },
  closeBtnText: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: '800',
    color: '#052418',
  },
});
