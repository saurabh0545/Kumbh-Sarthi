import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

export interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'route' | 'family' | 'emergency' | 'alerts' | 'default';
  accessibilityLabel?: string;
  badgeCount?: number;
}

const VARIANT_CONFIG = {
  route: {
    bg: '#E8F5E9',
    iconColor: '#16A34A',
  },
  family: {
    bg: '#FFF3E0',
    iconColor: '#F47C20',
  },
  emergency: {
    bg: '#FFEBEE',
    iconColor: '#DC2626',
  },
  alerts: {
    bg: '#FFF8E1',
    iconColor: '#F59E0B',
  },
  default: {
    bg: '#F1F5F9',
    iconColor: '#123B5D',
  },
};

export function QuickAction({
  icon,
  label,
  onPress,
  variant = 'default',
  accessibilityLabel,
  badgeCount,
}: QuickActionProps) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      )}

      {/* Circular Icon Container */}
      <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      {/* Label */}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export const QuickActionCard = QuickAction;

// ─── 4-Tile Row Layout (Screen 1 Reference) ─────────────────────────────────

interface QuickActionsRowProps {
  actions: QuickActionProps[];
}

export function QuickActionsRow({ actions }: QuickActionsRowProps) {
  return (
    <View style={styles.row}>
      {actions.map((action, index) => (
        <View key={index} style={styles.rowItem}>
          <QuickAction {...action} />
        </View>
      ))}
    </View>
  );
}

// Backwards compatible Grid
export function QuickActionsGrid({ actions }: { actions: QuickActionProps[] }) {
  return <QuickActionsRow actions={actions} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
  tile: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    position: 'relative',
    minHeight: 82,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: KumbhColors.navy,
    textAlign: 'center',
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: KumbhColors.emergency,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    color: KumbhColors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
