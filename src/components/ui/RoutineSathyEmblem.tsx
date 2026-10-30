import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  G,
} from 'react-native-svg';

export interface RoutineSathyEmblemProps {
  size?: number;
  tone?: 'color' | 'white' | 'monochrome';
  withTile?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * RoutineSathyEmblem - The Official Brand Insignia for Routine Sathy.
 *
 * Core Concept: "R + path + sunrise + leaf"
 * - Rising Sun: The fresh dawn and start of a new day.
 * - Upper Bowl: Forming the top of 'R', embracing the sun.
 * - Stem: Upward growth leaf.
 * - Leg: The advancing path forward — every day a small consistent step.
 */
export function RoutineSathyEmblem({
  size = 52,
  tone = 'color',
  withTile = false,
  primaryColor,
  accentColor,
}: RoutineSathyEmblemProps) {
  // Unique gradient IDs to prevent collisions when multiple instances are mounted
  const id = React.useId().replace(/:/g, '_');

  const isWhite = tone === 'white';
  const isMono = tone === 'monochrome';

  // Palette values
  const bowlStart = primaryColor ?? (isWhite ? '#FFFFFF' : '#0B3D2E');
  const bowlEnd = isWhite ? '#DCE8E0' : '#1B8A4C';

  const stemStart = isMono ? (primaryColor ?? '#0B3D2E') : isWhite ? '#1FA757' : '#12803F';
  const stemEnd = isMono ? (primaryColor ?? '#0B3D2E') : isWhite ? '#86F0AC' : '#5BDB8B';

  const legStart = isMono ? (primaryColor ?? '#0B3D2E') : isWhite ? '#FFFFFF' : '#0F7A3E';
  const legEnd = isMono ? (primaryColor ?? '#0B3D2E') : isWhite ? '#CFE3D5' : '#6EE79C';

  const sunStart = accentColor ?? (isMono ? (primaryColor ?? '#0B3D2E') : '#FFD84D');
  const sunEnd = accentColor ?? (isMono ? (primaryColor ?? '#0B3D2E') : '#F5A800');

  if (withTile) {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Defs>
          {/* Tile Background Gradient */}
          <LinearGradient id={`tileGrad_${id}`} x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0%" stopColor="#136B47" />
            <Stop offset="50%" stopColor="#0B3D2E" />
            <Stop offset="100%" stopColor="#07261B" />
          </LinearGradient>

          {/* Gradients */}
          <LinearGradient id={`b_${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#DCE8E0" />
          </LinearGradient>
          <LinearGradient id={`s_${id}`} x1="0" y1="1" x2="0.4" y2="0">
            <Stop offset="0%" stopColor="#1FA757" />
            <Stop offset="100%" stopColor="#86F0AC" />
          </LinearGradient>
          <LinearGradient id={`l_${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#CFE3D5" />
          </LinearGradient>
          <LinearGradient id={`sun_${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFD84D" />
            <Stop offset="100%" stopColor="#F5A800" />
          </LinearGradient>
        </Defs>

        {/* Rounded Squircle Tile */}
        <Rect width="200" height="200" rx="46" fill={`url(#tileGrad_${id})`} />

        {/* Inner Highlight Line */}
        <Rect
          x="1"
          y="1"
          width="198"
          height="198"
          rx="45"
          stroke="#FFFFFF"
          strokeOpacity="0.15"
          strokeWidth="2"
        />

        {/* Emblem centered inside tile */}
        <G transform="translate(100, 100) scale(0.72) translate(-104, -108)">
          <Circle cx="92" cy="74" r="23" fill={`url(#sun_${id})`} />
          <Path
            d="M 52 72 C 54 40, 86 22, 118 26 C 152 30, 168 62, 156 88 C 148 104, 128 112, 104 112"
            fill="none"
            stroke={`url(#b_${id})`}
            strokeWidth="25"
            strokeLinecap="round"
          />
          <Path
            d="M 38 190 C 26 140, 34 98, 72 91 C 94 87, 108 95, 114 104 C 90 101, 62 114, 54 150 C 50 168, 46 180, 38 190 Z"
            fill={`url(#s_${id})`}
          />
          <Path
            d="M 92 126 C 124 120, 162 140, 178 190 C 140 190, 98 172, 92 126 Z"
            fill={`url(#l_${id})`}
          />
        </G>
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="10 10 180 190" fill="none">
      <Defs>
        <LinearGradient id={`b_${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={bowlStart} />
          <Stop offset="100%" stopColor={bowlEnd} />
        </LinearGradient>

        <LinearGradient id={`s_${id}`} x1="0" y1="1" x2="0.4" y2="0">
          <Stop offset="0%" stopColor={stemStart} />
          <Stop offset="100%" stopColor={stemEnd} />
        </LinearGradient>

        <LinearGradient id={`l_${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={legStart} />
          <Stop offset="100%" stopColor={legEnd} />
        </LinearGradient>

        <LinearGradient id={`sun_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={sunStart} />
          <Stop offset="100%" stopColor={sunEnd} />
        </LinearGradient>
      </Defs>

      {/* 1. Rising Sun */}
      <Circle cx="92" cy="74" r="23" fill={`url(#sun_${id})`} />

      {/* 2. Upper Bowl (R Arch) */}
      <Path
        d="M 52 72 C 54 40, 86 22, 118 26 C 152 30, 168 62, 156 88 C 148 104, 128 112, 104 112"
        fill="none"
        stroke={`url(#b_${id})`}
        strokeWidth="25"
        strokeLinecap="round"
      />

      {/* 3. Stem (Ascending Growth Leaf) */}
      <Path
        d="M 38 190 C 26 140, 34 98, 72 91 C 94 87, 108 95, 114 104 C 90 101, 62 114, 54 150 C 50 168, 46 180, 38 190 Z"
        fill={`url(#s_${id})`}
      />

      {/* 4. Leg (Forward Stepping Path / Leaf) */}
      <Path
        d="M 92 126 C 124 120, 162 140, 178 190 C 140 190, 98 172, 92 126 Z"
        fill={`url(#l_${id})`}
      />
    </Svg>
  );
}
