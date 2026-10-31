import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { PrimitiveTokens } from '@/theme/tokens.generated';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  disabled?: boolean;
  /**
   * Color tone of the input.
   * 'dark': Tailored for brand dark canvases (e.g. #0A3326) with frosted surfaces and amber focus.
   * 'default': Follows light/surface theme.
   * If omitted, adapts automatically to theme.isDark.
   */
  tone?: 'default' | 'dark';
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    isPassword = false,
    disabled = false,
    tone,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    ...textInputProps
  },
  ref
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!errorMessage;
  const isDarkTone = tone === 'dark' || (tone !== 'default' && theme.isDark);

  let borderColor: string;
  let backgroundColor: string;
  let labelColor: string;
  let inputColor: string;
  let placeholderColor: string;
  let iconColor: string;

  if (isDarkTone) {
    labelColor = hasError ? '#F87171' : isFocused ? '#FFC94D' : 'rgba(207, 227, 214, 0.90)';
    borderColor = hasError ? '#F87171' : isFocused ? '#FFC94D' : 'rgba(207, 227, 214, 0.18)';
    backgroundColor = disabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)';
    inputColor = disabled ? 'rgba(207, 227, 214, 0.35)' : '#FFFFFF';
    placeholderColor = 'rgba(207, 227, 214, 0.40)';
    iconColor = hasError ? '#F87171' : isFocused ? '#FFC94D' : 'rgba(207, 227, 214, 0.65)';
  } else {
    labelColor = hasError
      ? theme.colors.error
      : isFocused
      ? theme.colors.primary
      : theme.colors.textSecondary;
    borderColor = hasError
      ? theme.colors.error
      : isFocused
      ? theme.colors.borderFocus
      : theme.colors.border;
    backgroundColor = disabled
      ? theme.colors.disabledBackground
      : theme.colors.surface;
    inputColor = disabled ? theme.colors.disabled : theme.colors.text;
    placeholderColor = theme.colors.textMuted;
    iconColor = theme.colors.textSecondary;
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: labelColor,
              fontSize: 13,
              marginBottom: 6,
            },
          ]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            height: isDarkTone ? 48 : theme.heights.input,
            borderRadius: isDarkTone ? 14 : theme.radius.lg,
            backgroundColor,
            borderColor,
            borderWidth: isFocused || hasError ? 1.5 : 1,
            paddingHorizontal: 14,
          },
        ]}>
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          editable={!disabled}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isPassword && !showPassword}
          multiline={false}
          numberOfLines={1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.textInput,
            {
              color: inputColor,
              fontSize: 15,
            },
            inputStyle,
          ]}
          {...textInputProps}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconContainer}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={iconColor}
            />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError ? (
        <Text
          style={[
            styles.helperText,
            { color: isDarkTone ? '#F87171' : theme.colors.error, marginTop: 4 },
          ]}>
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            styles.helperText,
            { color: isDarkTone ? 'rgba(207, 227, 214, 0.60)' : theme.colors.textMuted, marginTop: 4 },
          ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily: PrimitiveTokens.font.family.medium,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontFamily: PrimitiveTokens.font.family.regular,
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  helperText: {
    fontFamily: PrimitiveTokens.font.family.regular,
    fontSize: 12,
  },
});
