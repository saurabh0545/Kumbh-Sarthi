import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { KumbhColors, KumbhRadius, KumbhTypography } from '@/constants/kumbh-theme';
import { CrowdStatus, DataSource } from '@/data/mock-data';
import { useSettings } from '@/context/SettingsContext';

// ─── Source Badge (LIVE CAMERA / DEMO DATA) ─────────────────────────────────

interface SourceBadgeProps {
  source: DataSource;
  isOffline?: boolean;
}

export function SourceBadge({ source, isOffline }: SourceBadgeProps) {
  const { language } = useSettings();
  const isLive = source === 'LIVE_CAMERA';

  const liveLabel =
    language === 'mr' ? '• थेट कॅमेरा' : language === 'hi' ? '• लाइव कैमरा' : '• LIVE CAMERA';
  const demoLabel =
    language === 'mr' ? 'डेमो डेटा' : language === 'hi' ? 'डेमो डेटा' : 'DEMO DATA';
  const offlineLabel =
    language === 'mr' ? 'कॅमेरा ऑफलाइन' : language === 'hi' ? 'कैमरा ऑफलाइन' : 'CAMERA OFFLINE';

  const badgeText = isLive ? (isOffline ? offlineLabel : liveLabel) : demoLabel;

  return (
    <View
      style={[
        styles.sourceBadge,
        isLive ? (isOffline ? styles.offlineBg : styles.liveBg) : styles.demoBg,
      ]}
    >
      {isLive && <View style={[styles.liveDot, isOffline && styles.offlineDot]} />}
      <Text
        style={[
          styles.sourceBadgeText,
          isLive ? (isOffline ? styles.offlineText : styles.liveText) : styles.demoText,
        ]}
      >
        {badgeText}
      </Text>
    </View>
  );
}

// ─── Status Badge (LOW / MODERATE / HIGH) ────────────────────────────────────

interface StatusBadgeProps {
  status: CrowdStatus;
}

export function StatusBadge({ status, highContrast }: StatusBadgeProps & { highContrast?: boolean }) {
  const { language } = useSettings();

  const labels = {
    LOW:
      language === 'mr'
        ? '🟢 कमी गर्दी'
        : language === 'hi'
        ? '🟢 कम भीड़'
        : '🟢 Low Crowd',
    MODERATE:
      language === 'mr'
        ? '🟡 मध्यम गर्दी'
        : language === 'hi'
        ? '🟡 मध्यम भीड़'
        : '🟡 Moderate Crowd',
    HIGH:
      language === 'mr'
        ? '🔴 जास्त गर्दी'
        : language === 'hi'
        ? '🔴 अधिक भीड़'
        : '🔴 High Crowd',
  };

  const config = {
    LOW: {
      bg: KumbhColors.statusLowBg,
      text: highContrast ? '#052e16' : KumbhColors.statusLowText,
      border: highContrast ? '#166534' : 'transparent',
      fullLabel: labels.LOW,
    },
    MODERATE: {
      bg: KumbhColors.statusModerateBg,
      text: highContrast ? '#451a03' : KumbhColors.statusModerateText,
      border: highContrast ? '#92400e' : 'transparent',
      fullLabel: labels.MODERATE,
    },
    HIGH: {
      bg: KumbhColors.statusHighBg,
      text: highContrast ? '#450a0a' : KumbhColors.statusHighText,
      border: highContrast ? '#991b1b' : 'transparent',
      fullLabel: labels.HIGH,
    },
  };

  const { bg, text, border, fullLabel } = config[status] || config.LOW;

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg, borderColor: border, borderWidth: highContrast ? 1.5 : 0 }]}>
      <Text
        style={[styles.statusBadgeText, { color: text }]}
        accessibilityLabel={`Status: ${status} crowd`}
      >
        {fullLabel}
      </Text>
    </View>
  );
}

// ─── Crowd Density Bar ───────────────────────────────────────────────────────

interface DensityBarProps {
  status: CrowdStatus;
}

export function DensityBar({ status }: DensityBarProps) {
  const config = {
    LOW: { fill: 0.25, color: KumbhColors.statusLow },
    MODERATE: { fill: 0.55, color: KumbhColors.statusModerate },
    HIGH: { fill: 0.85, color: KumbhColors.statusHigh },
  };
  const { fill, color } = config[status] || config.LOW;

  return (
    <View style={styles.densityBarTrack}>
      <View style={[styles.densityBarFill, { width: `${fill * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: KumbhRadius.full,
    gap: 4,
  },
  sourceBadgeText: {
    fontSize: 11,
  },
  liveBg: {
    backgroundColor: '#DCFCE7',
  },
  offlineBg: {
    backgroundColor: '#FEF3C7',
  },
  demoBg: {
    backgroundColor: '#F1F5F9',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  offlineDot: {
    backgroundColor: '#D97706',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  demoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: KumbhRadius.md,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  densityBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  densityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
