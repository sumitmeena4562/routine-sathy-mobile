import React from 'react';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
} from 'react-native-svg';

import { IllustrationProps } from './DawnAwakeningIllustration';

export function DeepFocusIllustration({ width = 300, height = 240 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      {/* 1. Ground & Floor Line */}
      <Path
        d="M 30 220 L 290 220"
        stroke="#E2E8F0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* 2. Floating Focus Rhythm Clock / Timer on Wall */}
      <G transform="translate(60, 45)">
        <Circle cx="32" cy="32" r="28" fill="#FFEDD5" stroke="#F97316" strokeWidth="2" />
        <Circle cx="32" cy="32" r="22" stroke="#FED7AA" strokeWidth="2" strokeDasharray="3 3" />
        {/* Clock Hands at 10:10 */}
        <Path d="M 32 32 L 32 18" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 32 32 L 42 36" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx="32" cy="32" r="3" fill="#F97316" />
      </G>

      {/* 3. Modern Desk Setup */}
      {/* Wooden Desk Surface */}
      <Rect
        x="60"
        y="155"
        width="200"
        height="12"
        rx="4"
        fill="#FED7AA"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      {/* Desk Legs */}
      <Path d="M 80 167 L 76 220" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <Path d="M 240 167 L 244 220" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

      {/* Steaming Mug on Desk */}
      <Rect x="88" y="142" width="14" height="13" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
      <Path d="M 102 145 C 106 145, 106 151, 102 151" stroke="#0F172A" strokeWidth="2" />
      {/* Steam lines */}
      <Path d="M 92 135 Q 96 130 92 125" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 97 137 Q 100 133 97 129" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />

      {/* Potted Plant */}
      <G transform="translate(230, 115)">
        {/* Pot */}
        <Path d="M 6 28 L 22 28 L 20 40 L 8 40 Z" fill="#FED7AA" stroke="#0F172A" strokeWidth="2" />
        {/* Leaves */}
        <Path d="M 14 28 C 6 20, 2 12, 12 10 C 16 18, 14 26, 14 28" fill="#99F6E4" stroke="#0D9488" strokeWidth="2" />
        <Path d="M 14 28 C 22 20, 26 14, 18 10 C 14 18, 14 26, 14 28" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      </G>

      {/* Modern Laptop on Desk */}
      <G transform="translate(130, 115)">
        {/* Laptop Screen */}
        <Rect
          x="6"
          y="6"
          width="50"
          height="34"
          rx="4"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="2.5"
        />
        {/* Screen Content - Routine Progress Bars */}
        <Rect x="12" y="14" width="22" height="4" rx="2" fill="#F97316" />
        <Rect x="12" y="22" width="34" height="3" rx="1.5" fill="#E2E8F0" />
        <Rect x="12" y="28" width="26" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Laptop Base */}
        <Path d="M 0 40 L 62 40 L 58 43 L 4 43 Z" fill="#0F172A" />
      </G>

      {/* Character Focused at Desk */}
      <G transform="translate(145, 60)">
        {/* Head */}
        <Circle cx="30" cy="22" r="13" fill="#FFE4E6" stroke="#0F172A" strokeWidth="2.5" />
        {/* Hair */}
        <Path
          d="M 18 20 C 18 10, 36 10, 42 16 C 44 22, 38 24, 34 20 C 28 18, 22 24, 18 20 Z"
          fill="#0F172A"
        />

        {/* Orange Sweater Torso */}
        <Path
          d="M 16 42 L 44 42 L 46 95 L 14 95 Z"
          fill="#F97316"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Arm typing on keyboard */}
        <Path
          d="M 22 50 L 8 75 L 0 78"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Ergonomic Chair */}
      <G transform="translate(180, 105)">
        {/* Backrest */}
        <Rect x="8" y="0" width="10" height="42" rx="5" fill="#0F172A" />
        {/* Seat */}
        <Rect x="0" y="42" width="32" height="8" rx="4" fill="#0F172A" />
        {/* Chair Pole & Base */}
        <Path d="M 16 50 L 16 75" stroke="#0F172A" strokeWidth="3" />
        <Path d="M 6 75 L 26 75" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
