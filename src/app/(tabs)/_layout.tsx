import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="today"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.borderSubtle,
            height: (Platform.OS === 'ios' ? 54 : 60) + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sunny' : 'sunny-outline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
