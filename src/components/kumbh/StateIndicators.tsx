import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

// ─── Loading State ────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading crowd data...' }: LoadingStateProps) {
  return (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={KumbhColors.saffron} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  title = 'Connection unavailable',
  message = 'Unable to reach the live monitoring server. Please check your connectivity.',
  onRetry,
  retryText = 'Retry Connection',
}: ErrorStateProps) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.errorIcon}>📡</Text>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryText}
        >
          <Text style={styles.retryBtnText}>↻ {retryText}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📋',
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionText && onAction && (
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <Text style={styles.actionBtnText}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: KumbhSpacing.md,
  },
  loadingText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textSecondary,
  },
  stateCard: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    gap: KumbhSpacing.sm,
    marginVertical: KumbhSpacing.md,
  },
  errorIcon: {
    fontSize: 36,
  },
  errorTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  retryBtn: {
    marginTop: KumbhSpacing.sm,
    backgroundColor: KumbhColors.saffron,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: KumbhRadius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
    textAlign: 'center',
  },
  emptyDescription: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: KumbhSpacing.sm,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: KumbhColors.saffron,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: KumbhRadius.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.saffron,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
