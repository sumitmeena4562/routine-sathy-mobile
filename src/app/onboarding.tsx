import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

import {
  DawnAwakeningIllustration,
  DeepFocusIllustration,
  NightRecoveryIllustration,
} from '@/components/illustrations';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/hooks/use-theme';

function triggerHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration: (width: number, height: number) => React.ReactNode;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'dawn',
    title: 'Wake with Natural\nClarity & Energy',
    description:
      'Align your morning rhythm with biological sunrise. Effortless waking without multiple alarms or morning brain fog.',
    illustration: (w, h) => <DawnAwakeningIllustration width={w} height={h} />,
  },
  {
    id: 'focus',
    title: 'Focus in Peak\nDaily Flow Blocks',
    description:
      'Synchronize your deep work sessions with your body’s peak alertness hours. Accomplish more with zero mental burnout.',
    illustration: (w, h) => <DeepFocusIllustration width={w} height={h} />,
  },
  {
    id: 'recovery',
    title: 'Rest with Deep\nNight Recovery',
    description:
      'A gentle digital sunset to quiet bedtime racing thoughts, ease into non-REM sleep, and wake up deeply restored.',
    illustration: (w, h) => <NightRecoveryIllustration width={w} height={h} />,
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useOnboarding();

  const rawWidth = windowWidth > 0 ? windowWidth : 375;
  const rawHeight = windowHeight > 0 ? windowHeight : 812;
  const isCompact = rawHeight < 720;
  const illustrationHeight = isCompact ? 200 : 240;
  const illustrationWidth = Math.max(Math.min(rawWidth - 48, 320), 240);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / rawWidth);
      if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, rawWidth]
  );

  const handleNext = useCallback(async () => {
    triggerHaptic();
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      try {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      } catch {
        flatListRef.current?.scrollToOffset({ offset: nextIndex * rawWidth, animated: true });
      }
      setCurrentIndex(nextIndex);
    } else {
      await completeOnboarding();
      // Onboarding complete: smooth loop back to start for continuous demonstration & replay
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      setCurrentIndex(0);
    }
  }, [currentIndex, completeOnboarding, rawWidth]);

  const handleSkip = useCallback(async () => {
    triggerHaptic();
    await completeOnboarding();
    const lastIndex = SLIDES.length - 1;
    try {
      flatListRef.current?.scrollToIndex({ index: lastIndex, animated: true });
    } catch {
      flatListRef.current?.scrollToOffset({ offset: lastIndex * rawWidth, animated: true });
    }
    setCurrentIndex(lastIndex);
  }, [completeOnboarding, rawWidth]);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top Header Bar with Clean Skip Action */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6),
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}>
        <View style={styles.topBarPlaceholder} />
        {!isLastSlide ? (
          <Pressable
            onPress={handleSkip}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={styles.topBarPlaceholder} />
        )}
      </View>

      {/* Main Swipeable Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialNumToRender={3}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, index) => ({
          length: rawWidth,
          offset: rawWidth * index,
          index,
        })}
        style={styles.carouselList}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width: rawWidth }]}>
            {/* 1. Big Center Illustration */}
            <View style={styles.illustrationWrapper}>
              {item.illustration(illustrationWidth, illustrationHeight)}
            </View>

            {/* 2. Text Content */}
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.slideTitle,
                  { color: theme.colors.text },
                  isCompact && styles.slideTitleCompact,
                ]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.slideDescription,
                  { color: theme.colors.textSecondary },
                  isCompact && styles.slideDescriptionCompact,
                ]}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Docked Section: Pagination Dots + Bold Pill CTA */}
      <View
        style={[
          styles.bottomControls,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 12,
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}>
        {/* Modern Pill Pagination Dots (Exact screenshot style) */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive
                    ? [
                        styles.dotActive,
                        {
                          backgroundColor: theme.isDark
                            ? '#FFFFFF'
                            : '#0F172A',
                        },
                      ]
                    : [
                        styles.dotInactive,
                        {
                          backgroundColor: theme.isDark
                            ? '#334155'
                            : '#CBD5E1',
                        },
                      ],
                ]}
              />
            );
          })}
        </View>

        {/* Solid Black/Navy Pill CTA Button */}
        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Get Started' : 'Next'}
          style={({ pressed }) => [
            styles.primaryPillButton,
            {
              backgroundColor: theme.isDark ? '#F8FAFC' : '#0F172A',
            },
            pressed && styles.buttonPressed,
          ]}>
          <Text
            style={[
              styles.primaryPillButtonText,
              {
                color: theme.isDark ? '#0F172A' : '#FFFFFF',
              },
            ]}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    height: 48,
  },
  topBarPlaceholder: {
    width: 44,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  carouselList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 12,
  },
  slideTitle: {
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.7,
    lineHeight: 35,
    marginBottom: 14,
  },
  slideTitleCompact: {
    fontSize: 23,
    lineHeight: 30,
    marginBottom: 10,
  },
  slideDescription: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  slideDescriptionCompact: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  bottomControls: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 24,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 6,
  },
  primaryPillButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryPillButtonText: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
