import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: theme.colors.backgroundElement },
        ]}>
        <Ionicons name="compass-outline" size={38} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Page Not Found</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        This screen does not exist in your daily rhythm flow.
      </Text>

      <Button
        title="Return to Onboarding"
        variant="primary"
        size="md"
        onPress={() => router.replace('/onboarding')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  button: {
    minWidth: 200,
  },
});
