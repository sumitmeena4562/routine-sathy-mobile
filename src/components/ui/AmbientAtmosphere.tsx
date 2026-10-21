import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AmbientAtmosphereProps {
  style?: any;
}

/**
 * AmbientAtmosphere provides the radiant optical color backdrop
 * essential for authentic VisionOS / iOS glassmorphism refraction.
 */
export function AmbientAtmosphere({ style }: AmbientAtmosphereProps) {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {/* 1. Primary Lavender Nebula (Top-Left / Center) */}
      <View
        style={[
          styles.orb,
          styles.orbPrimary,
          {
            backgroundColor: theme.colors.ambientOrb1,
            opacity: theme.isDark ? 0.45 : 0.65,
          },
        ]}>
        <LinearGradient
          colors={[
            theme.colors.ambientOrb1,
            theme.isDark ? 'rgba(45, 32, 84, 0)' : 'rgba(221, 213, 254, 0)',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Calming Sky Aura (Center-Right) */}
      <View
        style={[
          styles.orb,
          styles.orbSky,
          {
            backgroundColor: theme.colors.ambientOrb2,
            opacity: theme.isDark ? 0.35 : 0.55,
          },
        ]}>
        <LinearGradient
          colors={[
            theme.colors.ambientOrb2,
            theme.isDark ? 'rgba(19, 40, 71, 0)' : 'rgba(186, 230, 253, 0)',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 3. Fresh Emerald Vitality Aura (Bottom-Center) */}
      <View
        style={[
          styles.orb,
          styles.orbEmerald,
          {
            backgroundColor: theme.colors.ambientOrb3,
            opacity: theme.isDark ? 0.30 : 0.45,
          },
        ]}>
        <LinearGradient
          colors={[
            theme.colors.ambientOrb3,
            theme.isDark ? 'rgba(17, 51, 40, 0)' : 'rgba(209, 250, 229, 0)',
          ]}
          style={StyleSheet.absoluteFill}
        />
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
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(60px)',
          WebkitFilter: 'blur(60px)',
        } as any)
      : {}),
  },
  orbPrimary: {
    width: Math.min(SCREEN_WIDTH * 0.95, 380),
    height: Math.min(SCREEN_WIDTH * 0.95, 380),
    top: -60,
    left: -40,
  },
  orbSky: {
    width: Math.min(SCREEN_WIDTH * 0.85, 320),
    height: Math.min(SCREEN_WIDTH * 0.85, 320),
    top: '35%',
    right: -60,
  },
  orbEmerald: {
    width: Math.min(SCREEN_WIDTH * 0.90, 340),
    height: Math.min(SCREEN_WIDTH * 0.90, 340),
    bottom: -60,
    left: '15%',
  },
});
