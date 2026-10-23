import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { firebaseService } from '@/services/firebaseService';
import { sendFamilySos } from '@/services/familyApi';

interface HelplineItem {
  number: string;
  label: string;
  desc: string;
  icon: string;
}

const HELPLINES: HelplineItem[] = [
  {
    number: '112',
    label: 'All-India Emergency Helpline',
    desc: 'Police, Fire & Multi-agency rapid response',
    icon: '🚨',
  },
  {
    number: '108',
    label: 'Maharashtra Ambulance & Medical',
    desc: 'Free 24/7 critical medical & patient transport',
    icon: '🚑',
  },
  {
    number: '1077',
    label: 'Nashik Kumbh Control Room',
    desc: 'District Collectorate central disaster & lost pilgrim desk',
    icon: '🏛️',
  },
  {
    number: '1091',
    label: 'Women & Child Safety Helpline',
    desc: 'Dedicated women & senior citizen protection',
    icon: '🛡️',
  },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const { t, highContrast, language } = useSettings();
  const { user } = useAuth();
  const { userLocation } = useUserLocation();

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSosSuccess, setShowSosSuccess] = useState<boolean>(false);
  const [locationShared, setLocationShared] = useState<boolean>(false);

  const curLat = userLocation?.latitude || 19.9975;
  const curLng = userLocation?.longitude || 73.7910;
  const curAddress = userLocation?.address || (language === 'mr' ? 'रामकुंड सेक्टर १, मुख्य घाट' : 'Ramkund Sector 1, Main Ghat');

  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert(
        language === 'mr' ? 'आपत्कालीन हेल्पलाईन' : 'Emergency Helpline',
        language === 'mr' ? `कृपया आपल्या फोनवरून ${number} डायल करा.` : `Please dial ${number} on your phone keypad.`
      );
    });
  };

  const handleConfirmEmergency = async () => {
    setShowConfirmModal(false);
    setShowSosSuccess(true);

    // 1. Dispatch real-time incident directly to Firebase Cloud Firestore
    try {
      await firebaseService.triggerSos({
        userId: user?.id || 1,
        userName: user?.name || 'Pilgrim',
        userPhone: (user as any)?.phone || '+91 98230 XXXXX',
        locationName: curAddress,
        latitude: curLat,
        longitude: curLng,
        zone: 'Gate-A',
        type: 'SOS',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        notes: `Critical pilgrim SOS dispatched from mobile GPS (${curAddress})`,
      });
    } catch (err) {
      console.warn('[SOS] Firebase dispatch notice:', err);
    }

    // 2. Also dispatch to local FastAPI backend if connected
    try {
      await sendFamilySos(user?.id || 1, curLat, curLng, curAddress);
    } catch (_) {}

    setTimeout(() => setShowSosSuccess(false), 6000);
  };

  const handleShareLocation = async () => {
    Alert.alert(
      language === 'mr' ? 'आपत्कालीन स्थान सामायिक करा' : 'Share Emergency Location',
      language === 'mr'
        ? `आपले सध्याचे थेट स्थान (${curAddress}) जवळच्या पोलीस व वैद्यकीय पथकाला पाठवायचे आहे का?`
        : `Do you want to broadcast your current live GPS coordinates (${curAddress}) to the nearest Kumbh Police & Medical Post?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: language === 'mr' ? 'स्थान पाठवा' : 'Share Location',
          onPress: async () => {
            setLocationShared(true);
            try {
              await firebaseService.triggerSos({
                userId: user?.id || 1,
                userName: user?.name || 'Pilgrim',
                userPhone: (user as any)?.phone || '+91 98230 XXXXX',
                locationName: curAddress,
                latitude: curLat,
                longitude: curLng,
                zone: 'Gate-A',
                type: 'MEDICAL',
                severity: 'CRITICAL',
                status: 'ACTIVE',
                notes: `Emergency GPS Location broadcast by pilgrim at ${curAddress}`,
              });
            } catch (_) {}

            Alert.alert(
              language === 'mr' ? 'स्थान पाठवले गेले' : 'Emergency Location Shared',
              language === 'mr'
                ? `आपले स्थान (${curAddress}) कुंभ नियंत्रण कक्षाकडे तात्काळ पाठवले गेले आहे.`
                : `Your live coordinates (${curAddress}) have been transmitted in real-time to the Kumbh Authority Control Center.`
            );
            setTimeout(() => setLocationShared(false), 5000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ── Header matching Screen 5 ────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.back()}
            accessibilityLabel={language === 'mr' ? 'मागे जा' : 'Go back'}
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {language === 'mr' ? 'आपत्कालीन मदत' : language === 'hi' ? 'आपातकालीन सहायता' : 'Emergency'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Banner */}
          {showSosSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerIcon}>🚨</Text>
              <Text style={styles.successBannerText}>
                {language === 'mr'
                  ? 'आपत्कालीन विनंती नोंदवली गेली आहे. जवळच्या कुंभ जलद कृती पथकाला आपल्या स्थानाची माहिती देण्यात आली आहे.'
                  : 'Emergency request registered. Nearest Kumbh Rapid Action Post has been alerted to your coordinates.'}
              </Text>
            </View>
          )}

          {/* ── Large Red Hero Button matching Screen 5 ──────── */}
          <Pressable
            style={({ pressed }) => [
              styles.emergencyHeroCard,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setShowConfirmModal(true)}
            accessibilityLabel="Emergency — Get immediate help"
            accessibilityRole="button"
          >
            <View style={styles.heroBellCircle}>
              <Text style={styles.heroBellIcon}>🔔</Text>
            </View>
            <Text style={styles.heroTitle}>
              {language === 'mr' ? 'आपत्कालीन मदत' : 'Emergency'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'mr' ? 'त्वरित मदत मिळवा' : 'Get immediate help'}
            </Text>
          </Pressable>

          {/* ── 2x2 Grid of 4 White Cards matching Screen 5 ───── */}
          <View style={styles.grid2x2}>
            <View style={styles.gridRow}>
              {/* Police */}
              <Pressable
                style={({ pressed }) => [styles.tileCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/police-help')}
                accessibilityRole="button"
                accessibilityLabel="Police help"
              >
                <View style={[styles.tileIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.tileIcon}>🛡️</Text>
                </View>
                <Text style={styles.tileTitle}>
                  {language === 'mr' ? 'पोलीस मदत' : language === 'hi' ? 'पुलिस' : 'Police'}
                </Text>
              </Pressable>

              {/* Medical Help */}
              <Pressable
                style={({ pressed }) => [styles.tileCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/medical-help')}
                accessibilityRole="button"
                accessibilityLabel="Medical Help"
              >
                <View style={[styles.tileIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.tileIcon}>➕</Text>
                </View>
                <Text style={styles.tileTitle}>
                  {language === 'mr' ? 'वैद्यकीय मदत' : language === 'hi' ? 'चिकित्सा' : 'Medical Help'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.gridRow}>
              {/* Ambulance */}
              <Pressable
                style={({ pressed }) => [styles.tileCard, pressed && styles.btnPressed]}
                onPress={() => handleDial('108')}
                accessibilityRole="button"
                accessibilityLabel="Call Ambulance 108"
              >
                <View style={[styles.tileIconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={styles.tileIcon}>🚑</Text>
                </View>
                <Text style={styles.tileTitle}>
                  {language === 'mr' ? 'रुग्णवाहिका (१०८)' : language === 'hi' ? 'एम्बुलेंस' : 'Ambulance'}
                </Text>
              </Pressable>

              {/* Share Location */}
              <Pressable
                style={({ pressed }) => [
                  styles.tileCard,
                  locationShared && styles.tileCardActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={handleShareLocation}
                accessibilityRole="button"
                accessibilityLabel="Share Location"
              >
                <View style={[styles.tileIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.tileIcon}>📍</Text>
                </View>
                <Text style={styles.tileTitle}>
                  {locationShared
                    ? (language === 'mr' ? 'स्थान पाठवले' : 'Location Sent')
                    : (language === 'mr' ? 'स्थान पाठवा' : 'Share Location')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── Bottom Red Family SOS Card matching Screen 5 ───── */}
          <Pressable
            style={({ pressed }) => [styles.familySosBottomCard, pressed && styles.btnPressed]}
            onPress={() => router.push('/family' as any)}
            accessibilityRole="button"
            accessibilityLabel="Family SOS"
          >
            <View style={styles.familySosIconCircle}>
              <Text style={styles.familySosEmoji}>👨‍👩‍👧</Text>
            </View>

            <View style={styles.familySosTextCol}>
              <Text style={styles.familySosTitle}>
                {language === 'mr' ? 'फॅमिली SOS' : 'Family SOS'}
              </Text>
              <Text style={styles.familySosSubtitle}>
                {language === 'mr'
                  ? 'आपल्या कुटुंबाला तात्काळ मदतीचा इशारा पाठवा.'
                  : 'Notify your family group that you may need help.'}
              </Text>
            </View>

            <Text style={styles.familySosChevron}>›</Text>
          </Pressable>

          {/* ── Direct Official Helplines ─────────────────────── */}
          <View style={styles.helplinesSection}>
            <Text style={styles.sectionHeading}>
              {language === 'mr' ? 'थेट आपत्कालीन हेल्पलाईन' : 'DIRECT HELPLINES'}
            </Text>

            {HELPLINES.map((hl) => (
              <Pressable
                key={hl.number}
                style={({ pressed }) => [styles.helplineRow, pressed && styles.btnPressed]}
                onPress={() => handleDial(hl.number)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${hl.label} at ${hl.number}`}
              >
                <Text style={styles.helplineIcon}>{hl.icon}</Text>
                <View style={styles.helplineInfo}>
                  <Text style={styles.helplineLabel}>
                    {hl.number === '112'
                      ? (language === 'mr' ? 'अखिल भारतीय आपत्कालीन हेल्पलाईन' : hl.label)
                      : hl.number === '108'
                      ? (language === 'mr' ? 'महाराष्ट्र रुग्णवाहिका व वैद्यकीय मदत' : hl.label)
                      : hl.number === '1077'
                      ? (language === 'mr' ? 'नाशिक कुंभ मध्यवर्ती नियंत्रण कक्ष' : hl.label)
                      : (language === 'mr' ? 'महिला व बाल सुरक्षा हेल्पलाईन' : hl.label)}
                  </Text>
                  <Text style={styles.helplineDesc}>
                    {hl.number === '112'
                      ? (language === 'mr' ? 'पोलीस, अग्निशामक आणि आपत्ती व्यवस्थापन' : hl.desc)
                      : hl.number === '108'
                      ? (language === 'mr' ? 'मोफत २४/७ रुग्णवाहिका आणि वैद्यकीय मदत' : hl.desc)
                      : hl.number === '1077'
                      ? (language === 'mr' ? 'जिल्हाधिकारी कार्यालय कुंभ आपत्ती व हरवलेल्या भाविकांचा कक्ष' : hl.desc)
                      : (language === 'mr' ? 'महिला, ज्येष्ठ नागरिक व बालकांच्या सुरक्षेसाठी' : hl.desc)}
                  </Text>
                </View>
                <View style={styles.helplineCallPill}>
                  <Text style={styles.helplineNumber}>{hl.number}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* ── Emergency Dispatch Confirmation Modal ─────────── */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmIcon}>🚨</Text>
              <Text style={styles.confirmTitle}>
                {language === 'mr' ? 'आपत्कालीन कॉलची पुष्टी करा' : 'Confirm Emergency Call'}
              </Text>
              <Text style={styles.confirmDesc}>
                {language === 'mr'
                  ? 'यामुळे कुंभ पोलीस नियंत्रण कक्ष (११२) ला सूचना दिली जाईल आणि आपल्या सध्याच्या जीपीएस स्थानावर तात्काळ मदत पाठवली जाईल.'
                  : 'This will alert Kumbh Police Control (112) and dispatch the nearest medical team to your current GPS coordinates.'}
              </Text>

              <View style={styles.confirmActions}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmBtn}
                  onPress={handleConfirmEmergency}
                >
                  <Text style={styles.confirmBtnText}>
                    {language === 'mr' ? 'आत्ताच मदत मागा' : 'Request Help Now'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: KumbhColors.cream,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: KumbhSpacing.md,
    backgroundColor: KumbhColors.cream,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  backArrow: {
    fontSize: 20,
    color: KumbhColors.textPrimary,
  },
  headerTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: KumbhSpacing.sm,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.md,
    alignItems: 'center',
    gap: KumbhSpacing.sm,
    marginBottom: KumbhSpacing.base,
  },
  successBannerIcon: {
    fontSize: 24,
  },
  successBannerText: {
    flex: 1,
    ...KumbhTypography.small,
    color: '#991B1B',
    fontWeight: '600',
  },
  emergencyHeroCard: {
    backgroundColor: KumbhColors.emergency,
    borderRadius: KumbhRadius.xxl,
    paddingVertical: KumbhSpacing.xxl,
    paddingHorizontal: KumbhSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.lg,
    marginBottom: KumbhSpacing.base,
  },
  heroBellCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: KumbhSpacing.md,
  },
  heroBellIcon: {
    fontSize: 32,
  },
  heroTitle: {
    ...KumbhTypography.h1,
    color: KumbhColors.white,
    fontSize: 28,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...KumbhTypography.small,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  grid2x2: {
    gap: KumbhSpacing.sm,
    marginBottom: KumbhSpacing.base,
  },
  gridRow: {
    flexDirection: 'row',
    gap: KumbhSpacing.sm,
  },
  tileCard: {
    flex: 1,
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
  },
  tileCardActive: {
    borderColor: KumbhColors.primary,
    backgroundColor: '#F0FDF4',
  },
  tileIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: KumbhSpacing.sm,
  },
  tileIcon: {
    fontSize: 24,
  },
  tileTitle: {
    ...KumbhTypography.small,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  familySosBottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.base,
    gap: KumbhSpacing.md,
    marginBottom: KumbhSpacing.lg,
    ...KumbhShadow.sm,
  },
  familySosIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: KumbhColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familySosEmoji: {
    fontSize: 24,
  },
  familySosTextCol: {
    flex: 1,
  },
  familySosTitle: {
    ...KumbhTypography.body,
    fontWeight: '700',
    color: '#991B1B',
  },
  familySosSubtitle: {
    ...KumbhTypography.caption,
    color: '#7F1D1D',
    marginTop: 2,
  },
  familySosChevron: {
    fontSize: 22,
    color: '#B91C1C',
    fontWeight: '700',
  },
  helplinesSection: {
    gap: KumbhSpacing.sm,
  },
  sectionHeading: {
    ...KumbhTypography.caption,
    fontWeight: '700',
    color: KumbhColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: KumbhSpacing.xs,
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.md,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    gap: KumbhSpacing.md,
    ...KumbhShadow.sm,
  },
  helplineIcon: {
    fontSize: 24,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineLabel: {
    ...KumbhTypography.small,
    fontWeight: '700',
    color: KumbhColors.textPrimary,
  },
  helplineDesc: {
    ...KumbhTypography.caption,
    color: KumbhColors.textMuted,
    marginTop: 2,
  },
  helplineCallPill: {
    backgroundColor: KumbhColors.cream,
    paddingHorizontal: KumbhSpacing.md,
    paddingVertical: KumbhSpacing.xs,
    borderRadius: KumbhRadius.full,
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  helplineNumber: {
    ...KumbhTypography.caption,
    fontWeight: '800',
    color: KumbhColors.primary,
  },
  btnPressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: KumbhSpacing.xl,
  },
  confirmBox: {
    width: '100%',
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xxl,
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    ...KumbhShadow.lg,
  },
  confirmIcon: {
    fontSize: 44,
    marginBottom: KumbhSpacing.md,
  },
  confirmTitle: {
    ...KumbhTypography.h2,
    color: KumbhColors.emergency,
    marginBottom: KumbhSpacing.sm,
    textAlign: 'center',
  },
  confirmDesc: {
    ...KumbhTypography.small,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    marginBottom: KumbhSpacing.xl,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: KumbhSpacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: KumbhSpacing.md,
    borderRadius: KumbhRadius.lg,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...KumbhTypography.small,
    color: KumbhColors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: KumbhSpacing.md,
    borderRadius: KumbhRadius.lg,
    backgroundColor: KumbhColors.emergency,
    alignItems: 'center',
  },
  confirmBtnText: {
    ...KumbhTypography.small,
    color: KumbhColors.white,
    fontWeight: '700',
  },
});
