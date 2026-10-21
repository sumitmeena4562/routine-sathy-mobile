import React, { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView type="backgroundElement" style={styles.button}>
          <Ionicons
            name={isOpen ? 'chevron-down' : 'chevron-forward'}
            size={14}
            color={theme.colors.text}
          />
        </ThemedView>

        <ThemedText type="bodyMedium">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(theme.animation.durationFast)}>
          <ThemedView type="backgroundElement" style={styles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    marginLeft: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
});
