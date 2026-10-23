import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { GateData } from '@/data/mock-data';
import { useSettings } from '@/context/SettingsContext';
import { DensityBar, SourceBadge, StatusBadge } from './StatusBadge';

// ─── Full Crowd Card (Crowd Monitor screen) ──────────────────────────────────

export interface CrowdCardProps {
  gate: GateData;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function CrowdCard({
  gate,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: CrowdCardProps) {
  const { language } = useSettings();

  const peopleWord =
    language === 'mr' ? 'भाविक' : language === 'hi' ? 'श्रद्धालु' : 'People';
  const offlineWord =
    language === 'mr' ? 'कॅमेरा ऑफलाइन' : language === 'hi' ? 'कैमरा ऑफलाइन' : 'Camera Offline';
  const loadingWord =
    language === 'mr' ? 'माहिती लोड होत आहे...' : language === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading crowd data...';
  const offlineDesc =
    language === 'mr'
      ? 'लॅपटॉप कॅमेरा ऑफलाइन · सुरक्षित अंदाज सक्रिय'
      : language === 'hi'
      ? 'लैपटॉप कैमरा ऑफलाइन · सुरक्षित अनुमान सक्रिय'
      : 'Laptop camera offline · Safe estimate active';

  // Translate gate name if in Marathi/Hindi
  let displayName = gate.name;
  if (language === 'mr') {
    if (gate.id === 'gate-1' || gate.name.includes('Gate 1')) displayName = 'गेट १ (रामकुंड पश्चिम)';
    else if (gate.id === 'gate-2' || gate.name.includes('Gate 2')) displayName = 'गेट २ (तपोवन उत्तर)';
    else if (gate.id === 'gate-3' || gate.name.includes('Gate 3')) displayName = 'गेट ३ (पंचवटी पूर्व)';
    else if (gate.id === 'gate-4' || gate.name.includes('Gate 4')) displayName = 'गेट ४ (गोदावरी दक्षिण)';
  } else if (language === 'hi') {
    if (gate.id === 'gate-1' || gate.name.includes('Gate 1')) displayName = 'गेट १ (रामकुंड पश्चिम)';
    else if (gate.id === 'gate-2' || gate.name.includes('Gate 2')) displayName = 'गेट २ (तपोवन उत्तर)';
    else if (gate.id === 'gate-3' || gate.name.includes('Gate 3')) displayName = 'गेट ३ (पंचवटी पूर्व)';
    else if (gate.id === 'gate-4' || gate.name.includes('Gate 4')) displayName = 'गेट ४ (गोदावरी दक्षिण)';
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.gateName}>{displayName}</Text>
        <SourceBadge source={gate.source} isOffline={isError} />
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={KumbhColors.primary} />
          <Text style={styles.loadingText}>{loadingWord}</Text>
        </View>
      ) : (
        <>
          {gate.source === 'LIVE_CAMERA' ? (
            <View style={styles.cameraRow}>
              <Text style={styles.peopleCount}>
                {gate.peopleCount !== undefined
                  ? `${gate.peopleCount} ${peopleWord}`
                  : `34 ${peopleWord} (${language === 'mr' ? 'अंदाज' : 'Estimate'})`}
              </Text>
              {isError && (
                <View style={styles.offlineNoticeBadge}>
                  <Text style={styles.offlineNoticeText}>{offlineWord}</Text>
                </View>
              )}
            </View>
          ) : gate.peopleCount !== undefined ? (
            <Text style={styles.peopleCount}>
              {gate.peopleCount} {peopleWord}
            </Text>
          ) : null}

          <StatusBadge status={gate.status} />
          <DensityBar status={gate.status} />

          <Text style={styles.updatedAt}>
            {isError ? offlineDesc : gate.updatedAt}
          </Text>
        </>
      )}
    </View>
  );
}

// ─── Grid Crowd Card (Home Dashboard — 2x2 grid) ────────────────────────────

export interface CrowdGridCardProps {
  gate: GateData;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onPress?: () => void;
}

