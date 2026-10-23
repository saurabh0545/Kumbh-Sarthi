import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { KumbhColors, KumbhRadius, KumbhSpacing, KumbhTypography } from '@/constants/kumbh-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface KumbhButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

export function KumbhButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  fullWidth = true,
}: KumbhButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    variant === 'danger' && styles.danger,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'ghost' && styles.ghostText,
    variant === 'danger' && styles.dangerText,
  ];

  return (
    <Pressable
      style={({ pressed }) => [buttonStyle, pressed && !isDisabled && styles.pressed]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? KumbhColors.white : KumbhColors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: Omit<KumbhButtonProps, 'variant'>) {
  return <KumbhButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<KumbhButtonProps, 'variant'>) {
  return <KumbhButton {...props} variant="secondary" />;
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: KumbhRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: KumbhSpacing.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  // Variants
  primary: {
    backgroundColor: KumbhColors.saffron,
    shadowColor: KumbhColors.saffron,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  secondary: {
    backgroundColor: KumbhColors.white,
    borderWidth: 1.5,
    borderColor: KumbhColors.navy,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: KumbhColors.emergency,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  // Text
  text: {
    ...KumbhTypography.h4,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: KumbhColors.white,
    fontWeight: '700',
  },
  secondaryText: {
    color: KumbhColors.navy,
    fontWeight: '700',
  },
  ghostText: {
    color: KumbhColors.navy,
  },
  dangerText: {
    color: KumbhColors.white,
    fontWeight: '700',
  },
});
