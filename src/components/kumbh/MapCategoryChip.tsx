import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  KumbhColors,
  KumbhRadius,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

interface MapCategoryChipProps {
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
  highContrast?: boolean;
}

export function MapCategoryChip({
  label,
  icon,
  isActive,
  onPress,
  highContrast = false,
}: MapCategoryChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.activeChip,
        highContrast && styles.highContrastChip,
        highContrast && isActive && styles.highContrastActiveChip,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Filter ${label}`}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
          highContrast && isActive && styles.highContrastActiveLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KumbhColors.backgroundCard,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: KumbhRadius.full,
    minHeight: 44,
    gap: 6,
    marginRight: KumbhSpacing.xs,
  },
  activeChip: {
    backgroundColor: '#FFF0E8',
    borderColor: KumbhColors.primary,
  },
  highContrastChip: {
    borderWidth: 1.5,
    borderColor: KumbhColors.textPrimary,
  },
  highContrastActiveChip: {
    backgroundColor: KumbhColors.primaryDark,
    borderColor: KumbhColors.textPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  activeLabel: {
    color: KumbhColors.primary,
    fontWeight: '700',
  },
  highContrastActiveLabel: {
    color: KumbhColors.white,
    fontWeight: '800',
  },
});
