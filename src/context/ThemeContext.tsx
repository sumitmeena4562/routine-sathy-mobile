import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

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
import { Storage } from '@/utils/storage';

export type UserThemePreference = 'system' | 'light' | 'dark';

export interface ThemeContextValue extends ThemeBundle {
  preference: UserThemePreference;
  setPreference: (pref: UserThemePreference) => void;
  toggleTheme: () => void;
}

const THEME_PREF_STORAGE_KEY = 'routine_sathy_theme_preference_v1';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface RoutineThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: UserThemePreference;
}

export function RoutineThemeProvider({
  children,
  initialPreference = 'light',
}: RoutineThemeProviderProps) {
  const [preference, setPreferenceState] = useState<UserThemePreference>(initialPreference);
  const systemScheme = useRNColorScheme();

  // Load saved preference from storage
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const saved = await Storage.getItem(THEME_PREF_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      } catch {
        // Fallback to default
      }
    }
    loadThemePreference();
  }, []);

  const setPreference = useCallback((pref: UserThemePreference) => {
    setPreferenceState(pref);
    Storage.setItem(THEME_PREF_STORAGE_KEY, pref).catch(() => {});
  }, []);

  // Determine active mode
  const resolvedMode: ThemeMode = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const isDark = resolvedMode === 'dark';
  const activeColors: ThemeColors = Colors[resolvedMode];

  const toggleTheme = useCallback(() => {
    const nextPref: UserThemePreference = isDark ? 'light' : 'dark';
    setPreference(nextPref);
  }, [isDark, setPreference]);

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
    [resolvedMode, isDark, preference, setPreference, toggleTheme, activeColors]
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
