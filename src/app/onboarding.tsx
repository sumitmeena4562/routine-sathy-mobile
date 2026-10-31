import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {
  BrandLandscapeIllustration,
  DawnAwakeningIllustration,
  DeepFocusIllustration,
  NightRecoveryIllustration,
} from '@/components/illustrations';
import { BrandLogo, Button } from '@/components/ui';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  ComponentTokens,
  LayoutTokens,
  PrimitiveTokens,
  SemanticDarkTokens,
  TypographyScale,
} from '@/theme/tokens.generated';

function triggerHaptic(type: 'light' | 'success' = 'light') {
  if (Platform.OS !== 'web') {
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
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
    title: 'Wake Up Refreshed',
    description: 'Build mindful morning habits to start every day with natural energy and clarity.',
    illustration: (w, h) => <DawnAwakeningIllustration width={w} height={h} tone="dark" />,
  },
  {
    id: 'focus',
    title: 'Stay in Flow',
    description: 'Track your daily routines and achieve your goals without mental burnout.',
    illustration: (w, h) => <DeepFocusIllustration width={w} height={h} tone="dark" />,
  },
  {
    id: 'recovery',
    title: 'Rest & Recharge',
    description: 'Unwind your mind with gentle evening rituals for deep, restorative sleep.',
    illustration: (w, h) => <NightRecoveryIllustration width={w} height={h} tone="dark" />,
  },
];

interface AnimatedDotProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}

