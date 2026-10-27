import React, { useState } from 'react';
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

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function TextField({
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  isPassword = false,
  disabled = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e as any);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e as any);
  };

  const hasError = !!errorMessage;

  let borderColor: string = theme.colors.border;
  if (hasError) {
    borderColor = theme.colors.error;
  } else if (isFocused) {
    borderColor = theme.colors.borderFocus;
  }

  const backgroundColor = disabled
    ? theme.colors.disabledBackground
    : theme.colors.surface;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: hasError
                ? theme.colors.error
                : isFocused
                ? theme.colors.primary
                : theme.colors.textSecondary,
              fontSize: 13,
              marginBottom: theme.spacing.xs,
            },
          ]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            height: theme.heights.input,
            borderRadius: theme.radius.lg,
            backgroundColor,
            borderColor,
            borderWidth: isFocused || hasError ? theme.borderWidth.medium : theme.borderWidth.thin,
            paddingHorizontal: theme.spacing.md,
          },
        ]}>
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}

        <TextInput
          editable={!disabled}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.textInput,
            {
              color: disabled ? theme.colors.disabled : theme.colors.text,
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
            style={styles.iconContainer}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textSecondary}
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
            { color: theme.colors.error, marginTop: theme.spacing.xs },
          ]}>
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            styles.helperText,
            { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
          ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  helperText: {
    fontSize: 12,
  },
});
