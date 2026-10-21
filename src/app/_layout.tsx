import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { RoutineThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const theme = useTheme();

  useEffect(() => {
    // Dismiss native static splash screen smoothly
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Map centralized tokens to React Navigation Theme
  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
    fonts: theme.isDark ? DarkTheme.fonts : DefaultTheme.fonts,
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <RoutineThemeProvider>
      <RootNavigator />
    </RoutineThemeProvider>
  );
}
