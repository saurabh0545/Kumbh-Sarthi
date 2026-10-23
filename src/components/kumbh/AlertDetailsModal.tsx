import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { AlertItem } from '@/components/kumbh/AlertCard';
import { useSettings } from '@/context/SettingsContext';

interface AlertDetailsModalProps {
  visible: boolean;
  alert: AlertItem | null;
  onClose: () => void;
  onNavigateRoute?: (alert: AlertItem) => void;
  onViewMap?: (alert: AlertItem) => void;
  onShareFamily?: (alert: AlertItem) => void;
}

export function AlertDetailsModal({
  visible,
  alert,
  onClose,
  onNavigateRoute,
  onViewMap,
  onShareFamily,
}: AlertDetailsModalProps) {
  const { t, highContrast, language } = useSettings();

  if (!alert) return null;

  const isCritical =
    alert.severity === 'CRITICAL' || alert.type === 'emergency' || alert.type === 'crowd';
  const isWarning = alert.severity === 'WARNING' || alert.type === 'safety';
  const isFamily = alert.type === 'family';

  let headerBg = '#EFF6FF';
  let badgeColor = '#2563EB';
  let severityLabel = t.alerts.severityInfo;
  let icon = 'ℹ️';

  if (isCritical) {
    headerBg = '#FEF2F2';
    badgeColor = '#DC2626';
    severityLabel = t.alerts.severityCritical;
    icon = '🚨';
  } else if (isWarning) {
    headerBg = '#FFFBEB';
    badgeColor = '#D97706';
    severityLabel = t.alerts.severityWarning;
    icon = '⚠️';
  } else if (isFamily) {
    headerBg = '#FAF5FF';
    badgeColor = '#9333EA';
    severityLabel = t.alerts.filterFamily;
    icon = '👨‍👩‍👧';
  }

  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(() => {});
  };

  const handleCallMedical = () => {
    Linking.openURL('tel:108').catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.modalCard, highContrast && styles.highContrastCard]}>
          {/* Header Banner */}
          <View style={[styles.headerBanner, { backgroundColor: headerBg }]}>
            <View style={styles.headerTopRow}>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{severityLabel}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
                onPress={onClose}
                accessibilityLabel="Close alert details"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.iconBig}>{icon}</Text>
              <View style={styles.titleCol}>
                <Text style={styles.titleText}>{alert.title || alert.type.toUpperCase()}</Text>
                <Text style={styles.metaTime}>
                  🕒 {t.alerts.timestamp}: {alert.time}
                </Text>
              </View>
            </View>

            {alert.location && (
              <View style={styles.locationPill}>
                <Text style={styles.locPinIcon}>📍</Text>
                <Text style={styles.locText}>
                  {t.alerts.affectedZone}: {alert.location}
                </Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Detailed Advisory Message */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>{t.alerts.officialGuidance}</Text>
              <Text style={styles.messageBody}>{alert.message}</Text>
            </View>

            {/* Practical Devotee Guidance Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>{t.alerts.actionsTitle}</Text>
              <View style={styles.checklist}>
                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>🛡️</Text>
                  <Text style={styles.checkText}>
                    {language === 'mr'
                      ? isCritical
                        ? 'स्वयंसेवक बायपास मार्गांचा वापर करा व गर्दीच्या ठिकाणी जाणे टाळा.'
                        : 'रांगेचे नियम पाळा आणि लहान मुलांना सोबत ठेवा.'
                      : isCritical
                      ? 'Follow volunteer bypass corridors and avoid bottleneck choke points.'
                      : 'Maintain designated queue discipline and keep children close.'}
                  </Text>
                </View>

                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>💧</Text>
                  <Text style={styles.checkText}>
                    {language === 'mr'
                      ? '१००-२०० मीटर अंतरावर मोफत पिण्याचे पाणी व ओआरएस (ORS) केंद्र उपलब्ध आहेत.'
                      : 'Free drinking water & ORS booths are operating within 100-200 meters.'}
                  </Text>
                </View>

                <View style={styles.checkItem}>
                  <Text style={styles.checkIcon}>👮</Text>
                  <Text style={styles.checkText}>
                    {language === 'mr'
                      ? 'पोलीस व सुरक्षा पथके गर्दीचे नियंत्रण व नियमन करत आहेत.'
                      : 'Police marshals and rapid action teams are actively regulating flow.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Action Navigation Buttons */}
            <View style={styles.actionsGrid}>
              {onNavigateRoute && (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryActionBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onNavigateRoute(alert)}
                >
                  <Text style={styles.actionBtnIcon}>🗺️</Text>
                  <Text style={styles.primaryActionBtnText}>
                    {t.alerts.getRouteToAlert}
                  </Text>
                </Pressable>
              )}

              {onViewMap && (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryActionBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onViewMap(alert)}
                >
                  <Text style={styles.actionBtnIcon}>📍</Text>
                  <Text style={styles.secondaryActionBtnText}>
                    {t.alerts.viewOnLiveMap}
                  </Text>
                </Pressable>
              )}

              {onShareFamily && (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryActionBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onShareFamily(alert)}
                >
                  <Text style={styles.actionBtnIcon}>👨‍👩‍👧</Text>
                  <Text style={styles.secondaryActionBtnText}>
                    {t.alerts.shareWithFamily}
                  </Text>
                </Pressable>
              )}

              {isCritical && (
                <View style={styles.emergencyRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.emergencyBtn,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleCallEmergency}
                  >
                    <Text style={styles.emergencyBtnText}>{t.alerts.callEmergency}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.medicalBtn,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleCallMedical}
                  >
                    <Text style={styles.medicalBtnText}>{t.alerts.callMedical}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Close Bar */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Text style={styles.doneBtnText}>{t.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...KumbhShadow.lg,
  },
  highContrastCard: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  headerBanner: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.sm,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBig: {
    fontSize: 28,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  metaTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  locPinIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  locText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollBody: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  messageBody: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    fontWeight: '500',
  },
  checklist: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkIcon: {
    fontSize: 15,
    marginTop: 1,
  },
  checkText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  actionsGrid: {
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryActionBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...KumbhShadow.sm,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryActionBtnText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  medicalBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
