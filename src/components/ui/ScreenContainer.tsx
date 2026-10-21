import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withTabInset?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle'>;
}

export function ScreenContainer({
  children,
  scrollable = false,
  withTabInset = true,
  style,
  contentContainerStyle,
  scrollViewProps,
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = withTabInset
    ? insets.bottom + BottomTabInset + theme.spacing.lg
    : insets.bottom + theme.spacing.lg;

  const baseContentStyle: ViewStyle = {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  };

  if (scrollable) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              baseContentStyle,
              { paddingBottom: bottomPadding, paddingTop: theme.spacing.md },
              contentContainerStyle,
            ]}
            style={[styles.scrollView, style]}
            {...scrollViewProps}>
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[
          styles.safeArea,
          baseContentStyle,
          {
            paddingBottom: bottomPadding,
            paddingTop: theme.spacing.md,
          },
          style,
        ]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
