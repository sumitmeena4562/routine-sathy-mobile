import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';

import {
  AmbientAtmosphere,
  CircadianRhythmDial,
  RoutineSathyEmblem,
} from '@/components/ui';
import {
  Chronotype,
  GoalId,
  useOnboarding,
} from '@/context/OnboardingContext';

function triggerHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

// ----------------------------------------------------------------------------
// Step 1: Benefits Data (Lightweight, Clear & Action-oriented)
// ----------------------------------------------------------------------------
const BENEFITS = [
  {
    id: 'energy',
    title: 'Wake with Energy',
    description: 'Align with your natural body clock for calm, easy mornings.',
    icon: 'sunny',
    accentColor: '#8B7CF6',
    softBg: 'rgba(139, 124, 246, 0.12)',
  },
  {
    id: 'focus',
    title: 'Focus without Burnout',
    description: 'Small, flexible micro-habits that build effortless momentum.',
    icon: 'sparkles',
    accentColor: '#10B981',
    softBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'rest',
    title: 'Rest & Recharge',
    description: 'Wind down peacefully each night and wake up restored.',
    icon: 'moon',
    accentColor: '#0EA5E9',
    softBg: 'rgba(14, 165, 233, 0.12)',
  },
] as const;

// ----------------------------------------------------------------------------
// Step 2: Personalization Options
// ----------------------------------------------------------------------------
interface ChronotypeOption {
  id: Chronotype;
  title: string;
  peakTime: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  softBg: string;
}

const CHRONOTYPES: ChronotypeOption[] = [
  {
    id: 'sunrise_riser',
    title: 'Early Bird',
    peakTime: 'Morning • 6 AM – 11 AM',
    description: 'Best for dawn clarity and early focus.',
    icon: 'sunny-outline',
    iconColor: '#F59E0B',
    softBg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    id: 'balanced_pacer',
    title: 'Steady Pacer',
    peakTime: 'Midday • 9 AM – 3 PM',
    description: 'Balanced flow for consistent progress.',
    icon: 'partly-sunny-outline',
    iconColor: '#7C3AED',
    softBg: 'rgba(124, 58, 237, 0.12)',
  },
  {
    id: 'night_mind',
    title: 'Night Owl',
    peakTime: 'Evening • 6 PM – Midnight',
    description: 'Deep nocturnal focus and late creativity.',
    icon: 'moon-outline',
    iconColor: '#4F46E5',
    softBg: 'rgba(79, 70, 229, 0.12)',
  },
];

const WAKE_TIMES = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM'];

