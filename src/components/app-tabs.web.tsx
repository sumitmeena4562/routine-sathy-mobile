import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="calendar-outline" activeIcon="calendar">
              Routine
            </TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="color-palette-outline" activeIcon="color-palette">
              Design System
            </TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  activeIcon,
  ...props
}: TabTriggerSlotProps & { icon?: any; activeIcon?: any }) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          {
            backgroundColor: isFocused
              ? theme.colors.primaryMuted
              : 'transparent',
            borderRadius: theme.radius.md,
          },
        ]}>
        {icon && (
          <Ionicons
            name={isFocused ? activeIcon ?? icon : icon}
            size={16}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
        )}
        <ThemedText
          type="smallBold"
          style={{
            color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
          }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();

  return (
    <View style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.thin,
            borderRadius: theme.radius.xl,
            maxWidth: theme.spacing['6xl'] * 10,
          },
          theme.shadows.md,
        ]}>
        <View style={styles.brandRow}>
          <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          <ThemedText type="smallBold" style={[styles.brandText, { color: theme.colors.text }]}>
            Routine Sathy
          </ThemedText>
        </View>

        <View style={styles.tabTriggerGroup}>{props.children}</View>

        <Pressable
          onPress={theme.toggleTheme}
          style={({ pressed }) => [
            styles.themeToggleBtn,
            {
              backgroundColor: theme.colors.backgroundElement,
              borderRadius: theme.radius.full,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Ionicons
            name={theme.isDark ? 'sunny' : 'moon'}
            size={16}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    letterSpacing: -0.2,
  },
  tabTriggerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
