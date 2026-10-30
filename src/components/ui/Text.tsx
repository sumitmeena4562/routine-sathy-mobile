import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, TypographyVariant } from '@/theme/tokens.generated';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'inverse'
    | 'inverseMuted'
    | 'link'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error';
  tabular?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

/**
 * Core Text Primitive - Routine Sathy Design System
 * Enforces typography scale tokens, contrast compliance, and accessibility limits.
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  tabular = false,
  align,
  maxFontSizeMultiplier = 1.3,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();

  // Resolve semantic text colors
  const colorMap: Record<string, string> = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    inverseMuted: theme.isDark ? '#CFE3D6' : '#52665C',
    link: theme.isDark ? '#5BDB8B' : '#0B6B35',
    accent: theme.isDark ? '#5BDB8B' : '#16A34A',
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  const variantStyle = TypographyScale[variant] || TypographyScale.body;
  const textColor = colorMap[color] || theme.colors.text;

  return (
    <RNText
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        styles.base,
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          letterSpacing: 'letterSpacing' in variantStyle ? variantStyle.letterSpacing : 0,
          color: textColor,
          textAlign: align,
        },
        tabular && styles.tabular,
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
    includeFontPadding: false,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
