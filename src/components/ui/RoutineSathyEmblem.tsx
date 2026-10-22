import React from 'react';
import Svg, {
  Circle,
  Path,
} from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export interface RoutineSathyEmblemProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * RoutineSathyEmblem - The Official Brand Insignia for Routine Sathy.
 *
 * 1. The Circadian Rhythm Arcs (Two interlocking curves representing the eternal Habit Loop).
 * 2. The Inner Sathy Lotus (Ascending dawn lotus petal at center, symbolizing mindfulness).
 * 3. Warm Sunrise Anchor Dots (#F97316).
 */
export function RoutineSathyEmblem({
  size = 52,
  primaryColor,
  accentColor,
}: RoutineSathyEmblemProps) {
  const theme = useTheme();

  const primary = primaryColor ?? theme.colors.primary;
  const accent = accentColor ?? theme.colors.secondary;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 1. Outer Circadian Rhythm Flow Arcs */}
      <Path
        d="M 50 14 C 70 14, 86 30, 86 50 C 86 64, 78 76, 66 82"
        stroke={primary}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Path
        d="M 50 86 C 30 86, 14 70, 14 50 C 14 36, 22 24, 34 18"
        stroke={primary}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 2. Four Sacred Habit Quadrants */}
      <Circle cx="50" cy="14" r="3.5" fill={accent} />
      <Circle cx="86" cy="50" r="3" fill={accent} />
      <Circle cx="50" cy="86" r="3.5" fill={accent} />
      <Circle cx="14" cy="50" r="3" fill={accent} />

      {/* 3. Center Mindful Sathy Lotus */}
      {/* Central Ascending Dawn Petal */}
      <Path
        d="M 50 26 C 44 39, 43 49, 50 63 C 57 49, 56 39, 50 26 Z"
        fill={primary}
      />

      {/* Left Awakening Petal */}
      <Path
        d="M 50 63 C 40 56, 32 49, 30 42 C 29 37, 33 34, 38 36 C 44 39, 48 48, 50 63 Z"
        fill={primary}
        fillOpacity="0.85"
      />

      {/* Right Awakening Petal */}
      <Path
        d="M 50 63 C 60 56, 68 49, 70 42 C 71 37, 67 34, 62 36 C 56 39, 52 48, 50 63 Z"
        fill={primary}
        fillOpacity="0.85"
      />

      {/* Radiant Central Awakening Core */}
      <Circle cx="50" cy="53" r="3" fill={accent} />
    </Svg>
  );
}
