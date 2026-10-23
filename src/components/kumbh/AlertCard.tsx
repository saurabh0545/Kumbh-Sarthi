import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { useSettings } from '@/context/SettingsContext';

export interface AlertItem {
  id: string;
  type: 'crowd' | 'safety' | 'emergency' | 'family' | 'info';
  title: string;
  message: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string;
  time: string;
  isRead?: boolean;
  actionText?: string;
  onAction?: () => void;
  isDemo?: boolean;
  isAuthorityBroadcast?: boolean;
}

interface AlertCardProps {
  alert: AlertItem;
  onPress?: () => void;
  highContrast?: boolean;
}

export function AlertCard({ alert, onPress, highContrast = false }: AlertCardProps) {
  const { language } = useSettings();

  const isCritical = alert.severity === 'CRITICAL' || alert.type === 'emergency' || alert.type === 'crowd';
  const isWarning = alert.severity === 'WARNING' || alert.type === 'safety';
  const isFamily = alert.type === 'family';

  let categoryTitle = language === 'mr' ? 'माहिती' : language === 'hi' ? 'सूचना' : 'Information';
  let badgeColor: string = KumbhColors.statusLow;
  let symbol = '✓';

  if (isCritical) {
    categoryTitle = language === 'mr' ? 'अति महत्त्वाचे (गंभीर)' : language === 'hi' ? 'गंभीर' : 'Critical';
    badgeColor = KumbhColors.statusHigh;
    symbol = '⚠';
  } else if (isWarning) {
    categoryTitle = language === 'mr' ? 'दक्षतेचा इशारा' : language === 'hi' ? 'चेतावनी' : 'Warning';
    badgeColor = KumbhColors.statusModerate;
    symbol = '!';
  } else if (isFamily) {
    categoryTitle = language === 'mr' ? 'कुटुंब' : language === 'hi' ? 'परिवार' : 'Family';
    badgeColor = '#2563EB';
    symbol = '👥';
  } else if (alert.type === 'info') {
    categoryTitle = language === 'mr' ? 'सर्वसाधारण' : language === 'hi' ? 'सामान्य' : 'General';
    badgeColor = '#2563EB';
    symbol = 'i';
  }

  // Location display
  let locationDisplay = alert.location;
  if (language === 'mr' && alert.location) {
    if (alert.location.includes('Gate 1') || alert.location.includes('Gate-A')) locationDisplay = 'गेट १ परिसर';
    else if (alert.location.includes('Gate 2') || alert.location.includes('Gate-B')) locationDisplay = 'गेट २ परिसर';
    else if (alert.location.includes('Ramkund')) locationDisplay = 'रामकुंड मुख्य घाट';
  }

  const metaText = `${alert.time}${locationDisplay ? ` · ${locationDisplay}` : ''}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        !alert.isRead && styles.unreadCard,
        alert.isAuthorityBroadcast && styles.authorityCard,
        highContrast && styles.highContrastCard,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${categoryTitle} alert: ${alert.title}`}
    >
      {alert.isAuthorityBroadcast && (
        <View style={styles.authorityPill}>
          <Text style={styles.authorityPillDot}>🔴</Text>
          <Text style={styles.authorityPillText}>
            {language === 'mr'
              ? 'शासकीय अधिकृत थेट प्रसारण'
              : language === 'hi'
              ? 'शासन आधिकारिक लाइव प्रसारण'
              : 'OFFICIAL LIVE AUTHORITY BROADCAST'}
          </Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={styles.badgeCol}>
          <View style={[styles.symbolCircle, { backgroundColor: badgeColor }]}>
            <Text style={styles.symbolText}>{symbol}</Text>
          </View>
          <Text style={[styles.categoryLabel, { color: badgeColor }]}>
            {categoryTitle}
          </Text>
        </View>

        {!alert.isRead && (
          <View style={styles.unreadDot} />
        )}
      </View>

      <Text style={[styles.title, !alert.isRead && styles.unreadTitle]} numberOfLines={2}>
        {alert.title}
      </Text>

      <Text style={styles.message} numberOfLines={3}>
        {alert.message}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.metaText}>{metaText}</Text>
        {alert.actionText && (
          <Text style={styles.actionLinkText}>
            {language === 'mr' && alert.actionText.includes('Camera')
              ? 'कॅमेरा पहा →'
              : `${alert.actionText} →`}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    marginBottom: KumbhSpacing.md,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: KumbhColors.saffron,
    backgroundColor: '#FFFCFA',
  },
  authorityCard: {
    borderWidth: 1.5,
    borderColor: '#F87171',
    backgroundColor: '#FFFDFD',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  authorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  authorityPillDot: {
    fontSize: 9,
  },
  authorityPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B91C1C',
    letterSpacing: 0.4,
  },
  highContrastCard: {
    borderColor: KumbhColors.navy,
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    color: KumbhColors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KumbhColors.saffron,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: KumbhColors.navy,
    lineHeight: 22,
    marginBottom: 6,
  },
  unreadTitle: {
    fontWeight: '800',
  },
  message: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: KumbhColors.borderLight,
  },
  metaText: {
    fontSize: 11,
    color: KumbhColors.textMuted,
    fontWeight: '500',
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: KumbhColors.saffron,
  },
});
