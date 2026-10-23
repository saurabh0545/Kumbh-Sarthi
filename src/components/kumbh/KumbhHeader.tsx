import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  KumbhColors,
  KumbhRadius,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';

export interface KumbhHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  highContrast?: boolean;
}

export function KumbhHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
  highContrast = false,
}: KumbhHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.headerContainer, highContrast && styles.highContrastBorder]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        )}
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightElement ? <View style={styles.rightContainer}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: KumbhSpacing.md,
    backgroundColor: KumbhColors.white,
    borderBottomWidth: 1,
    borderBottomColor: KumbhColors.borderLight,
  },
  highContrastBorder: {
    borderBottomWidth: 2,
    borderBottomColor: KumbhColors.navy,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: KumbhSpacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: KumbhRadius.md,
    backgroundColor: KumbhColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  backArrow: {
    fontSize: 26,
    color: KumbhColors.navy,
    fontWeight: '700',
    marginTop: -2,
    marginLeft: -2,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    ...KumbhTypography.h3,
    color: KumbhColors.navy,
    fontWeight: '700',
  },
  subtitle: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: KumbhSpacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
