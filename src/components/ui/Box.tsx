import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface BoxProps {
  children?: React.ReactNode;
  p?: number;
  px?: number;
  py?: number;
  m?: number;
  mx?: number;
  my?: number;
  gap?: number;
  bg?: string;
  radius?: number;
  border?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
}

export function Box({
  children,
  p,
  px,
  py,
  m,
  mx,
  my,
  gap,
  bg,
  radius,
  border = false,
  align,
  justify,
  style,
}: BoxProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          padding: p,
          paddingHorizontal: px,
          paddingVertical: py,
          margin: m,
          marginHorizontal: mx,
          marginVertical: my,
          gap,
          backgroundColor: bg,
          borderRadius: radius,
          borderWidth: border ? 1 : 0,
          borderColor: border ? theme.colors.border : undefined,
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface StackProps extends BoxProps {
  direction?: 'row' | 'column';
}

export function VStack({ children, gap = 12, style, ...rest }: BoxProps) {
  return (
    <Box gap={gap} style={[styles.column, style]} {...rest}>
      {children}
    </Box>
  );
}

export function HStack({ children, gap = 12, align = 'center', style, ...rest }: BoxProps) {
  return (
    <Box gap={gap} align={align} style={[styles.row, style]} {...rest}>
      {children}
    </Box>
  );
}

export function Spacer({ size = 16 }: { size?: number }) {
  return <View style={{ width: size, height: size }} />;
}

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
