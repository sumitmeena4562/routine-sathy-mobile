import React from 'react';
import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="today"
      tabBar={(props) => <FloatingTabBar {...props} />}
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
