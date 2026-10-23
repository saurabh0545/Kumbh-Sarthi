import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

interface SafetyStatusCardProps {
  status?: 'LOW' | 'MODERATE' | 'HIGH';
  title?: string;
  description?: string;
  highContrast?: boolean;
  onPress?: () => void;
}

export function SafetyStatusCard({
  status = 'LOW',
  title = 'Safe',
  description = 'Crowd conditions are manageable.',
  highContrast = false,
  onPress,
}: SafetyStatusCardProps) {
  const isSafe = status === 'LOW';
  const isModerate = status === 'MODERATE';

  const statusLabel = isSafe ? 'Safe' : isModerate ? 'Caution' : 'Congested';
  const statusColor = isSafe
    ? KumbhColors.statusLow
    : isModerate
    ? KumbhColors.statusModerate
    : KumbhColors.statusHigh;

  const iconBg = isSafe
    ? KumbhColors.statusLow
    : isModerate
    ? KumbhColors.statusModerate
    : KumbhColors.statusHigh;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        highContrast && styles.highContrastCard,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="summary"
      accessibilityLabel={`Current Kumbh Safety Status: ${statusLabel}. ${description}`}
    >
      <View style={styles.contentRow}>
        {/* Left Status Circle Icon */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Text style={styles.iconSymbol}>{isSafe ? '✓' : isModerate ? '!' : '⚠'}</Text>
        </View>

        {/* Center Text Info */}
        <View style={styles.textCol}>
          <Text style={styles.captionText}>Current Safety Status</Text>
          <Text style={[styles.statusTitle, { color: statusColor }]}>
            {title || statusLabel}
          </Text>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {description}
          </Text>
        </View>

        {/* Right Chevron */}
        <View style={styles.chevronBox}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    paddingVertical: KumbhSpacing.base,
    paddingHorizontal: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  highContrastCard: {
    borderWidth: 2,
    borderColor: KumbhColors.navy,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KumbhSpacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconSymbol: {
    color: KumbhColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  textCol: {
    flex: 1,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    letterSpacing: 0.2,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  descriptionText: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
    marginTop: 1,
  },
  chevronBox: {
    paddingLeft: 4,
  },
  chevron: {
    fontSize: 26,
    color: KumbhColors.textMuted,
    fontWeight: '300',
    lineHeight: 28,
  },
});
