import React, { useEffect } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { RoutineSathyEmblem, RoutineSathyEmblemProps } from './RoutineSathyEmblem';
import { ComponentTokens, PrimitiveTokens } from '@/theme/tokens.generated';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'heroLg';
  layout?: 'horizontal' | 'vertical';
  tone?: 'light' | 'dark';
  withTile?: boolean;
  withTagline?: boolean;
  taglineText?: string;
  taglineCasing?: 'uppercase' | 'normal';
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  sm: { emblem: 28, title: 18, tag: 9, gap: 8 },
  md: { emblem: 40, title: 24, tag: 11, gap: 10 },
  lg: { emblem: 56, title: 32, tag: 12, gap: 12 },
  xl: { emblem: 72, title: 38, tag: 13, gap: 14 },
  hero: { emblem: 82, title: 29, tag: 13.5, gap: 14 },
  heroLg: { emblem: 94, title: 34, tag: 15, gap: 16 },
};

const brandTokens = ComponentTokens.brandLandscape;

/**
 * BrandLogo - Routine Sathy Central Brand Component
 * Combines the emblem insignia with crisp, responsive brand typography.
 * Reusable across Splash, Welcome, Auth headers, drawer, and modals.
 */
export function BrandLogo({
  size = 'md',
  layout = 'horizontal',
  tone = 'light',
  withTile = false,
  withTagline = false,
  taglineText = 'Small Steps • Big Changes',
  taglineCasing = 'normal',
  animated = false,
  style,
}: BrandLogoProps) {
  const config = SIZES[size] || SIZES.md;
  const isDark = tone === 'dark';

  const primaryTextColor = isDark ? '#FFFFFF' : '#0B3D2E';
  const accentTextColor = isDark ? brandTokens.brandMint : '#16A34A';
  const taglineColor = isDark ? '#E8F5EC' : 'rgba(11, 61, 46, 0.65)';

  const emblemTone: RoutineSathyEmblemProps['tone'] = isDark && !withTile ? 'white' : 'color';
  const isVertical = layout === 'vertical';

  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animated, scale]);

  const animatedEmblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animated ? scale.value : 1 }],
  }));

  return (
    <View
      style={[
        styles.container,
        isVertical ? styles.verticalContainer : styles.horizontalContainer,
        { gap: config.gap },
        style,
      ]}>
      {/* Insignia Emblem (Animated or Static) */}
      <Animated.View style={[styles.emblemWrapper, animatedEmblemStyle]}>
        <RoutineSathyEmblem
          size={config.emblem}
          tone={emblemTone}
          withTile={withTile}
        />
      </Animated.View>

      {/* Brand Typography Block */}
      <View style={[styles.textBlock, isVertical && styles.textBlockCentered]}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.wordRoutine,
              { fontSize: config.title, color: primaryTextColor },
            ]}>
            Routine{' '}
          </Text>
          <Text
            style={[
              styles.wordSathy,
              { fontSize: config.title, color: accentTextColor },
            ]}>
            Sathy
          </Text>
        </View>

        {withTagline && (
          <Text
            style={[
              styles.tagline,
              {
                fontSize: config.tag,
                color: taglineColor,
                opacity: isDark ? 0.88 : 1,
                textTransform: taglineCasing === 'uppercase' ? 'uppercase' : 'none',
                letterSpacing: taglineCasing === 'uppercase' ? 1.5 : 0.6,
              },
              isVertical && styles.taglineCentered,
            ]}>
            {taglineText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  verticalContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    justifyContent: 'center',
  },
  textBlockCentered: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordRoutine: {
    fontFamily: PrimitiveTokens.font.family.extrabold,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  wordSathy: {
    fontFamily: PrimitiveTokens.font.family.extrabold,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: PrimitiveTokens.font.family.semibold,
    fontWeight: '600',
    marginTop: 4,
  },
  taglineCentered: {
    textAlign: 'center',
  },
});
