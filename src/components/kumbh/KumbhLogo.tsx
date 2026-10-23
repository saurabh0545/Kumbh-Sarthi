import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { KumbhColors, KumbhTypography } from '@/constants/kumbh-theme';

interface KumbhLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  style?: ViewStyle;
  variant?: 'light' | 'dark';
  layout?: 'row' | 'column';
}

const SIZES = {
  sm: 36,
  md: 56,
  lg: 90,
  xl: 130,
};

export const KumbhLogo: React.FC<KumbhLogoProps> = ({
  size = 'md',
  showText = false,
  showTagline = false,
  style,
  variant = 'light',
  layout = 'column',
}) => {
  const iconSize = SIZES[size];
  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/images/kumbh_logo_transparent.png')}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize / 2 }}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textContainer}>
          <View style={layout === 'column' ? styles.titleColumn : styles.titleRow}>
            <Text
              style={[
                styles.titleBrand,
                { color: isDark ? KumbhColors.white : KumbhColors.navy },
                size === 'sm' && { fontSize: 16 },
                size === 'lg' && { fontSize: 28 },
                size === 'xl' && { fontSize: 36, lineHeight: 40, letterSpacing: 0.5 },
              ]}
            >
              Kumbh
            </Text>
            <Text
              style={[
                styles.titleAccent,
                size === 'sm' && { fontSize: 16 },
                size === 'lg' && { fontSize: 28 },
                size === 'xl' && { fontSize: 36, lineHeight: 40, letterSpacing: 0.5 },
              ]}
            >
              Sarthi
            </Text>
          </View>
          {showTagline && (
            <Text
              style={[
                styles.tagline,
                { color: isDark ? 'rgba(240, 246, 252, 0.75)' : KumbhColors.textSecondary },
                size === 'xl' && { fontSize: 14, marginTop: 8, letterSpacing: 0.8 },
              ]}
            >
              Safer journeys. Smarter Kumbh.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleColumn: {
    alignItems: 'center',
    gap: 0,
  },
  titleBrand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 22,
    fontWeight: '800',
    color: KumbhColors.saffron,
    letterSpacing: -0.5,
  },
  tagline: {
    ...KumbhTypography.caption,
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
