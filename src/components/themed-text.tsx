import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'default'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'body'
  | 'bodyMedium'
  | 'bodyBold'
  | 'caption'
  | 'captionMedium'
  | 'captionBold'
  | 'label'
  | 'small'
  | 'smallBold'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  // Determine text color
  let color = theme.colors[themeColor ?? 'text'];
  if (type === 'linkPrimary') {
    color = theme.colors.primary;
  }

  // Get typographic style from tokens
  const typographyStyle = styles[type] || styles.default;

  return (
    <Text
      style={[
        { color },
        typographyStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: Typography.display,
  title: Typography.title,
  subtitle: Typography.subtitle,
  heading: Typography.heading,
  body: Typography.body,
  bodyMedium: Typography.bodyMedium,
  bodyBold: Typography.bodyBold,
  caption: Typography.caption,
  captionMedium: Typography.captionMedium,
  captionBold: Typography.captionBold,
  label: Typography.label,
  small: Typography.small,
  smallBold: Typography.smallBold,
  code: Typography.code,
  default: Typography.bodyMedium,
  link: Typography.link,
  linkPrimary: Typography.link,
});
