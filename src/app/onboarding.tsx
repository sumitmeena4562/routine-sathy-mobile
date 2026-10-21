import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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

import { RoutineSathyEmblem } from '@/components/ui';
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
// Step 1: Feature Highlights (Apple Editorial Style)
// ----------------------------------------------------------------------------
const EDITORIAL_FEATURES = [
  {
    id: 'circadian',
    title: 'Natural Circadian Harmony',
    description:
      'Sync waking, peak focus blocks, and evening wind-down with your body’s biological clock.',
    icon: 'sunny',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
  {
    id: 'continuity',
    title: 'Consistency Over Intensity',
    description:
      'Flexible micro-rituals that adapt when life gets busy. Effortless streaks with zero burnout.',
    icon: 'sparkles',
    iconColor: '#059669',
    iconBg: '#D1FAE5',
  },
  {
    id: 'recovery',
    title: 'Restorative Night Recovery',
    description:
      'A gentle digital sunset to quiet bedtime racing thoughts and wake up deeply restored.',
    icon: 'moon',
    iconColor: '#4338CA',
    iconBg: '#E0E7FF',
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
    description: 'Natural early energy for dawn clarity and deep morning focus.',
    icon: 'sunny-outline',
    iconColor: '#D97706',
    softBg: '#FEF3C7',
  },
  {
    id: 'balanced_pacer',
    title: 'Steady Pacer',
    peakTime: 'Midday • 9 AM – 3 PM',
    description: 'Balanced circadian flow for steady daytime momentum.',
    icon: 'partly-sunny-outline',
    iconColor: '#7C3AED',
    softBg: '#EDE9FE',
  },
  {
    id: 'night_mind',
    title: 'Night Owl',
    peakTime: 'Evening • 6 PM – Midnight',
    description: 'Peak creative focus and deep flow during late evening hours.',
    icon: 'moon-outline',
    iconColor: '#4338CA',
    softBg: '#E0E7FF',
  },
];

const WAKE_TIMES = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
];

