import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { PrimitiveTokens } from '@/theme/tokens.generated';

export function StatsSkeleton() {
  const theme = useTheme();
  const [opacityAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  const blockStyle = [
    styles.skeletonBlock,
    {
      backgroundColor: theme.colors.surfaceAlt,
      opacity: opacityAnim,
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={[blockStyle, { height: 170 }]} />
      <Animated.View style={[blockStyle, { height: 230 }]} />
      <Animated.View style={[blockStyle, { height: 150 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: PrimitiveTokens.space[3],
    paddingTop: PrimitiveTokens.space[2],
  },
  skeletonBlock: {
    width: '100%',
    borderRadius: PrimitiveTokens.radius.xl,
  },
});
