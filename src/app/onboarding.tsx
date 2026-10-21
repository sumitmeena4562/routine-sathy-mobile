import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

import { AmbientAtmosphere, RoutineSathyEmblem } from '@/components/ui';
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
// Step 1: Benefits Data
// ----------------------------------------------------------------------------
const BENEFITS = [
  {
    id: 'circadian',
    tag: 'BIOLOGICAL CLOCK',
    title: 'Circadian Flow Alignment',
    description:
      'Harmonize waking, deep focus, and rest with your natural solar biology for effortless daytime energy and focus.',
    icon: 'sunny',
    accentColor: '#8B7CF6',
    softBg: 'rgba(139, 124, 246, 0.12)',
  },
  {
    id: 'continuity',
    tag: 'EFFORTLESS STREAKS',
    title: 'Mindful Continuity ("Sathy")',
    description:
      'Consistency over intense checklists. Flexible micro-rituals that adapt when life gets busy so your streak never feels burdensome.',
    icon: 'infinite',
    accentColor: '#10B981',
    softBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'recovery',
    tag: 'RESTORATIVE RECOVERY',
    title: 'Adaptive Energy Pacing',
    description:
      'Listen to daily energy rhythms. Routine Sathy gently guides evening digital sunsets and deep sleep preparation.',
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
  badge: string;
  title: string;
  peakTime: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CHRONOTYPES: ChronotypeOption[] = [
  {
    id: 'sunrise_riser',
    badge: 'MORNING LARK',
    title: 'Sunrise Riser',
    peakTime: 'Peak: 06:00 AM – 11:00 AM',
    description: 'Natural early riser. Ideal for dawn grounding, morning movement, and early clarity.',
    icon: 'sunny-outline',
  },
  {
    id: 'balanced_pacer',
    badge: 'STEADY FLOW',
    title: 'Balanced Day Pacer',
    peakTime: 'Peak: 09:00 AM – 03:00 PM',
    description: 'Steady circadian rhythm. Ideal for regular workdays, midday focus, and peaceful evenings.',
    icon: 'partly-sunny-outline',
  },
  {
    id: 'night_mind',
    badge: 'EVENING OWL',
    title: 'Night Mind',
    peakTime: 'Peak: 05:00 PM – Midnight',
    description: 'Deep nocturnal focus. Best for relaxed mornings and uninterrupted late-day momentum.',
    icon: 'moon-outline',
  },
];

const WAKE_TIMES = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM'];

// ----------------------------------------------------------------------------
// Step 3: Goals Data
// ----------------------------------------------------------------------------
interface GoalOption {
  id: GoalId;
  title: string;
  subtitle: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GOALS_LIST: GoalOption[] = [
  {
    id: 'morning_grounding',
    title: 'Morning Grounding',
    subtitle: 'Hydration, sunlight & 20 min screen-free dawn',
    category: 'MORNING',
    icon: 'sunny',
  },
  {
    id: 'deep_work',
    title: 'Deep Work & Focus',
    subtitle: 'High-output flow blocks with zero mental fatigue',
    category: 'PRODUCTIVITY',
    icon: 'flash',
  },
  {
    id: 'mindful_movement',
    title: 'Mindful Daily Movement',
    subtitle: 'Gentle stretching, steps & posture resets',
    category: 'VITALITY',
    icon: 'body',
  },
  {
    id: 'stress_relief',
    title: 'Nervous System Reset',
    subtitle: '2-minute box breathing & midday pauses',
    category: 'CALM',
    icon: 'leaf',
  },
  {
    id: 'digital_sunset',
    title: 'Digital Sunset',
    subtitle: 'Screen dimming, journaling & evening decompression',
    category: 'EVENING',
    icon: 'bulb-outline',
  },
  {
    id: 'deep_sleep',
    title: 'Restorative Sleep',
    subtitle: 'Consistent bedtime rhythm for 8 hours of recovery',
    category: 'NIGHT',
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

  const progressPercent = useMemo(() => {
    return (currentStep / 3) * 100;
  }, [currentStep]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* 1. Luminous Ambient Gradient Canvas */}
      <LinearGradient
        colors={['#FAF9FF', '#FFFFFF', '#F3F7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft Organic Ambient Atmosphere Glass Orbs */}
      <AmbientAtmosphere />

      {/* 3. Safe Container */}
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation & Step Indicator */}
        <View style={styles.topBar}>
          {currentStep > 1 ? (
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.navIconButton,
                pressed && styles.buttonPressed,
              ]}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </Pressable>
          ) : (
            <View style={styles.logoPill}>
              <RoutineSathyEmblem size={22} />
              <Text style={styles.logoPillText}>Routine Sathy</Text>
            </View>
          )}

          {/* Progress Segment Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.stepCounterText}>Step {currentStep} of 3</Text>
          </View>

          {/* Skip Action */}
          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
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
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>✦ WHY ROUTINE SATHY</Text>
                </View>
                <Text style={styles.stepTitle}>Rhythm Over Hustle</Text>
                <Text style={styles.stepSubtitle}>
                  Realign with your biological energy, build effortless continuity,
                  and cultivate mindful peace every day.
                </Text>
              </View>

              {/* Benefit Cards */}
              <View style={styles.cardsStack}>
                {BENEFITS.map((benefit, index) => (
                  <Animated.View
                    key={benefit.id}
                    entering={FadeInDown.delay(index * 120).duration(400)}
                    style={styles.glassCard}>
                    <View style={styles.cardHeaderRow}>
                      <View
                        style={[
                          styles.iconBadge,
                          { backgroundColor: benefit.softBg },
                        ]}>
                        <Ionicons
                          name={benefit.icon as any}
                          size={22}
                          color={benefit.accentColor}
                        />
                      </View>
                      <View style={styles.cardTagPill}>
                        <Text
                          style={[
                            styles.cardTagText,
                            { color: benefit.accentColor },
                          ]}>
                          {benefit.tag}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>
                      {benefit.description}
                    </Text>
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
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>✦ STEP 2: PERSONALIZATION</Text>
                </View>
                <Text style={styles.stepTitle}>Your Chronotype Rhythm</Text>
                <Text style={styles.stepSubtitle}>
                  Everyone&apos;s internal clock is unique. Select when your mind
                  and energy feel most alive.
                </Text>
              </View>

              {/* Chronotype Cards */}
              <View style={styles.cardsStack}>
                {CHRONOTYPES.map((item, index) => {
                  const isSelected = chronotype === item.id;
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(index * 100).duration(400)}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic();
                          setChronotype(item.id);
                        }}
                        style={({ pressed }) => [
                          styles.selectableCard,
                          isSelected && styles.selectableCardActive,
                          pressed && styles.buttonPressed,
                        ]}>
                        <View style={styles.cardHeaderRow}>
                          <View
                            style={[
                              styles.iconBadge,
                              isSelected && styles.iconBadgeActive,
                            ]}>
                            <Ionicons
                              name={item.icon}
                              size={22}
                              color={isSelected ? '#7C3AED' : '#6B7280'}
                            />
                          </View>
                          <View style={styles.rowRight}>
                            <View
                              style={[
                                styles.cardTagPill,
                                isSelected && styles.cardTagPillActive,
                              ]}>
                              <Text
                                style={[
                                  styles.cardTagText,
                                  isSelected && styles.cardTagTextActive,
                                ]}>
                                {item.badge}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleActive,
                              ]}>
                              {isSelected && (
                                <View style={styles.radioInnerDot} />
                              )}
                            </View>
                          </View>
                        </View>

                        <Text style={styles.benefitTitle}>{item.title}</Text>
                        <Text style={styles.peakTimeText}>{item.peakTime}</Text>
                        <Text style={styles.benefitDescription}>
                          {item.description}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Target Wake-Up Time */}
              <View style={styles.wakeSection}>
                <Text style={styles.sectionHeaderTitle}>
                  Daily Morning Anchor
                </Text>
                <Text style={styles.sectionHeaderSubtitle}>
                  Choose your target time to begin morning presence
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

          {currentStep === 3 && (
            <Animated.View
              key="step-3"
              entering={FadeInRight.duration(350)}
              exiting={FadeOutLeft.duration(200)}>
              {/* Header */}
              <View style={styles.headerBlock}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>✦ STEP 3: DAILY GOALS</Text>
                </View>
                <Text style={styles.stepTitle}>Choose Your Intentions</Text>
                <Text style={styles.stepSubtitle}>
                  Select the mindful habits you want Routine Sathy to nurture
                  with you.
                </Text>
              </View>

              {/* Goals Multi-Select Grid */}
              <View style={styles.goalsGrid}>
                {GOALS_LIST.map((goal, index) => {
                  const isSelected = goals.includes(goal.id);
                  return (
                    <Animated.View
                      key={goal.id}
                      entering={FadeInDown.delay(index * 70).duration(350)}>
                      <Pressable
                        onPress={() => {
                          triggerHaptic();
                          toggleGoal(goal.id);
                        }}
                        style={({ pressed }) => [
                          styles.goalCard,
                          isSelected && styles.goalCardActive,
                          pressed && styles.buttonPressed,
                        ]}>
                        <View style={styles.goalTopRow}>
                          <View
                            style={[
                              styles.goalIconBox,
                              isSelected && styles.goalIconBoxActive,
                            ]}>
                            <Ionicons
                              name={goal.icon}
                              size={20}
                              color={isSelected ? '#7C3AED' : '#6B7280'}
                            />
                          </View>
                          <View
                            style={[
                              styles.checkboxSquare,
                              isSelected && styles.checkboxSquareActive,
                            ]}>
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </View>

                        <Text style={styles.goalCategory}>
                          {goal.category}
                        </Text>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalSubtitle}>
                          {goal.subtitle}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Live Tailored Blueprint Summary Banner */}
              <Animated.View
                entering={FadeIn.delay(300).duration(400)}
                style={styles.summaryGlassBanner}>
                <LinearGradient
                  colors={[
                    'rgba(139, 124, 246, 0.12)',
                    'rgba(167, 139, 250, 0.05)',
                  ]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.summaryIconCol}>
                  <RoutineSathyEmblem size={32} />
                </View>
                <View style={styles.summaryTextCol}>
                  <Text style={styles.summaryHeading}>
                    Your Circadian Blueprint Ready
                  </Text>
                  <Text style={styles.summaryDetails}>
                    {chronotype === 'sunrise_riser'
                      ? '🌅 Sunrise Lark'
                      : chronotype === 'night_mind'
                      ? '🌙 Night Mind'
                      : '☀️ Balanced Flow'}{' '}
                    • {wakeTime} Anchor • {goals.length} Intentions
                  </Text>
                </View>
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
                  ? 'Continue to Personalize'
                  : currentStep === 2
                  ? 'Continue to Goals'
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
      </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  navIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
    letterSpacing: -0.2,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  progressTrack: {
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(139, 124, 246, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerBlock: {
    marginBottom: 22,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 124, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 246, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
    letterSpacing: -0.1,
  },
  cardsStack: {
    gap: 14,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  selectableCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  selectableCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: '#8B7CF6',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 124, 246, 0.12)',
  },
  iconBadgeActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.20)',
  },
  cardTagPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  cardTagPillActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.14)',
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTagTextActive: {
    color: '#7C3AED',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
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
  benefitTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  peakTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },
  wakeSection: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  goalsGrid: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  goalCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#8B7CF6',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 124, 246, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconBoxActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.22)',
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  goalCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  goalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#4B5563',
  },
  summaryGlassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 124, 246, 0.35)',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    overflow: 'hidden',
    position: 'relative',
    gap: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  summaryIconCol: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 3,
  },
  summaryDetails: {
    fontSize: 12,
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