function AnimatedDot({ index, scrollX, width }: AnimatedDotProps) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 28, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.35, 1, 0.35],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dotBase, animatedDotStyle]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useOnboarding();

  const rawWidth = windowWidth > 0 ? windowWidth : 375;
  const rawHeight = windowHeight > 0 ? windowHeight : 812;
  const isCompact = rawHeight < 720 || rawWidth < 380;
  const isTablet = rawWidth >= 768;

  // Fluid responsive illustration scaling based on screen height
  const illustrationHeight = Math.round(
    Math.min(Math.max(rawHeight * 0.28, 160), 220)
  );
  const illustrationWidth = Math.round(
    Math.min(Math.max(rawWidth * 0.72, 220), 320)
  );

  // Shared scroll offset for fluid interactive dot animation
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / rawWidth);
      if (index >= 0 && index < SLIDES.length) {
        if (index !== currentIndex) {
          triggerHaptic('light');
        }
        setCurrentIndex(index);
      }
    },
    [rawWidth, currentIndex]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex < SLIDES.length - 1) {
      triggerHaptic('light');
      const nextIndex = currentIndex + 1;
      try {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      } catch {
        flatListRef.current?.scrollToOffset({ offset: nextIndex * rawWidth, animated: true });
      }
      setCurrentIndex(nextIndex);
    } else {
      triggerHaptic('success');
      completeOnboarding().catch(() => {});
      router.replace('/welcome');
    }
  }, [currentIndex, completeOnboarding, rawWidth, router]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    completeOnboarding().catch(() => {});
    router.replace('/welcome');
  }, [completeOnboarding, router]);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: PrimitiveTokens.color.forest[950] }]}>
      <StatusBar style="light" />

      {/* Signature Brand Landscape Background Canvas */}
      <BrandLandscapeIllustration animated />

      {/* Top Header Bar with Brand Identity and Frosted Glass Skip Action */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop:
              Platform.OS === 'android'
                ? Math.max(insets.top, RNStatusBar.currentHeight ?? 36) + 10
                : Math.max(insets.top, 20) + 8,
            paddingLeft: insets.left + (isCompact ? 18 : 24),
            paddingRight: insets.right + (isCompact ? 18 : 24),
          },
        ]}>
        <BrandLogo size="sm" tone="dark" layout="horizontal" />
        {!isLastSlide ? (
          <Pressable
            onPress={handleSkip}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed,
            ]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.topBarPlaceholder} />
        )}
      </View>

      {/* Main Swipeable Carousel */}
      <Animated.FlatList
        ref={flatListRef as any}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialNumToRender={3}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: rawWidth,
          offset: rawWidth * index,
          index,
        })}
        style={styles.carouselList}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width: rawWidth }]}>
            {/* Seamless Transparent Artwork Floating Directly on Landscape Canvas */}
            <View style={styles.illustrationWrapper}>
              {item.illustration(illustrationWidth, illustrationHeight)}
            </View>

            {/* Clean Typography */}
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.slideTitle,
                  isCompact && styles.slideTitleCompact,
                ]}>
                {item.title}
              </Text>

              <Text
                style={[
                  styles.slideDescription,
                  isCompact && styles.slideDescriptionCompact,
                ]}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Docked Section: Sunrise Amber Expanding Dots + Pill CTA */}
      <View
        style={[
          styles.bottomControls,
          {
            maxWidth: isTablet ? 420 : 380,
            paddingBottom: Math.max(insets.bottom + 12, 24),
            paddingLeft: insets.left + (isCompact ? 20 : 24),
            paddingRight: insets.right + (isCompact ? 20 : 24),
          },
        ]}>
        {/* Smooth Animated Expanding Pill Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, index) => (
            <AnimatedDot
              key={index}
              index={index}
              scrollX={scrollX}
              width={rawWidth}
            />
          ))}
        </View>

        {/* Design System 48px Sunrise Amber Pill Button */}
        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="md"
          pill
          fullWidth
          icon={
            <Ionicons
              name={isLastSlide ? 'sparkles' : 'arrow-forward'}
              size={18}
              color={SemanticDarkTokens.color.action.primary.fg}
            />
          }
          iconPosition="right"
          style={styles.pillButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    minHeight: 44,
  },
  topBarPlaceholder: {
    width: 60,
  },
  skipButton: {
    paddingVertical: 7,
    paddingHorizontal: PrimitiveTokens.space[4],
    borderRadius: LayoutTokens.radius.button,
    backgroundColor: SemanticDarkTokens.color.action.secondary.bg,
    borderWidth: 1,
    borderColor: SemanticDarkTokens.color.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonPressed: {
    backgroundColor: SemanticDarkTokens.color.action.secondary.pressed,
    transform: [{ scale: 0.97 }],
  },
  skipText: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontSize: TypographyScale.caption.fontSize,
    fontWeight: TypographyScale.caption.fontWeight,
    letterSpacing: -0.1,
    color: ComponentTokens.brandLandscape.trail,
  },
  carouselList: {
    flex: 1,
    zIndex: 10,
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
    marginTop: PrimitiveTokens.space[2],
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
    paddingHorizontal: PrimitiveTokens.space[3],
  },
  slideTitle: {
    fontFamily: TypographyScale.h2.fontFamily,
    fontSize: TypographyScale.h2.fontSize,
    fontWeight: TypographyScale.h2.fontWeight,
    textAlign: 'center',
    letterSpacing: TypographyScale.h2.letterSpacing,
    lineHeight: TypographyScale.h2.lineHeight,
    color: SemanticDarkTokens.color.text.primary,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideTitleCompact: {
    fontFamily: TypographyScale.h3.fontFamily,
    fontSize: TypographyScale.h3.fontSize,
    lineHeight: TypographyScale.h3.lineHeight,
    marginBottom: PrimitiveTokens.space[2],
  },
  slideDescription: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: TypographyScale.body.fontSize,
    lineHeight: TypographyScale.body.lineHeight,
    textAlign: 'center',
    letterSpacing: -0.1,
    color: SemanticDarkTokens.color.text.secondary,
    maxWidth: 310,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slideDescriptionCompact: {
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontSize: TypographyScale.bodySm.fontSize,
    lineHeight: TypographyScale.bodySm.lineHeight,
  },
  bottomControls: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space[2],
    height: 14,
  },
  dotBase: {
    height: PrimitiveTokens.space[2],
    borderRadius: PrimitiveTokens.space[1],
    backgroundColor: PrimitiveTokens.color.amber[400],
    shadowColor: PrimitiveTokens.color.amber[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
    elevation: 3,
  },
  pillButton: {
    height: ComponentTokens.button.heightMd,
    borderRadius: ComponentTokens.button.heightMd / 2,
  },
});
