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
  size = 52,
}: RoutineSathyEmblemProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        {/* Core Luminous Dawn Lotus Gradient */}
        <LinearGradient id="emblemDawn" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="60%" stopColor="#F5F3FF" stopOpacity="0.98" />
          <Stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.92" />
        </LinearGradient>

        {/* Circadian Rhythm Arc Specular Stroke */}
        <LinearGradient id="emblemRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <Stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.30" />
        </LinearGradient>
      </Defs>

      {/* 1. Outer Circadian Rhythm Flow Arcs (The Continuous Daily Habit Loop) */}
      <Path
        d="M 50 14 C 70 14, 86 30, 86 50 C 86 64, 78 76, 66 82"
        stroke="url(#emblemRing)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M 50 86 C 30 86, 14 70, 14 50 C 14 36, 22 24, 34 18"
        stroke="url(#emblemRing)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 2. Four Sacred Habit Quadrants (Morning Dawn, Focus Midday, Evening Unwind, Rest) */}
      <Circle cx="50" cy="14" r="3.5" fill="#FFFFFF" />
      <Circle cx="86" cy="50" r="3" fill="#FFFFFF" fillOpacity="0.85" />
      <Circle cx="50" cy="86" r="3.5" fill="#FFFFFF" />
      <Circle cx="14" cy="50" r="3" fill="#FFFFFF" fillOpacity="0.85" />

      {/* 3. Center Mindful Sathy Lotus & Sacred Awakening Sun */}
      {/* Central Ascending Dawn Petal */}
      <Path
        d="M 50 26 C 44 39, 43 49, 50 63 C 57 49, 56 39, 50 26 Z"
        fill="url(#emblemDawn)"
      />

      {/* Left Awakening Petal */}
      <Path
        d="M 50 63 C 40 56, 32 49, 30 42 C 29 37, 33 34, 38 36 C 44 39, 48 48, 50 63 Z"
        fill="url(#emblemDawn)"
        fillOpacity="0.92"
      />

      {/* Right Awakening Petal */}
      <Path
        d="M 50 63 C 60 56, 68 49, 70 42 C 71 37, 67 34, 62 36 C 56 39, 52 48, 50 63 Z"
        fill="url(#emblemDawn)"
        fillOpacity="0.92"
      />

      {/* Radiant Central Awakening Core (Sacred Inner Spark) */}
      <Circle cx="50" cy="53" r="3.5" fill="#FFFFFF" />
      <Circle cx="50" cy="53" r="7" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.45" />
    </Svg>
  );
}
