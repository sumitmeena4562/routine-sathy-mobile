import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  AnimationTokens,
  BorderWidth,
  Colors,
  ComponentHeights,
  GlassTokens,
  Radius,
  Shadows,
  Spacing,
  ThemeBundle,
  ThemeColors,
  ThemeMode,
  Typography,
} from '@/constants/theme';

export type UserThemePreference = 'system' | 'light' | 'dark';

export interface ThemeContextValue extends ThemeBundle {
  preference: UserThemePreference;
  setPreference: (pref: UserThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface RoutineThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: UserThemePreference;
}

export function RoutineThemeProvider({
  children,
  initialPreference = 'light',
}: RoutineThemeProviderProps) {
  const [preference, setPreference] = useState<UserThemePreference>(initialPreference);

  // Default theme is pure white ('light') per user requirements
  const resolvedMode: ThemeMode = useMemo(() => {
    if (preference === 'system') {
      return 'light';
    }
    return preference;
  }, [preference]);

  const isDark = resolvedMode === 'dark';
  const activeColors: ThemeColors = Colors[resolvedMode];

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return isDark ? 'light' : 'dark';
    });
  }, [isDark]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      mode: resolvedMode,
      isDark,
      preference,
      setPreference,
      toggleTheme,
      colors: activeColors,
      typography: Typography,
      spacing: Spacing,
      radius: Radius,
      borderWidth: BorderWidth,
      shadows: Shadows,
      heights: ComponentHeights,
      glass: GlassTokens,
      animation: AnimationTokens,
    }),
    [resolvedMode, isDark, preference, toggleTheme, activeColors]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider (e.g. during isolated unit tests)
    const fallbackMode: ThemeMode = 'light';
    return {
      mode: fallbackMode,
      isDark: false,
      preference: 'system',
      setPreference: () => {},
      toggleTheme: () => {},
      colors: Colors[fallbackMode],
      typography: Typography,
      spacing: Spacing,
      radius: Radius,
      borderWidth: BorderWidth,
      shadows: Shadows,
      heights: ComponentHeights,
      glass: GlassTokens,
      animation: AnimationTokens,
    };
  }
  return context;
}
