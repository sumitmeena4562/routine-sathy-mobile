import React from 'react';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
} from 'react-native-svg';

export interface IllustrationProps {
  width?: number;
  height?: number;
  tone?: 'light' | 'dark';
}

/**
 * DawnAwakeningIllustration
 * Style: Clean modern line-art vector with warm orange/amber accent fills,
 * matching the character-and-mobile lifestyle aesthetic.
 * Supports both light mode and dark forest brand tone.
 */
export function DawnAwakeningIllustration({
  width = 300,
  height = 240,
  tone = 'dark',
}: IllustrationProps) {
  const isDark = tone === 'dark';
  const strokeColor = isDark ? '#FFFFFF' : '#0F172A';
  const secondaryStroke = isDark ? 'rgba(255, 255, 255, 0.4)' : '#CBD5E1';
  const groundStroke = isDark ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0';
  const phoneFill = isDark ? 'rgba(14, 73, 51, 0.85)' : '#FFFFFF';
  const hairFill = isDark ? '#FFFFFF' : '#0F172A';
  const shoesFill = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      {/* 1. Background Soft Dawn Ground & Hills */}
      <Path
        d="M 20 220 Q 90 200 160 215 T 300 215"
        stroke={groundStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M 50 220 L 270 220"
        stroke={secondaryStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 2. Morning Sun Rays */}
      <G opacity={isDark ? 0.95 : 0.8}>
        <Circle cx="80" cy="90" r="28" fill="#FFEDD5" />
        <Circle cx="80" cy="90" r="20" fill="#FED7AA" />
        {/* Sunbeams */}
        <Path d="M 80 52 L 80 44" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 112 68 L 118 62" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 124 90 L 132 90" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 48 68 L 42 62" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 36 90 L 28 90" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
      </G>

      {/* 3. Soft Green Morning Foliage & Plants */}
      <Path
        d="M 60 220 C 50 190, 70 170, 75 220"
        fill="#CCFBF1"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M 72 220 C 80 180, 95 195, 90 220"
        fill="#99F6E4"
        stroke="#0D9488"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 4. Lifestyle Phone with Morning Routine Checkmark Path */}
      <G transform="translate(195, 45)">
        {/* Phone Frame */}
        <Rect
          x="0"
          y="0"
          width="74"
          height="124"
          rx="14"
          fill={phoneFill}
          stroke={strokeColor}
          strokeWidth="2.5"
        />
        {/* Screen Bezel Notch / Speaker */}
        <Rect x="25" y="8" width="24" height="3" rx="1.5" fill={secondaryStroke} />

        {/* Routine Path Dots & Milestone Markers */}
        <Path
          d="M 22 95 Q 48 70 26 48 T 52 26"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Checkpoint Pin */}
        <Circle cx="52" cy="26" r="7" fill="#FBBF24" />
        <Circle cx="52" cy="26" r="3" fill="#0B3D2E" />

        {/* Small Progress Pill on Phone */}
        <Rect x="14" y="98" width="46" height="12" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
        <Circle cx="22" cy="104" r="3" fill="#F59E0B" />
        <Rect x="29" y="102" width="22" height="4" rx="2" fill="#F59E0B" />
      </G>

      {/* 5. Main Character - Mindful Morning Walker / Stretcher */}
      <G transform="translate(100, 50)">
        {/* Backpack */}
        <Path
          d="M 26 65 Q 12 70 16 95 Q 22 110 32 105 Z"
          fill="#FED7AA"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Rolled Mat on Backpack */}
        <Rect
          x="12"
          y="60"
          width="18"
          height="10"
          rx="5"
          fill="#F97316"
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Head & Hair */}
        <Circle cx="52" cy="25" r="13" fill="#FFE4E6" stroke={strokeColor} strokeWidth="2.5" />
        {/* Hair cap */}
        <Path
          d="M 40 22 C 40 12, 58 12, 63 18 C 65 24, 60 26, 56 22 C 50 20, 44 26, 40 22 Z"
          fill={hairFill}
        />

        {/* Orange Jacket Torso */}
        <Path
          d="M 36 45 L 68 45 L 64 95 L 34 95 Z"
          fill="#F97316"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Jacket Collar */}
        <Path d="M 46 45 L 52 56 L 58 45" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Left Arm holding Morning Journal/Map */}
        <Path
          d="M 64 52 L 82 58 L 86 78"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Journal in hand */}
        <Rect
          x="82"
          y="56"
          width="18"
          height="26"
          rx="3"
          transform="rotate(15 82 56)"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="2"
        />
        <Path d="M 88 64 L 98 67" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <Path d="M 89 71 L 96 73" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

        {/* Legs & Pants */}
        {/* Left Leg Walking Forward */}
        <Path
          d="M 40 95 L 34 135 L 24 160"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left Shoe */}
        <Path
          d="M 22 160 C 12 160, 10 168, 28 168 L 34 168 C 36 164, 30 160, 24 160 Z"
          fill={shoesFill}
        />

        {/* Right Leg Stepping */}
        <Path
          d="M 58 95 L 64 130 L 74 158"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Shoe */}
        <Path
          d="M 70 158 C 76 158, 86 162, 86 168 L 68 168 C 66 164, 68 158, 70 158 Z"
          fill={shoesFill}
        />
      </G>

      {/* 6. Foreground Clean Trees & Plants */}
      <G transform="translate(255, 140)">
        <Path d="M 12 80 L 12 30" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx="12" cy="24" r="16" fill="#99F6E4" stroke="#0D9488" strokeWidth="2" />
        <Circle cx="24" cy="40" r="11" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
        <Circle cx="2" cy="45" r="9" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      </G>
    </Svg>
  );
}
