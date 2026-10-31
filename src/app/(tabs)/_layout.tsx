import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { triggerHaptic } from '@/utils/haptics';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function FloatingIslandTabBar({ state, descriptors, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const isTablet = windowWidth >= 768;
  const capsuleWidth = isTablet ? 420 : Math.min(windowWidth - 36, 380);

  // Elevation distance above phone gesture / home indicator
  const bottomOffset = Math.max(insets.bottom, 10) + (Platform.OS === 'ios' ? 4 : 8);

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

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View
        style={[
          styles.capsule,
          {
            width: capsuleWidth,
            backgroundColor: theme.isDark
              ? 'rgba(7, 38, 27, 0.94)'
              : 'rgba(255, 255, 255, 0.96)',
            borderColor: theme.isDark
              ? 'rgba(207, 227, 214, 0.16)'
              : 'rgba(223, 231, 225, 0.90)',
            shadowOpacity: theme.isDark ? 0.35 : 0.08,
          },
        ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title || route.name
              : options.title !== undefined
              ? options.title
              : route.name;

          let iconName: keyof typeof Ionicons.glyphMap = 'sunny';
          if (route.name === 'today') {
            iconName = isFocused ? 'sunny' : 'sunny-outline';
          } else if (route.name === 'stats') {
            iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

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
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || `${label} Tab`}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && [
                  styles.tabItemActive,
                  {
                    backgroundColor: activeBg,
                    borderColor: activeBorder,
                  },
                ],
                pressed && { opacity: 0.8 },
              ]}>
              <Ionicons
                name={iconName}
                size={isFocused ? 19 : 21}
                color={isFocused ? activeIconColor : inactiveIconColor}
              />
              {isFocused && (
                <Text
                  style={[
                    styles.tabLabelActive,
                    {
                      color: activeIconColor,
                    },
                  ]}
                  numberOfLines={1}>
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="today"
      tabBar={(props) => <FloatingIslandTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Progress',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
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
    height: 60,
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PrimitiveTokens.space[2],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    height: 44,
    borderRadius: PrimitiveTokens.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PrimitiveTokens.space['1_5'],
    paddingHorizontal: PrimitiveTokens.space[2],
  },
  tabItemActive: {
    flex: 1.35,
    borderWidth: 1,
  },
  tabLabelActive: {
    fontSize: TypographyScale.caption.fontSize,
    fontFamily: TypographyScale.caption.fontFamily,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