// ----------------------------------------------------------------------------
// Step 3: Goals Data (Punchy & Compact)
// ----------------------------------------------------------------------------
interface GoalOption {
  id: GoalId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GOALS_LIST: GoalOption[] = [
  {
    id: 'morning_grounding',
    title: 'Morning Calm',
    subtitle: 'Screen-free dawn',
    icon: 'sunny',
  },
  {
    id: 'deep_work',
    title: 'Deep Focus',
    subtitle: 'Flow blocks',
    icon: 'flash',
  },
  {
    id: 'mindful_movement',
    title: 'Movement',
    subtitle: 'Gentle walk & stretch',
    icon: 'walk',
  },
  {
    id: 'stress_relief',
    title: 'Stress Reset',
    subtitle: '2-min breath pause',
    icon: 'leaf',
  },
  {
    id: 'digital_sunset',
    title: 'Digital Sunset',
    subtitle: 'Screen-off unwind',
    icon: 'bulb-outline',
  },
  {
    id: 'deep_sleep',
    title: 'Deep Sleep',
    subtitle: '8 hrs restful recovery',
    icon: 'moon',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    chronotype,
    wakeTime,
    goals,
    setChronotype,
    setWakeTime,
    toggleGoal,
    completeOnboarding,
  } = useOnboarding();

  const handleNext = useCallback(async () => {
    triggerHaptic();
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 2 | 3);
    } else {
      await completeOnboarding();
      router.replace('/explore');
    }
  }, [currentStep, completeOnboarding, router]);

  const handleBack = useCallback(() => {
    triggerHaptic();
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  }, [currentStep]);

  const handleSkip = useCallback(async () => {
    triggerHaptic();
    await completeOnboarding();
    router.replace('/explore');
  }, [completeOnboarding, router]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* 1. Luminous Pure Pastel Morning Canvas */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F7FF', '#F1F5FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft Organic Ambient Atmosphere Glass Orbs (Subtle & Luminous) */}
      <AmbientAtmosphere opacity={0.32} />

      {/* 3. Safe Container */}
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 6 : 2),
            paddingBottom: Math.max(insets.bottom, 12),
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        {/* Top Navigation Bar (Symmetrical & Proper) */}
        <View style={styles.topBar}>
          {/* Left Slot: Back Button if Step > 1, else Subtle Logo Mark */}
          <View style={styles.topBarSideSlot}>
            {currentStep > 1 ? (
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.navIconButton,
                  pressed && styles.buttonPressed,
                ]}>
                <Ionicons name="chevron-back" size={20} color="#1E1B4B" />
              </Pressable>
            ) : (
              <View style={styles.topBarLogoMark}>
                <RoutineSathyEmblem size={24} />
              </View>
            )}
          </View>

          {/* Center Slot: 3-Segment Progress Dash Indicator */}
          <View style={styles.segmentTrack}>
            <View
              style={[
                styles.segmentBar,
                currentStep >= 1 ? styles.segmentBarActive : styles.segmentBarInactive,
              ]}
            />
            <View
              style={[
                styles.segmentBar,
                currentStep >= 2 ? styles.segmentBarActive : styles.segmentBarInactive,
              ]}
            />
            <View
              style={[
                styles.segmentBar,
                currentStep >= 3 ? styles.segmentBarActive : styles.segmentBarInactive,
              ]}
            />
          </View>

          {/* Right Slot: Skip Button */}
          <View style={[styles.topBarSideSlot, styles.topBarRightSlot]}>
            <Pressable
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              hitSlop={12}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          </View>
        </View>

        {/* Dynamic Step Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {currentStep === 1 && (
            <Animated.View
              key="step-1"
              entering={FadeInRight.duration(350)}
              exiting={FadeOutLeft.duration(200)}>
              {/* Header */}
              <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Sync with Your Biology</Text>
                <Text style={styles.stepSubtitle}>
                  Tune your daily habits to the earth&apos;s natural 24-hour cycle.
                </Text>
              </View>

              {/* Signature Visual Hero: Interactive Circadian Clock */}
              <CircadianRhythmDial size={210} />

              {/* 3 Micro Biological Cycle Highlights */}
              <View style={styles.cardsStack}>
                {BENEFITS.map((benefit, index) => (
                  <Animated.View
                    key={benefit.id}
                    entering={FadeInDown.delay(index * 90).duration(350)}
                    style={styles.benefitRowCard}>
                    <View
                      style={[
                        styles.benefitIconBox,
                        { backgroundColor: benefit.softBg },
                      ]}>
                      <Ionicons
                        name={benefit.icon as any}
                        size={20}
                        color={benefit.accentColor}
                      />
                    </View>
                    <View style={styles.benefitTextCol}>
                      <Text style={styles.benefitRowTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitRowDescription}>
                        {benefit.description}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {currentStep === 2 && (
            <Animated.View
              key="step-2"
              entering={FadeInRight.duration(350)}
              exiting={FadeOutLeft.duration(200)}>
              {/* Header */}
              <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>When do you feel best?</Text>
                <Text style={styles.stepSubtitle}>
                  We&apos;ll tailor your daily routine around your natural energy.
                </Text>
              </View>

              {/* Chronotype Row Cards */}
              <View style={styles.cardsStack}>
                {CHRONOTYPES.map((item, index) => {
                  const isSelected = chronotype === item.id;
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(index * 80).duration(350)}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic();
                          setChronotype(item.id);
                        }}
                        style={({ pressed }) => [
                          styles.chronotypeCard,
                          isSelected && styles.chronotypeCardActive,
                          pressed && styles.buttonPressed,
                        ]}>
                        <View
                          style={[
                            styles.chronotypeIconBox,
                            { backgroundColor: item.softBg },
                            isSelected && styles.chronotypeIconBoxActive,
                          ]}>
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color={item.iconColor}
                          />
                        </View>
                        <View style={styles.chronotypeTextCol}>
                          <Text style={styles.chronotypeTitle}>{item.title}</Text>
                          <Text style={styles.chronotypePeakTime}>
                            {item.peakTime}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}>
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Target Wake-Up Time */}
              <View style={styles.wakeSection}>
                <Text style={styles.sectionHeaderTitle}>Target Wake-Up</Text>
                <View style={styles.chipsRow}>
                  {WAKE_TIMES.map((time) => {
                    const isActive = wakeTime === time;
                    return (
                      <Pressable
                        key={time}
                        onPress={() => {
                          triggerHaptic();
                          setWakeTime(time);
                        }}
                        style={[
                          styles.timeChip,
                          isActive && styles.timeChipActive,
                        ]}>
                        <Text
                          style={[
                            styles.timeChipText,
                            isActive && styles.timeChipTextActive,
                          ]}>
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Animated.View>
          )}

          {currentStep === 3 && (
            <Animated.View
              key="step-3"
              entering={FadeInRight.duration(350)}
              exiting={FadeOutLeft.duration(200)}>
              {/* Header */}
              <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>What&apos;s your focus?</Text>
                <Text style={styles.stepSubtitle}>
                  Choose a few daily intentions to start with.
                </Text>
              </View>

              {/* 2-Column Compact Goals Grid */}
              <View style={styles.goalsGridTwoCol}>
                {GOALS_LIST.map((goal, index) => {
                  const isSelected = goals.includes(goal.id);
                  return (
                    <Animated.View
                      key={goal.id}
                      entering={FadeInDown.delay(index * 60).duration(300)}
                      style={styles.goalGridItem}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic();
                          toggleGoal(goal.id);
                        }}
                        style={({ pressed }) => [
                          styles.goalTile,
                          isSelected && styles.goalTileActive,
                          pressed && styles.buttonPressed,
                        ]}>
                        <View style={styles.goalTileTop}>
                          <View
                            style={[
                              styles.goalTileIconBox,
                              isSelected && styles.goalTileIconBoxActive,
                            ]}>
                            <Ionicons
                              name={goal.icon}
                              size={18}
                              color={isSelected ? '#7C3AED' : '#64748B'}
                            />
                          </View>
                          <View
                            style={[
                              styles.checkboxSmall,
                              isSelected && styles.checkboxSmallActive,
                            ]}>
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </View>
                        <Text style={styles.goalTileTitle}>{goal.title}</Text>
                        <Text style={styles.goalTileSubtitle}>
                          {goal.subtitle}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Minimal Clean Summary Pill */}
              <Animated.View
                entering={FadeIn.delay(250).duration(350)}
                style={styles.summaryMinimalPill}>
                <RoutineSathyEmblem size={22} />
                <Text style={styles.summaryMinimalText}>
                  {chronotype === 'sunrise_riser'
                    ? 'Early Bird'
                    : chronotype === 'night_mind'
                    ? 'Night Owl'
                    : 'Steady Pacer'}{' '}
                  • {wakeTime} • {goals.length} Intentions
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Fixed Action CTA */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <LinearGradient
              colors={['#8B7CF6', '#7C3AED', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}>
              <Text style={styles.primaryButtonText}>
                {currentStep === 1
                  ? 'Personalize My Rhythm ➔'
                  : currentStep === 2
                  ? 'Continue to Goals ➔'
                  : 'Begin Mindful Rhythm ✨'}
              </Text>
              <Ionicons
                name={currentStep === 3 ? 'sparkles' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FAF9FF',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 52,
    zIndex: 10,
  },
  topBarSideSlot: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarRightSlot: {
    alignItems: 'flex-end',
  },
  navIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  topBarLogoMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  segmentBar: {
    flex: 1,
    height: 4.5,
    borderRadius: 3,
  },
  segmentBarActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.30,
    shadowRadius: 3,
  },
  segmentBarInactive: {
    backgroundColor: 'rgba(139, 124, 246, 0.16)',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerBlock: {
    marginTop: 12,
    marginBottom: 20,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 124, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 246, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    letterSpacing: -0.1,
  },
  cardsStack: {
    gap: 10,
  },
  benefitRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    borderRadius: 18,
    padding: 13,
    gap: 13,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  benefitRowDescription: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#475569',
  },
  chronotypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    borderRadius: 18,
    padding: 13,
    gap: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chronotypeCardActive: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  chronotypeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 124, 246, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chronotypeIconBoxActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.20)',
  },
  chronotypeTextCol: {
    flex: 1,
  },
  chronotypeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  chronotypePeakTime: {
    fontSize: 12,
    color: '#64748B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#7C3AED',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  wakeSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  goalsGridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalGridItem: {
    width: '48.4%',
  },
  goalTile: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 242, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalTileActive: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  goalTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 124, 246, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTileIconBoxActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.20)',
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSmallActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  goalTileTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  goalTileSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryMinimalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 124, 246, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    gap: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryMinimalText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7C3AED',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
