import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { triggerHaptic } from '@/utils/haptics';

export type TabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

export interface FloatingTabBarProps extends TabBarProps {
  style?: StyleProp<ViewStyle>;
  capsuleWidth?: number;
}

const CAPSULE_HEIGHT = 58;
const CAPSULE_PAD_H = 6;
const CAPSULE_PAD_V = 6;

function getDefaultIconName(
  routeName: string,
  isFocused: boolean
): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case 'today':
      return isFocused ? 'sunny' : 'sunny-outline';
    case 'stats':
      return isFocused ? 'stats-chart' : 'stats-chart-outline';
    case 'profile':
      return isFocused ? 'person' : 'person-outline';
    default:
      return isFocused ? 'ellipse' : 'ellipse-outline';
  }
}

interface TabItemProps {
  route: TabBarProps['state']['routes'][0];
  isFocused: boolean;
  options: TabBarProps['descriptors'][string]['options'];
  onPress: () => void;
  onLongPress: () => void;
  activeColor: string;
  inactiveColor: string;
}

function TabItem({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  activeColor,
  inactiveColor,
}: TabItemProps) {
  const iconScale = useSharedValue(1);

  // Gentle micro-bounce when tab becomes active
  useEffect(() => {
    if (isFocused) {
      iconScale.value = withSequence(
        withTiming(1.16, { duration: 110 }),
        withSpring(1, { damping: 14, stiffness: 220 })
      );
    } else {
      iconScale.value = withTiming(1, { duration: 120 });
    }
  }, [isFocused, iconScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const label =
    options.tabBarLabel !== undefined
      ? typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : options.title || route.name
      : options.title !== undefined
      ? options.title
      : route.name;

  const iconName = getDefaultIconName(route.name, isFocused);
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel || `${label} Tab`}
      testID={`tab-${route.name}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tabItem,
        {
          transform: [{ scale: pressed ? 0.94 : 1 }],
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.tabItemInner}>
        <Animated.View style={animatedIconStyle}>
          {options.tabBarIcon ? (
            options.tabBarIcon({
              focused: isFocused,
              color,
              size: 19,
            })
          ) : (
            <Ionicons name={iconName} size={19} color={color} />
          )}
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            {
              color,
              fontFamily: isFocused
                ? 'PlusJakartaSans_700Bold'
                : TypographyScale.caption.fontFamily,
              fontWeight: isFocused ? '700' : '500',
              opacity: isFocused ? 1 : 0.76,
            },
          ]}
          numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  style,
  capsuleWidth: customCapsuleWidth,
}: FloatingTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const initialWidth =
    customCapsuleWidth ?? (isTablet ? 420 : Math.min(windowWidth - 32, 380));
  const [capsuleWidth, setCapsuleWidth] = useState(initialWidth);

  // Total horizontal space available for tabs inside the capsule
  const innerWidth = Math.max(0, capsuleWidth - CAPSULE_PAD_H * 2);
  const routeCount = Math.max(state.routes.length, 1);
  const tabWidth = innerWidth / routeCount;

  // Horizontal translation shared value for active pill indicator
  const translateX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(state.index * tabWidth, {
        damping: 20,
        stiffness: 200,
        mass: 0.7,
      });
    }
  }, [state.index, tabWidth, translateX]);

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - capsuleWidth) > 1) {
      setCapsuleWidth(width);
    }
  }, [capsuleWidth]);

  // Elevation distance above phone gesture / home indicator
  const bottomOffset =
    Math.max(insets.bottom, 10) + (Platform.OS === 'ios' ? 6 : 10);

  const activeIconColor = theme.isDark
    ? PrimitiveTokens.color.fern[300]
    : PrimitiveTokens.color.forest[700];

  const inactiveIconColor = theme.isDark
    ? 'rgba(207, 227, 214, 0.55)'
    : theme.colors.textMuted;

  const activeBg = theme.isDark
    ? 'rgba(30, 158, 90, 0.22)'
    : '#E3F3E9';

  const activeBorder = theme.isDark
    ? 'rgba(91, 219, 139, 0.35)'
    : PrimitiveTokens.color.fern[200];

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  const webBackdropStyle: ViewStyle =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {};

  return (
    <View
      style={[styles.floatingWrapper, { bottom: bottomOffset }, style]}
      pointerEvents="box-none">
      <View
        onLayout={onContainerLayout}
        style={[
          styles.capsule,
          webBackdropStyle,
          {
            width: initialWidth,
            backgroundColor: theme.isDark
              ? 'rgba(7, 38, 27, 0.92)'
              : 'rgba(255, 255, 255, 0.95)',
            borderColor: theme.isDark
              ? 'rgba(207, 227, 214, 0.16)'
              : 'rgba(223, 231, 225, 0.90)',
            shadowOpacity: theme.isDark ? 0.38 : 0.09,
          },
        ]}>
        {/* Native Blur Layer */}
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={Platform.OS === 'ios' ? 28 : 16}
            tint={theme.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Specular Top Rim Reflection Line */}
        <LinearGradient
          colors={[
            theme.isDark
              ? 'rgba(255, 255, 255, 0.22)'
              : 'rgba(255, 255, 255, 0.85)',
            theme.isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(255, 255, 255, 0.15)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.specularRim}
        />

        {/* Sliding Active Pill Background (Reanimated 120fps Glide) */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pillIndicator,
            {
              left: CAPSULE_PAD_H,
              top: CAPSULE_PAD_V,
              bottom: CAPSULE_PAD_V,
              backgroundColor: activeBg,
              borderColor: activeBorder,
            },
            pillAnimatedStyle,
          ]}
        />

        {/* Stable Tab Items Row */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              triggerHaptic('light');

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                isFocused={isFocused}
                options={options}
                onPress={onPress}
                onLongPress={onLongPress}
                activeColor={activeIconColor}
                inactiveColor={inactiveIconColor}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  capsule: {
    height: CAPSULE_HEIGHT,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 12,
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    zIndex: 1,
    borderRadius: PrimitiveTokens.radius.full,
  },
  pillIndicator: {
    position: 'absolute',
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    zIndex: 1,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CAPSULE_PAD_H,
    paddingVertical: CAPSULE_PAD_V,
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space['1_5'],
    paddingHorizontal: PrimitiveTokens.space[1],
  },
  tabLabel: {
    fontSize: TypographyScale.caption.fontSize,
    letterSpacing: -0.2,
  },
});
