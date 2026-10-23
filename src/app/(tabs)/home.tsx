import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '@/components/kumbh/BottomTabBar';
import { CrowdGridCard } from '@/components/kumbh/CrowdCard';
import { QuickActionsRow } from '@/components/kumbh/QuickAction';
import { SafetyStatusCard } from '@/components/kumbh/SafetyStatusCard';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import {
  MOCK_GATES,
  MOCK_USER,
  OVERALL_STATUS,
  SAFETY_TIP,
  GateData,
  INITIAL_MOCK_FAMILY,
  INITIAL_MOCK_ALERTS,
} from '@/data/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useGate1Crowd } from '@/hooks/useGate1Crowd';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getBackendAlerts } from '@/services/alertsApi';
import { getMyFamily } from '@/services/familyApi';
import { firebaseService } from '@/services/firebaseService';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, highContrast, textScale, language, setLanguage } = useSettings();
  const { userLocation } = useUserLocation();
  const { crowdData, isLoading, isError, errorMessage, lastUpdatedLabel, refetch } = useGate1Crowd(3500);

  // Real backend Gate 1 (YOLO detection) with localized names
  const gate1: GateData = {
    ...MOCK_GATES[0],
    name: language === 'mr' ? 'गेट १ (रामकुंड पश्चिम)' : language === 'hi' ? 'गेट १ (रामकुंड)' : MOCK_GATES[0].name,
    peopleCount: crowdData ? crowdData.people : 34,
    status: crowdData ? crowdData.density : 'LOW',
    updatedAt: isError
      ? (language === 'mr' ? 'कॅमेरा ऑफलाइन' : lastUpdatedLabel)
      : crowdData
      ? (language === 'mr' ? 'आत्ताच अद्यतनित (थेट)' : crowdData.updatedAt)
      : (language === 'mr' ? 'आत्ताच अद्यतनित' : 'Updated just now'),
  };

  const gate2: GateData = {
    ...MOCK_GATES[1],
    name: language === 'mr' ? 'गेट २ (तपोवन उत्तर)' : language === 'hi' ? 'गेट २ (तपोवन)' : MOCK_GATES[1].name,
  };
  const gate3: GateData = {
    ...MOCK_GATES[2],
    name: language === 'mr' ? 'गेट ३ (पंचवटी पूर्व)' : language === 'hi' ? 'गेट ३ (पंचवटी)' : MOCK_GATES[2].name,
  };
  const gate4: GateData = {
    ...(MOCK_GATES[3] || {
      id: 'gate-4',
      name: 'Gate 4',
      source: 'DEMO',
      status: 'HIGH',
      updatedAt: 'Demo data',
    }),
    name: language === 'mr' ? 'गेट ४ (गोदावरी दक्षिण)' : language === 'hi' ? 'गेट ४ (गोदावरी)' : 'Gate 4',
  };

  // Dynamic status based on live crowd data
  const overallSafetyStatus = gate1.status === 'HIGH' ? 'HIGH' : 'LOW';
  const overallSafetyTitle =
    gate1.status === 'HIGH'
      ? t.status.cautionTitle
      : language === 'mr'
      ? 'सुरक्षित स्थिती'
      : language === 'hi'
      ? 'सुरक्षित स्थिति'
      : 'Safe Conditions';
  const overallSafetyDesc =
    gate1.status === 'HIGH'
      ? language === 'mr'
        ? 'गेट १ वर जास्त गर्दी आढळली आहे. पर्यायी सुरक्षित मार्गाचा वापर करा.'
        : 'High congestion detected at Gate 1.'
      : language === 'mr'
      ? 'गर्दीची स्थिती नियंत्रणात आणि सुरळीत आहे.'
      : 'Crowd conditions are manageable.';

  const [unreadCount, setUnreadCount] = React.useState<number>(3);
  const [familyName, setFamilyName] = React.useState<string>(INITIAL_MOCK_FAMILY.groupName);
  const [connectedFamilyCount, setConnectedFamilyCount] = React.useState<number>(
    INITIAL_MOCK_FAMILY.members.filter((m) => m.status === 'SAFE').length
  );
  const [liveAuthorityAlert, setLiveAuthorityAlert] = React.useState<{
    id: string;
    title: string;
    message: string;
    severity?: string;
    location?: string;
    time: string;
  } | null>(null);

  // Real-time zero-latency online sync for authority advisories broadcasted from dashboard
  React.useEffect(() => {
    const unsub = firebaseService.subscribeToAlerts((fbAlerts) => {
      if (fbAlerts && fbAlerts.length > 0) {
        const top = fbAlerts[0];
        let timeLabel = language === 'mr' ? 'थेट' : language === 'hi' ? 'लाइव' : 'Live now';
        if (top.createdAt) {
          try {
            timeLabel = new Date(top.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch (_) {}
        }
        setLiveAuthorityAlert({
          id: top.id || 'live-authority-alert',
          title: top.title || 'Official Kumbh Alert',
          message: top.message || '',
          severity: top.severity || 'INFO',
          location: top.location,
          time: timeLabel,
        });
        setUnreadCount((prev) => Math.max(prev, fbAlerts.length));
      } else {
        setLiveAuthorityAlert(null);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [language]);

  React.useEffect(() => {
    async function loadQuickData() {
      if (user?.id) {
        try {
          const alerts = await getBackendAlerts(user.id);
          const unread = alerts.filter((a) => !a.is_read).length;
          setUnreadCount(unread > 0 ? unread : 3);
        } catch (_) {}

        try {
          const fam = await getMyFamily(user.id);
          if (fam.family) {
            setFamilyName(fam.family.name);
            setConnectedFamilyCount(fam.members.filter((m) => m.status === 'SAFE').length);
          }
        } catch (_) {}
      }
    }
    loadQuickData();
    const timer = setInterval(loadQuickData, 10000);
    return () => clearInterval(timer);
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. Top Header with Banner Art ──────────────────── */}
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.greetingBlock}>
                <Text
                  style={[
                    styles.greeting,
                    { fontSize: 20 * textScale },
                    highContrast && styles.highContrastText,
                  ]}
                >
                  {t.home.greeting}, {user?.name || (language === 'mr' ? 'भाविका' : language === 'hi' ? 'श्रद्धालु' : 'Pilgrim')} 🙏
                </Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationPin}>📍</Text>
                  <Text style={styles.locationLabel}>{t.common.nashikMela || 'नाशिक कुंभमेळा'}</Text>
                </View>
              </View>

              <View style={styles.headerRightCol}>
                {/* 🌐 Quick Language Switcher */}
                <View style={styles.langSwitchPill}>
                  <Pressable
                    style={[styles.langChip, language === 'en' && styles.langChipActive]}
                    onPress={() => setLanguage('en')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel="Switch to English"
                  >
                    <Text style={[styles.langChipText, language === 'en' && styles.langChipTextActive]}>
                      EN
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.langChip, language === 'hi' && styles.langChipActive]}
                    onPress={() => setLanguage('hi')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel="Switch to Hindi"
                  >
                    <Text style={[styles.langChipText, language === 'hi' && styles.langChipTextActive]}>
                      हिन्दी
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.langChip, language === 'mr' && styles.langChipActive]}
                    onPress={() => setLanguage('mr')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel="Switch to Marathi"
                  >
                    <Text style={[styles.langChipText, language === 'mr' && styles.langChipTextActive]}>
                      मराठी
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.profileIcon, pressed && styles.btnPressed]}
                  onPress={() => router.push('/(tabs)/profile')}
                  accessibilityLabel="View Profile"
                  accessibilityRole="button"
                >
                  <Text style={styles.profileEmoji}>👤</Text>
                </Pressable>
              </View>
            </View>

            {/* Sacred Temple & Ghats Skyline Banner */}
            <View style={styles.bannerArtWrapper}>
              <Image
                source={require('../../../assets/images/kumbh_home_banner.png')}
                style={styles.bannerArt}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerPill}>
                  <Text style={styles.bannerPillDot}>🪔</Text>
                  <Text style={styles.bannerPillText}>
                    {language === 'mr'
                      ? 'पवित्र गोदावरी घाट · रामकुंड'
                      : language === 'hi'
                      ? 'पवित्र गोदावरी घाट · रामकुंड'
                      : 'Sacred Godavari Ghats · Ramkund'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── LIVE AUTHORITY BROADCAST ADVISORY BANNER (Real-time Online Sync) ── */}
          {liveAuthorityAlert && (
            <Pressable
              style={styles.liveBroadcastBanner}
              onPress={() => router.push('/(tabs)/alerts')}
              accessibilityRole="button"
              accessibilityLabel="Official Authority Advisory"
            >
              <View style={styles.liveBroadcastTop}>
                <View style={styles.liveBroadcastBadgeRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.liveBroadcastBadgeText}>
                    {language === 'mr'
                      ? '🔴 शासकीय थेट प्रसारण (LIVE)'
                      : language === 'hi'
                      ? '🔴 शासन लाइव प्रसारण (LIVE)'
                      : '🔴 OFFICIAL LIVE ADVISORY'}
                  </Text>
                </View>
                <Text style={styles.liveBroadcastTime}>{liveAuthorityAlert.time}</Text>
              </View>
              <Text style={styles.liveBroadcastTitle}>{liveAuthorityAlert.title}</Text>
              <Text style={styles.liveBroadcastMsg} numberOfLines={2}>
                {liveAuthorityAlert.message}
              </Text>
              <View style={styles.liveBroadcastFooter}>
                {liveAuthorityAlert.location ? (
                  <Text style={styles.liveBroadcastLoc}>📍 {liveAuthorityAlert.location}</Text>
                ) : (
                  <View />
                )}
                <Text style={styles.liveBroadcastAction}>
                  {language === 'mr' ? 'तपशील पहा →' : language === 'hi' ? 'विवरण देखें →' : 'View advisory →'}
                </Text>
              </View>
            </Pressable>
          )}

          {/* ── 2. Current Safety Status Card ─────────────────── */}
          <View style={styles.sectionMargin}>
            <SafetyStatusCard
              status={overallSafetyStatus}
              title={overallSafetyTitle}
              description={overallSafetyDesc}
              highContrast={highContrast}
              onPress={() => router.push('/crowd-monitor')}
            />
          </View>

          {/* ── 3. Crowd Around You (2x2 Grid) ───────────────── */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.crowdTitleRow}>
                <Text style={styles.sectionTitle}>{t.home.crowdAroundYou}</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{t.common.live || 'थेट'}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/crowd-monitor')}
                accessibilityLabel="View all crowd gates"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAllLink}>{t.common.seeAll}</Text>
              </Pressable>
            </View>

            {/* 2x2 Grid of Gates matching reference */}
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <CrowdGridCard
                  gate={gate1}
                  isLoading={isLoading}
                  isError={isError}
                  errorMessage={errorMessage}
                  onRetry={refetch}
                  onPress={() => router.push('/crowd-monitor')}
                />
                <CrowdGridCard
                  gate={gate2}
                  onPress={() => router.push('/crowd-monitor')}
                />
              </View>
              <View style={styles.gridRow}>
                <CrowdGridCard
                  gate={gate3}
                  onPress={() => router.push('/crowd-monitor')}
                />
                <CrowdGridCard
                  gate={gate4}
                  onPress={() => router.push('/crowd-monitor')}
                />
              </View>
            </View>
          </View>

          {/* ── 4. Quick Actions (4-Tile Row) ─────────────────── */}
          <View style={styles.sectionMargin}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.home.quickActions}</Text>
            </View>

            <QuickActionsRow
              actions={[
                {
                  icon: '📍',
                  label: t.home.safeRoute,
                  variant: 'route',
                  onPress: () => router.push('/safe-route'),
                },
                {
                  icon: '👥',
                  label: t.home.family,
                  variant: 'family',
                  onPress: () => router.push('/family' as any),
                },
                {
                  icon: '➕',
                  label: t.home.emergency,
                  variant: 'emergency',
                  onPress: () => router.push('/emergency'),
                },
                {
                  icon: '🔔',
                  label: t.home.alerts,
                  variant: 'alerts',
                  badgeCount: unreadCount,
                  onPress: () => router.push('/(tabs)/alerts'),
                },
              ]}
            />

            {/* Essential Services Row: Medical, Police, Camera Monitor, Google Maps */}
            <View style={styles.servicesRow}>
              <Pressable
                style={({ pressed }) => [styles.serviceCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/medical-help')}
                accessibilityLabel="Medical Help"
                accessibilityRole="button"
              >
                <Text style={styles.serviceIcon}>🏥</Text>
                <Text style={styles.serviceTitle}>
                  {t.home.medicalHelp || (language === 'mr' ? 'वैद्यकीय मदत' : 'Medical Help')}
                </Text>
                <Text style={styles.serviceSub}>
                  {language === 'mr' ? '१०८ रुग्णवाहिका' : language === 'hi' ? '१०८ एम्बुलेंस' : '108 Ambulance'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.serviceCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/police-help')}
                accessibilityLabel="Police Help"
                accessibilityRole="button"
              >
                <Text style={styles.serviceIcon}>👮</Text>
                <Text style={styles.serviceTitle}>
                  {language === 'mr' ? 'पोलीस मदत' : language === 'hi' ? 'पुलिस सहायता' : 'Police Help'}
                </Text>
                <Text style={styles.serviceSub}>
                  {language === 'mr' ? '११२ हेल्पलाईन' : language === 'hi' ? '११२ हेल्पलाइन' : '112 Helpline'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.serviceCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/crowd-monitor')}
                accessibilityLabel="Live Crowd Monitor"
                accessibilityRole="button"
              >
                <Text style={styles.serviceIcon}>📊</Text>
                <Text style={styles.serviceTitle}>
                  {language === 'mr' ? 'गर्दी नियंत्रण' : language === 'hi' ? 'भीड़ नियंत्रण' : 'Crowd Monitor'}
                </Text>
                <Text style={styles.serviceSub}>
                  {language === 'mr' ? 'थेट एआय कॅमेरे' : language === 'hi' ? 'लाइव एआई कैमरा' : 'YOLO Cameras'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.serviceCard, pressed && styles.btnPressed]}
                onPress={() => router.push('/safe-route')}
                accessibilityLabel="Safe Route Navigation"
                accessibilityRole="button"
              >
                <Text style={styles.serviceIcon}>🧭</Text>
                <Text style={styles.serviceTitle}>
                  {t.home.safeRoute || (language === 'mr' ? 'सुरक्षित मार्ग' : 'Safe Routes')}
                </Text>
                <Text style={styles.serviceSub}>
                  {language === 'mr' ? 'थेट नकाशा' : language === 'hi' ? 'लाइव मैप' : 'In-App Guide'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── 5. Family Status Card ──────────────────────────── */}
          <View style={styles.sectionMargin}>
            <View style={styles.familyCard}>
              <View style={styles.familyCardContent}>
                <View style={styles.familyIconBox}>
                  <Text style={styles.familyIcon}>👨‍👩‍👧</Text>
                </View>
                <View style={styles.familyTextCol}>
                  <Text style={styles.familyName}>{familyName}</Text>
                  <Text style={styles.familySummary}>
                    🟢 {connectedFamilyCount} {t.home.membersConnected} · {t.home.allSafe}
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.viewFamilyBtn, pressed && styles.btnPressed]}
                onPress={() => router.push('/family' as any)}
                accessibilityRole="button"
                accessibilityLabel="View family members and status"
              >
                <Text style={styles.viewFamilyBtnText}>{t.home.viewFamily} →</Text>
              </Pressable>
            </View>
          </View>

          {/* ── 6. Pilgrim Guidance Tip ───────────────────────── */}
          <View style={styles.safetyTipCard}>
            <View style={styles.safetyTipHeader}>
              <Text style={styles.safetyTipIcon}>💡</Text>
              <Text style={styles.safetyTipTitle}>{t.home.safetyTipTitle}</Text>
            </View>
            <Text style={styles.safetyTipText}>{t.home.safetyTip}</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Bottom Tab Bar ───────────────────────────────── */}
        <BottomTabBar unreadAlertsCount={unreadCount} />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: KumbhSpacing.sm,
  },

  // Top header card with subtle skyline
  headerCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    marginBottom: KumbhSpacing.md,
    ...KumbhShadow.sm,
  },

  // Real-time live authority advisory banner
  liveBroadcastBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: KumbhRadius.lg,
    borderWidth: 1.5,
    borderColor: '#F87171',
    padding: KumbhSpacing.base,
    marginBottom: KumbhSpacing.md,
    ...KumbhShadow.md,
  },
  liveBroadcastTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveBroadcastBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  liveBroadcastBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
    letterSpacing: 0.5,
  },
  liveBroadcastTime: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
  },
  liveBroadcastTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  liveBroadcastMsg: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  liveBroadcastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  liveBroadcastLoc: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '700',
  },
  liveBroadcastAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: KumbhSpacing.base,
    paddingBottom: KumbhSpacing.sm,
  },
  greetingBlock: {
    flex: 1,
  },
  greeting: {
    fontWeight: '800',
    color: KumbhColors.navy,
    letterSpacing: -0.3,
  },
  highContrastText: {
    color: '#000000',
    fontWeight: '900',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationPin: {
    fontSize: 12,
  },
  locationLabel: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
    fontWeight: '500',
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  bannerArtWrapper: {
    width: '100%',
    height: 125,
    backgroundColor: '#FFF0E8',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerArt: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 12,
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 59, 93, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: KumbhRadius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bannerPillDot: {
    fontSize: 11,
  },
  bannerPillText: {
    color: KumbhColors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Section Margins & Headers
  sectionMargin: {
    marginBottom: KumbhSpacing.base,
  },
  sectionHeader: {
    marginBottom: KumbhSpacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: KumbhSpacing.sm,
  },
  crowdTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  liveBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: KumbhColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  seeAllLink: {
    fontSize: 13,
    color: KumbhColors.saffron,
    fontWeight: '700',
  },

  // 2x2 Grid
  gridContainer: {
    gap: KumbhSpacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: KumbhSpacing.sm,
  },

  // Family Card
  familyCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    gap: KumbhSpacing.md,
  },
  familyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KumbhSpacing.md,
  },
  familyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyIcon: {
    fontSize: 22,
  },
  familyTextCol: {
    flex: 1,
    gap: 2,
  },
  familyName: {
    fontSize: 15,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  familySummary: {
    fontSize: 12,
    color: KumbhColors.statusLow,
    fontWeight: '600',
  },
  viewFamilyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  viewFamilyBtnText: {
    fontSize: 13,
    color: KumbhColors.saffron,
    fontWeight: '700',
  },

  // Pilgrim guidance
  safetyTipCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    marginBottom: KumbhSpacing.base,
  },
  safetyTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  safetyTipIcon: {
    fontSize: 16,
  },
  safetyTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  safetyTipText: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
    lineHeight: 18,
  },

  btnPressed: {
    opacity: 0.8,
  },
  bottomSpacer: {
    height: 24,
  },
  // Header Language Switcher
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langSwitchPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: KumbhRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: KumbhRadius.full,
  },
  langChipActive: {
    backgroundColor: KumbhColors.primary,
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  langChipTextActive: {
    color: KumbhColors.white,
    fontWeight: '800',
  },
  // Essential services row
  servicesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    alignItems: 'center',
    gap: 2,
    ...KumbhShadow.sm,
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: KumbhColors.textPrimary,
    textAlign: 'center',
  },
  serviceSub: {
    fontSize: 9,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
  },
});
