import React from 'react';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
} from 'react-native-svg';

import { IllustrationProps } from './DawnAwakeningIllustration';

export function NightRecoveryIllustration({ width = 300, height = 240 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      {/* 1. Ground & Floor Line */}
      <Path
        d="M 30 220 L 290 220"
        stroke="#E2E8F0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* 2. Window with Night Sky & Crescent Moon */}
      <G transform="translate(45, 40)">
        {/* Window Frame */}
        <Rect
          x="0"
          y="0"
          width="76"
          height="100"
          rx="16"
          fill="#0F172A"
          stroke="#0F172A"
          strokeWidth="2.5"
        />
        {/* Crescent Moon inside window */}
        <Path
          d="M 34 26 C 26 26, 20 34, 20 44 C 20 56, 30 64, 42 64 C 48 64, 54 60, 56 56 C 44 56, 36 46, 36 34 C 36 30, 38 27, 40 26 C 38 26, 36 26, 34 26 Z"
          fill="#FDE047"
        />
        {/* Gentle Night Stars */}
        <Circle cx="56" cy="30" r="1.5" fill="#FFFFFF" />
        <Circle cx="24" cy="74" r="1.5" fill="#FFFFFF" />
        <Circle cx="52" cy="78" r="2" fill="#FED7AA" />
        <Circle cx="44" cy="20" r="1" fill="#FFFFFF" />
      </G>

      {/* 3. Nightstand with Phone Docked Screen-Down (Digital Sunset) */}
      <G transform="translate(210, 140)">
        {/* Table top */}
        <Rect x="0" y="0" width="46" height="8" rx="3" fill="#FED7AA" stroke="#0F172A" strokeWidth="2.5" />
        {/* Table Legs */}
        <Path d="M 6 8 L 4 80" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 40 8 L 42 80" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

        {/* Small Bedside Warm Lamp */}
        <Path d="M 16 0 L 26 0 L 28 -14 L 14 -14 Z" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
        <Path d="M 21 -14 L 21 -22" stroke="#0F172A" strokeWidth="2" />
        {/* Soft Warm Glow Bulb */}
        <Circle cx="21" cy="-24" r="5" fill="#FEF08A" />

        {/* Phone Docked Screen Down (Digital Sunset ritual) */}
        <Rect
          x="30"
          y="-6"
          width="12"
          height="18"
          rx="3"
          transform="rotate(20 30 -6)"
          fill="#0F172A"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
      </G>

      {/* 4. Cozy Bed & Sleeping Character */}
      <G transform="translate(100, 110)">
        {/* Headboard */}
        <Rect x="0" y="0" width="10" height="75" rx="5" fill="#0F172A" />

        {/* Pillows */}
        <Rect x="14" y="24" width="34" height="22" rx="7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />

        {/* Character Head resting peacefully on pillow */}
        <Circle cx="30" cy="32" r="11" fill="#FFE4E6" stroke="#0F172A" strokeWidth="2" />
        {/* Closed calm sleeping eye */}
        <Path d="M 28 34 Q 32 37 36 34" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Hair */}
        <Path
          d="M 20 28 C 20 20, 36 20, 40 26 C 42 30, 38 32, 34 28 C 30 26, 24 30, 20 28 Z"
          fill="#0F172A"
        />

        {/* Warm Orange Comforter / Quilt Covering Body */}
        <Path
          d="M 26 42 Q 70 34 115 42 L 120 85 L 10 85 L 10 48 Q 18 42 26 42 Z"
          fill="#F97316"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Folded Sheet Rim on Blanket */}
        <Path
          d="M 12 47 Q 40 38 75 42 L 75 48 Q 40 44 12 53 Z"
          fill="#FED7AA"
          stroke="#0F172A"
          strokeWidth="1.5"
        />

        {/* Bed Base & Legs */}
        <Rect x="6" y="85" width="118" height="10" rx="3" fill="#0F172A" />
        <Path d="M 16 95 L 16 110" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 114 95 L 114 110" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      </G>

      {/* Floating Gentle Zzz / Dream Stars */}
      <G transform="translate(160, 75)">
        <Circle cx="8" cy="18" r="3" fill="#F97316" opacity="0.6" />
        <Circle cx="18" cy="8" r="4.5" fill="#F97316" opacity="0.75" />
        <Circle cx="32" cy="0" r="6" fill="#F97316" opacity="0.9" />
      </G>
    </Svg>
  );
}
