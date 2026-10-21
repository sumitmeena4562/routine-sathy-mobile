import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface AmbientAtmosphereProps {
  style?: any;
  opacity?: number;
}

/**
 * AmbientAtmosphere renders soft, organic lavender and icy blue blurred orbs.
 * Fully responsive: uses dynamic window dimensions to adapt seamlessly
 * across small mobile screens, large foldables, tablets, and web desktop.
 */
export function AmbientAtmosphere({ style, opacity = 1 }: AmbientAtmosphereProps) {
  const { width: windowWidth } = useWindowDimensions();

  const orbLavenderSize = Math.min(windowWidth * 0.95, 380);
  const orbIcyBlueSize = Math.min(windowWidth * 0.88, 340);
  const orbMintLilacSize = Math.min(windowWidth * 0.92, 350);

  return (
    <View pointerEvents="none" style={[styles.container, { opacity }, style]}>
      {/* 1. Luminous Soft Lavender Orb (Top-Right / Header) */}
      <View
        style={[
          styles.orb,
          styles.orbLavender,
          { width: orbLavenderSize, height: orbLavenderSize },
        ]}>
        <LinearGradient
          colors={[
            'rgba(196, 181, 253, 0.70)',
            'rgba(221, 214, 254, 0.45)',
            'rgba(237, 233, 254, 0.15)',
            'transparent',
          ]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Calming Icy Blue Orb (Center-Left / Midground) */}
      <View
        style={[
          styles.orb,
          styles.orbIcyBlue,
          { width: orbIcyBlueSize, height: orbIcyBlueSize },
        ]}>
        <LinearGradient
          colors={[
            'rgba(125, 211, 252, 0.60)',
            'rgba(186, 230, 253, 0.35)',
            'rgba(224, 242, 254, 0.10)',
            'transparent',
          ]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 3. Whispering Pale Mint / Lilac Depth Orb (Bottom-Center) */}
      <View
        style={[
          styles.orb,
          styles.orbMintLilac,
          { width: orbMintLilacSize, height: orbMintLilacSize },
        ]}>
        <LinearGradient
          colors={[
            'rgba(167, 243, 208, 0.45)',
            'rgba(209, 250, 229, 0.25)',
            'rgba(236, 253, 245, 0.05)',
            'transparent',
          ]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.9, y: 0.9 }}
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
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(55px)',
          WebkitFilter: 'blur(55px)',
        } as any)
      : {}),
  },
  orbLavender: {
    top: -60,
    right: -50,
  },
  orbIcyBlue: {
    top: '32%',
    left: -60,
  },
  orbMintLilac: {
    bottom: -60,
    right: '10%',
  },
});
