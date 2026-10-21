import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AmbientAtmosphereProps {
  style?: any;
}

/**
 * AmbientAtmosphere provides a soft, ethereal pastel ambient glow.
 * Kept ultra-light and restrained to prevent visual heaviness.
 */
export function AmbientAtmosphere({ style }: AmbientAtmosphereProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {/* 1. Ethereal Soft Lavender Glow (Top-Left) */}
      <View style={[styles.orb, styles.orbPrimary]}>
        <LinearGradient
          colors={['rgba(221, 214, 254, 0.45)', 'rgba(237, 233, 254, 0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Delicate Icy Blue Glow (Center-Right) */}
      <View style={[styles.orb, styles.orbSky]}>
        <LinearGradient
          colors={['rgba(186, 230, 253, 0.38)', 'rgba(224, 242, 254, 0.08)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 3. Whispering Pale Mint Glow (Bottom-Center) */}
      <View style={[styles.orb, styles.orbEmerald]}>
        <LinearGradient
          colors={['rgba(209, 250, 229, 0.30)', 'rgba(236, 253, 245, 0.05)', 'transparent']}
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
          filter: 'blur(70px)',
          WebkitFilter: 'blur(70px)',
        } as any)
      : {}),
  },
  orbPrimary: {
    width: Math.min(SCREEN_WIDTH * 0.9, 360),
    height: Math.min(SCREEN_WIDTH * 0.9, 360),
    top: -50,
    left: -30,
  },
  orbSky: {
    width: Math.min(SCREEN_WIDTH * 0.8, 300),
    height: Math.min(SCREEN_WIDTH * 0.8, 300),
    top: '36%',
    right: -40,
  },
  orbEmerald: {
    width: Math.min(SCREEN_WIDTH * 0.85, 320),
    height: Math.min(SCREEN_WIDTH * 0.85, 320),
    bottom: -50,
    left: '12%',
  },
});
