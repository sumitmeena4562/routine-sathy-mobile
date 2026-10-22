import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export interface AmbientAtmosphereProps {
  style?: any;
  opacity?: number;
}

/**
 * AmbientAtmosphere - Clean, Warm Sunrise Ambient Aura
 * A whisper-soft warm glow at the very top of the screen that adds organic depth without visual noise.
 */
export function AmbientAtmosphere({ style, opacity = 1 }: AmbientAtmosphereProps) {
  const theme = useTheme();

  const glowColor = theme.isDark ? '#1E1B4B' : '#FED7AA';
  const effectiveOpacity = theme.isDark ? 0.08 : 0.18;

  return (
    <View pointerEvents="none" style={[styles.container, { opacity: opacity * effectiveOpacity }, style]}>
      <View style={styles.topGlow}>
        <Svg width="100%" height="240" viewBox="0 0 400 240">
          <Defs>
            <RadialGradient id="cleanTopGlow" cx="50%" cy="0%" rx="60%" ry="100%">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="1" />
              <Stop offset="70%" stopColor={glowColor} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="200" cy="0" r="240" fill="url(#cleanTopGlow)" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 0,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
});