// ----------------------------------------------------------------------------
// Step 3: Goals Data (Paired into Rows for 100% Robust 2-Column Responsiveness)
// ----------------------------------------------------------------------------
interface GoalOption {
  id: GoalId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GOALS_PAIRS: [GoalOption, GoalOption][] = [
  [
    {
      id: 'morning_grounding',
      title: 'Morning Calm',
      subtitle: 'Screen-free dawn',
      icon: 'sunny',
    },
    {
      id: 'deep_work',
      title: 'Deep Focus',
      subtitle: 'Flow without fatigue',
      icon: 'flash',
    },
  ],
  [
    {
      id: 'mindful_movement',
      title: 'Movement',
      subtitle: 'Walk & daily stretch',
      icon: 'walk',
    },
    {
      id: 'stress_relief',
      title: 'Stress Reset',
      subtitle: '2-min breath pause',
      icon: 'leaf',
    },
  ],
  [
    {
      id: 'digital_sunset',
      title: 'Digital Sunset',
      subtitle: 'Screen-off unwind',
      icon: 'bulb-outline',
    },
    {
      id: 'deep_sleep',
      title: 'Deep Sleep',
      subtitle: '8 hrs recovery',
      icon: 'moon',
    },
  ],
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isCompact = windowHeight < 720 || windowWidth < 380;

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

  // Android Hardware Back Button Handling
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (currentStep > 1) {
          handleBack();
          return true; // Consume event
        }
        return false; // Exit app or default behavior
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }
  }, [currentStep, handleBack]);

  const emblemSize = isCompact ? 28 : 32;
  const emblemContainerSize = isCompact ? 50 : 58;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Screen Frame with Top Inset */}
      <View
        style={[
          styles.screenFrame,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 6 : 2),
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        {/* Responsive Centered Column Wrapper */}
        <View style={styles.responsiveWrapper}>
          {/* Symmetrical Top Navigation Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarSideSlot}>
              {currentStep > 1 ? (
                <Pressable
                  onPress={handleBack}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.navIconButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Ionicons name="chevron-back" size={20} color="#0F172A" />
                </Pressable>
              ) : (
                <View style={styles.topBarLogoMark}>
                  <RoutineSathyEmblem size={22} />
                </View>
              )}
            </View>

            {/* 3-Segment Progress Dashes */}
            <View style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentBar,
                  currentStep >= 1
                    ? styles.segmentBarActive
                    : styles.segmentBarInactive,
                ]}
              />
              <View
                style={[
                  styles.segmentBar,
                  currentStep >= 2
                    ? styles.segmentBarActive
                    : styles.segmentBarInactive,
                ]}
              />
              <View
                style={[
                  styles.segmentBar,
                  currentStep >= 3
                    ? styles.segmentBarActive
                    : styles.segmentBarInactive,
                ]}
              />
            </View>

            {/* Skip Button */}
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

          {/* Dynamic Scroll Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 110 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* STEP 1: WELCOME & EDITORIAL BENEFITS (Pure Apple Native Feel) */}
            {currentStep === 1 && (
              <Animated.View
                key="step-1"
                entering={FadeInRight.duration(320)}
                exiting={FadeOutLeft.duration(200)}>
                {/* Top Hero Brand Insignia */}
                <View
                  style={[
                    styles.heroBrandCenter,
                    isCompact && styles.heroBrandCenterCompact,
                  ]}>
                  <View
                    style={[
                      styles.heroEmblemContainer,
                      {
                        width: emblemContainerSize,
                        height: emblemContainerSize,
                        borderRadius: isCompact ? 15 : 18,
                        marginBottom: isCompact ? 12 : 16,
                      },
                    ]}>
                    <LinearGradient
                      colors={['#8B7CF6', '#7C3AED', '#6D28D9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.heroGlassRim} />
                    <RoutineSathyEmblem size={emblemSize} />
                  </View>

                  <Text
                    style={[
                      styles.heroTitle,
                      isCompact && styles.heroTitleCompact,
                    ]}>
                    Welcome to Routine Sathy
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      isCompact && styles.heroSubtitleCompact,
                    ]}>
                    A mindful circadian rhythm for daily habits that actually stick.
                  </Text>
                </View>

                {/* Frameless Editorial Feature Rows */}
                <View
                  style={[
                    styles.editorialList,
                    isCompact && styles.editorialListCompact,
                  ]}>
                  {EDITORIAL_FEATURES.map((feature, index) => (
                    <Animated.View
                      key={feature.id}
                      entering={FadeInDown.delay(index * 80).duration(300)}
                      style={styles.editorialRow}>
                      <View
                        style={[
                          styles.editorialIconBox,
                          { backgroundColor: feature.iconBg },
                        ]}>
                        <Ionicons
                          name={feature.icon as any}
                          size={22}
                          color={feature.iconColor}
                        />
                      </View>
                      <View style={styles.editorialTextCol}>
                        <Text style={styles.editorialRowTitle}>
                          {feature.title}
                        </Text>
                        <Text style={styles.editorialRowDescription}>
                          {feature.description}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* STEP 2: CHRONOTYPE PERSONALIZATION */}
            {currentStep === 2 && (
              <Animated.View
                key="step-2"
                entering={FadeInRight.duration(320)}
                exiting={FadeOutLeft.duration(200)}>
                <View
                  style={[
                    styles.headerBlock,
                    isCompact && styles.headerBlockCompact,
                  ]}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompact && styles.stepTitleCompact,
                    ]}>
                    When is your energy highest?
                  </Text>
                  <Text style={styles.stepSubtitle}>
                    We&apos;ll tailor your daily routine around your biological rhythm.
                  </Text>
                </View>

                {/* Chronotype Selection Cards */}
                <View style={styles.cardsStack}>
                  {CHRONOTYPES.map((item, index) => {
                    const isSelected = chronotype === item.id;
                    return (
                      <Animated.View
                        key={item.id}
                        entering={FadeInDown.delay(index * 60).duration(280)}>
                        <Pressable
                          onPress={() => {
                            triggerHaptic();
                            setChronotype(item.id);
                          }}
                          style={({ pressed }) => [
                            styles.chronotypeCard,
                            isCompact && styles.chronotypeCardCompact,
                            isSelected && styles.chronotypeCardActive,
                            pressed && styles.buttonPressed,
                          ]}>
                          <View
                            style={[
                              styles.chronotypeIconBox,
                              { backgroundColor: item.softBg },
                            ]}>
                            <Ionicons
                              name={item.icon}
                              size={22}
                              color={item.iconColor}
                            />
                          </View>
                          <View style={styles.chronotypeTextCol}>
                            <View style={styles.chronotypeTitleRow}>
                              <Text style={styles.chronotypeTitle}>
                                {item.title}
                              </Text>
                              <Text style={styles.chronotypePeakTime}>
                                {item.peakTime}
                              </Text>
                            </View>
                            <Text style={styles.chronotypeDescription}>
                              {item.description}
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
                <View
                  style={[
                    styles.wakeSection,
                    isCompact && styles.wakeSectionCompact,
                  ]}>
                  <Text style={styles.sectionHeaderTitle}>
                    Target Morning Wake-Up
                  </Text>
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

            {/* STEP 3: GOALS & INTENTIONS */}
            {currentStep === 3 && (
              <Animated.View
                key="step-3"
                entering={FadeInRight.duration(320)}
                exiting={FadeOutLeft.duration(200)}>
                <View
                  style={[
                    styles.headerBlock,
                    isCompact && styles.headerBlockCompact,
                  ]}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompact && styles.stepTitleCompact,
                    ]}>
                    What&apos;s your focus?
                  </Text>
                  <Text style={styles.stepSubtitle}>
                    Choose a few daily intentions to start with.
                  </Text>
                </View>

                {/* 100% Mathematically Responsive 2-Column Pairs */}
                <View style={styles.goalsContainer}>
                  {GOALS_PAIRS.map((pair, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.goalsRow}>
                      {pair.map((goal, colIndex) => {
                        const isSelected = goals.includes(goal.id);
                        return (
                          <Animated.View
                            key={goal.id}
                            entering={FadeInDown.delay(
                              (rowIndex * 2 + colIndex) * 45
                            ).duration(260)}
                            style={styles.goalTileWrapper}>
                            <Pressable
                              onPress={() => {
                                triggerHaptic();
                                toggleGoal(goal.id);
                              }}
                              style={({ pressed }) => [
                                styles.goalTile,
                                isCompact && styles.goalTileCompact,
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
                              <Text
                                style={styles.goalTileTitle}
                                numberOfLines={1}>
                                {goal.title}
                              </Text>
                              <Text
                                style={styles.goalTileSubtitle}
                                numberOfLines={1}>
                                {goal.subtitle}
                              </Text>
                            </Pressable>
                          </Animated.View>
                        );
                      })}
                    </View>
                  ))}
                </View>

                {/* Minimal Summary Pill */}
                <Animated.View
                  entering={FadeIn.delay(180).duration(280)}
                  style={styles.summaryMinimalPill}>
                  <RoutineSathyEmblem size={20} />
                  <Text style={styles.summaryMinimalText}>
                    {chronotype === 'sunrise_riser'
                      ? 'Early Bird'
                      : chronotype === 'night_mind'
                      ? 'Night Owl'
                      : 'Steady Pacer'}{' '}
                    • {wakeTime} • {goals.length} Intentions selected
                  </Text>
                </Animated.View>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Pinned Primary CTA Bar - Docked to Physical Bottom */}
      <View style={styles.bottomBarWrapper}>
        <View
          style={[
            styles.bottomBarContent,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>
              {currentStep === 1
                ? 'Continue'
                : currentStep === 2
                ? 'Continue'
                : 'Begin Mindful Rhythm ✨'}
            </Text>
            <Ionicons
              name={currentStep === 3 ? 'sparkles' : 'arrow-forward'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenFrame: {
    flex: 1,
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarLogoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  segmentBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentBarActive: {
    backgroundColor: '#7C3AED',
  },
  segmentBarInactive: {
    backgroundColor: '#E2E8F0',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 6,
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  // Step 1: Hero Editorial Layout
  heroBrandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 26,
  },
  heroBrandCenterCompact: {
    marginTop: 2,
    marginBottom: 16,
  },
  heroEmblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  heroGlassRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  heroTitleCompact: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  heroSubtitleCompact: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 6,
  },

  // Editorial Feature Rows
  editorialList: {
    gap: 20,
    marginTop: 6,
  },
  editorialListCompact: {
    gap: 14,
    marginTop: 4,
  },
  editorialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  editorialIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  editorialTextCol: {
    flex: 1,
  },
  editorialRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  editorialRowDescription: {
    fontSize: 13.5,
    lineHeight: 19.5,
    color: '#475569',
  },

  // Header Block for Steps 2 & 3
  headerBlock: {
    marginTop: 8,
    marginBottom: 20,
  },
  headerBlockCompact: {
    marginTop: 4,
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  stepTitleCompact: {
    fontSize: 22,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    letterSpacing: -0.1,
  },

  // Chronotype Cards
  cardsStack: {
    gap: 12,
  },
  chronotypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    gap: 14,
  },
  chronotypeCardCompact: {
    padding: 11,
    gap: 11,
    borderRadius: 16,
  },
  chronotypeCardActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  chronotypeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chronotypeTextCol: {
    flex: 1,
  },
  chronotypeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chronotypeTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  chronotypePeakTime: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  chronotypeDescription: {
    fontSize: 12.5,
    lineHeight: 17,
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

  // Target Wake-Up Time
  wakeSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  wakeSectionCompact: {
    marginTop: 16,
    paddingTop: 14,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 13,
    paddingVertical: 8.5,
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
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 100% Responsive 2-Column Pairs
  goalsContainer: {
    gap: 10,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  goalTileWrapper: {
    flex: 1,
  },
  goalTile: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 13,
  },
  goalTileCompact: {
    padding: 11,
    borderRadius: 14,
  },
  goalTileActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTileIconBoxActive: {
    backgroundColor: '#EDE9FE',
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
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 18,
    gap: 10,
  },
  summaryMinimalText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7C3AED',
    flexShrink: 1,
  },

  // Bottom Pinned Primary CTA Bar
  bottomBarWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomBarContent: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 4,
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
