import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import {
  KumbhColors,
  KumbhRadius,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'off';
  style?: StyleProp<ViewStyle>;
  error?: string;
  accessibilityLabel?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoComplete,
  style,
  error,
  accessibilityLabel,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const showPassword = isPassword && isPasswordVisible;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={KumbhColors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
          accessible
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible((v) => !v)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: KumbhSpacing.xs,
  },
  label: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KumbhColors.backgroundCard,
    borderWidth: 1.5,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    paddingHorizontal: KumbhSpacing.base,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: KumbhColors.saffron,
  },
  inputWrapperError: {
    borderColor: KumbhColors.emergency,
  },
  input: {
    flex: 1,
    ...KumbhTypography.body,
    color: KumbhColors.textPrimary,
    padding: 0,
  },
  eyeButton: {
    paddingLeft: KumbhSpacing.sm,
    height: '100%',
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    ...KumbhTypography.caption,
    color: KumbhColors.emergency,
  },
});