export function CrowdGridCard({
  gate,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onPress,
}: CrowdGridCardProps) {
  const { language } = useSettings();
  const isSafe = gate.status === 'LOW';
  const isModerate = gate.status === 'MODERATE';

  const iconBg = isSafe
    ? KumbhColors.statusLow
    : isModerate
    ? KumbhColors.statusModerate
    : KumbhColors.statusHigh;

  const statusLabel = isSafe
    ? language === 'mr'
      ? 'कमी गर्दी'
      : language === 'hi'
      ? 'कम भीड़'
      : 'Low'
    : isModerate
    ? language === 'mr'
      ? 'मध्यम'
      : language === 'hi'
      ? 'मध्यम'
      : 'Medium'
    : language === 'mr'
    ? 'जास्त गर्दी'
    : language === 'hi'
    ? 'अधिक भीड़'
    : 'High';

  const isLiveYolo = gate.source === 'LIVE_CAMERA';
  const peopleWord =
    language === 'mr' ? 'भाविक' : language === 'hi' ? 'श्रद्धालु' : 'People';

  // Translate Short Title
  let shortGateTitle = gate.name.split(' ')[0] + ' ' + (gate.name.split(' ')[1] || '');
  if (language === 'mr') {
    if (gate.id === 'gate-1' || gate.name.includes('Gate 1')) shortGateTitle = 'गेट १';
    else if (gate.id === 'gate-2' || gate.name.includes('Gate 2')) shortGateTitle = 'गेट २';
    else if (gate.id === 'gate-3' || gate.name.includes('Gate 3')) shortGateTitle = 'गेट ३';
    else if (gate.id === 'gate-4' || gate.name.includes('Gate 4')) shortGateTitle = 'गेट ४';
  } else if (language === 'hi') {
    if (gate.id === 'gate-1' || gate.name.includes('Gate 1')) shortGateTitle = 'गेट १';
    else if (gate.id === 'gate-2' || gate.name.includes('Gate 2')) shortGateTitle = 'गेट २';
    else if (gate.id === 'gate-3' || gate.name.includes('Gate 3')) shortGateTitle = 'गेट ३';
    else if (gate.id === 'gate-4' || gate.name.includes('Gate 4')) shortGateTitle = 'गेट ४';
  }

  const sourceSubLabel = isLiveYolo
    ? language === 'mr'
      ? '(थेट एआय कॅमेरा)'
      : language === 'hi'
      ? '(लाइव एआई कैमरा)'
      : '(Real YOLO Data)'
    : language === 'mr'
    ? '(डेमो डेटा)'
    : language === 'hi'
    ? '(डेमो डेटा)'
    : '(Demo Data)';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridCard,
        pressed && onPress && styles.gridCardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${shortGateTitle}, ${statusLabel}`}
    >
      <View style={styles.gridTopRow}>
        <View style={[styles.gridIconCircle, { backgroundColor: iconBg }]}>
          <Text style={styles.gridIconSymbol}>+</Text>
        </View>
        <Text style={styles.gridGateTitle} numberOfLines={1}>
          {shortGateTitle}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.gridStateBox}>
          <ActivityIndicator size="small" color={KumbhColors.saffron} />
          <Text style={styles.gridLoadingText}>
            {language === 'mr' ? 'शोधत आहे...' : language === 'hi' ? 'खोज रहा है...' : 'Detecting...'}
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.gridContentBox}>
          <View style={styles.gridStatusRow}>
            <Text style={[styles.gridStatusValue, { color: iconBg }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.gridSourceLabel}>
            {language === 'mr' ? '(कॅमेरा ऑफलाइन)' : '(Camera Offline)'}
          </Text>
        </View>
      ) : (
        <View style={styles.gridContentBox}>
          <View style={styles.gridStatusRow}>
            <Text
              style={[
                styles.gridStatusValue,
                { color: iconBg },
              ]}
            >
              {isLiveYolo && gate.peopleCount !== undefined
                ? `${gate.peopleCount} ${peopleWord}`
                : statusLabel}
            </Text>
          </View>
          <Text style={styles.gridSourceLabel}>
            {sourceSubLabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    marginBottom: KumbhSpacing.md,
    ...KumbhShadow.sm,
    borderWidth: 1,
    borderColor: KumbhColors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: KumbhSpacing.sm,
  },
  gateName: {
    ...KumbhTypography.h4,
    color: KumbhColors.textPrimary,
  },
  peopleCount: {
    ...KumbhTypography.h2,
    color: KumbhColors.textPrimary,
    marginBottom: KumbhSpacing.sm,
  },
  updatedAt: {
    ...KumbhTypography.caption,
    color: KumbhColors.textMuted,
    marginTop: KumbhSpacing.sm,
  },
  stateContainer: {
    paddingVertical: KumbhSpacing.md,
    gap: KumbhSpacing.sm,
  },
  loadingText: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    fontSize: 14,
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: KumbhSpacing.sm,
  },
  offlineNoticeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: KumbhRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offlineNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  gridCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.md,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    justifyContent: 'space-between',
    minHeight: 96,
  },
  gridCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gridTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  gridIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconSymbol: {
    color: KumbhColors.white,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  gridGateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: KumbhColors.navy,
    flex: 1,
  },
  gridStateBox: {
    paddingVertical: 2,
    alignItems: 'flex-start',
  },
  gridLoadingText: {
    fontSize: 12,
    color: KumbhColors.textSecondary,
    marginTop: 2,
  },
  gridContentBox: {
    marginTop: 2,
  },
  gridStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridStatusValue: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  gridSourceLabel: {
    fontSize: 11,
    color: KumbhColors.textMuted,
    marginTop: 2,
  },
});
