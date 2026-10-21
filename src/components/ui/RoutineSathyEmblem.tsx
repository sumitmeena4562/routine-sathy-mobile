import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

export interface RoutineSathyEmblemProps {
  size?: number;
  color?: string;
  glow?: boolean;
}

/**
 * RoutineSathyEmblem - The Official Brand Insignia for Routine Sathy.
 *
 * Visual Concept:
 * 1. The Circadian Rhythm Arcs (Two interlocking sacred crescent curves representing
 *    the daily cycle: Morning dawn to restorative night - the eternal Habit Loop).
 * 2. The Inner Sathy Lotus Flame (A pure ascending lotus/dawn spark at the center,
 *    symbolizing mindfulness, inner truth "Sathy", and sacred presence).
 * 3. Sacred Geometry: Clean, harmonious circular proportions with soft rounded caps.
 */
export function RoutineSathyEmblem({
  size = 42,
}: RoutineSathyEmblemProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        {/* Core Dawn Gradient */}
        <LinearGradient id="emblemDawn" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="50%" stopColor="#EDE9FE" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.9" />
        </LinearGradient>

        {/* Outer Ring Ambient Accent */}
        <LinearGradient id="emblemRing" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      {/* 1. Outer Circadian Rhythm Flow Arc (The Habit Loop / Continuous Cycle) */}
      <Path
        d="M 50 14 C 70 14, 86 30, 86 50 C 86 64, 78 76, 66 82"
        stroke="url(#emblemRing)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Path
        d="M 50 86 C 30 86, 14 70, 14 50 C 14 36, 22 24, 34 18"
        stroke="url(#emblemRing)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 2. Micro Rhythm Orbit Dots (Representing 4 Sacred Habit Quadrants) */}
      <Circle cx="50" cy="14" r="3" fill="#FFFFFF" />
      <Circle cx="86" cy="50" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />
      <Circle cx="50" cy="86" r="3" fill="#FFFFFF" />
      <Circle cx="14" cy="50" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />

      {/* 3. Center Mindful Sathy Lotus & Sacred Sun (Inner Truth & Awakening) */}
      {/* Central Ascending Lotus Petal */}
      <Path
        d="M 50 28 C 45 40, 43 49, 50 64 C 57 49, 55 40, 50 28 Z"
        fill="url(#emblemDawn)"
      />

      {/* Left Mindful Petal */}
      <Path
        d="M 50 64 C 41 57, 33 50, 31 43 C 30 38, 34 35, 38 37 C 44 40, 48 48, 50 64 Z"
        fill="url(#emblemDawn)"
        fillOpacity="0.9"
      />

      {/* Right Mindful Petal */}
      <Path
        d="M 50 64 C 59 57, 67 50, 69 43 C 70 38, 66 35, 62 37 C 56 40, 52 48, 50 64 Z"
        fill="url(#emblemDawn)"
        fillOpacity="0.9"
      />

      {/* Radiant Central Awakening Core (Sacred Spark) */}
      <Circle cx="50" cy="54" r="3.5" fill="#FFFFFF" />
      <Circle cx="50" cy="54" r="6" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
    </Svg>
  );
}
