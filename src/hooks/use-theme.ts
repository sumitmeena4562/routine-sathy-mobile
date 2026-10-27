import { useThemeContext } from '@/context/ThemeContext';

/**
 * Hook to access the current design system theme tokens and controls.
 *
 * Provides direct access to active semantic colors (e.g. `theme.primary`, `theme.background`),
 * as well as structured token groups (`colors`, `typography`, `spacing`, `radius`, `shadows`)
 * and theme toggles (`isDark`, `mode`, `toggleTheme`, `setPreference`).
 */
export function useTheme() {
  const context = useThemeContext();

  return {
    ...context.colors, // Direct color access for backwards compatibility (e.g. theme.background)
    colors: context.colors,
    typography: context.typography,
    spacing: context.spacing,
    radius: context.radius,
    borderWidth: context.borderWidth,
    shadows: context.shadows,
    heights: context.heights,
    glass: context.glass,
    animation: context.animation,
    isDark: context.isDark,
    mode: context.mode,
    preference: context.preference,
    setPreference: context.setPreference,
    toggleTheme: context.toggleTheme,
  };
}

export type Theme = ReturnType<typeof useTheme>;
