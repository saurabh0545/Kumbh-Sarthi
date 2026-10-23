import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertCard, AlertItem } from '@/components/kumbh/AlertCard';
import { AlertDetailsModal } from '@/components/kumbh/AlertDetailsModal';
import { BottomTabBar } from '@/components/kumbh/BottomTabBar';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { INITIAL_MOCK_ALERTS } from '@/data/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  getBackendAlerts,
  markAlertRead,
  markAllAlertsRead,
} from '@/services/alertsApi';
import { firebaseService } from '@/services/firebaseService';

type AlertCategoryType = 'all' | 'crowd' | 'safety' | 'emergency' | 'family' | 'info';

export default function AlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, highContrast, language } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState<AlertCategoryType>('all');
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<AlertItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);

  const MARATHI_MOCK_ALERTS: Record<string, { title: string; message: string; location: string; time: string }> = {
    'alert-1': {
      title: 'माहिती व सूचना',
      message: 'गेट ३ (पंचवटी) येथे सध्या गर्दी कमी आहे.',
      location: 'गेट ३',
      time: '२ मिनिटांपूर्वी',
    },
    'alert-2': {
      title: 'गर्दीची सूचना',
      message: 'गेट २ कडे गर्दी वाढत आहे. कृपया पर्यायी मार्गाचा वापर करा.',
      location: 'गेट २',
      time: '१२ मिनिटांपूर्वी',
    },
    'alert-3': {
      title: 'महत्त्वाचा इशारा',
      message: 'गेट १ (रामकुंड) येथे सध्या मोठी गर्दी आहे. कृपया मुख्य मार्गाचा वापर टाळा.',
      location: 'गेट १',
      time: '१८ मिनिटांपूर्वी',
    },
    'alert-4': {
      title: 'कुटुंब सूचना',
      message: 'आरव कुंभमेळा क्षेत्रात दाखल झाले आहेत.',
      location: 'कुटुंब',
      time: '३२ मिनिटांपूर्वी',
    },
    'alert-5': {
      title: 'स्वागत संदेश',
      message: 'नाशिक कुंभमेळ्यात आपले सहर्ष स्वागत आहे! सुरक्षित रहा.',
      location: 'नाशिक',
      time: '१ तासापूर्वी',
    },
  };

  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    INITIAL_MOCK_ALERTS.map((a) => {
      const isMr = language === 'mr';
      const mr = isMr ? MARATHI_MOCK_ALERTS[a.id] : undefined;
      return {
        id: a.id,
        type: a.type as any,
        title: mr ? mr.title : a.title,
        message: mr ? mr.message : a.message,
        time: mr ? mr.time : a.time,
        location: mr ? mr.location : a.location,
        isRead: a.isRead,
        isDemo: false,
        isAuthorityBroadcast: false,
      };
    })
  );

  useEffect(() => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (language === 'mr' && MARATHI_MOCK_ALERTS[a.id]) {
          const mr = MARATHI_MOCK_ALERTS[a.id];
          return {
            ...a,
            title: mr.title,
            message: mr.message,
            location: mr.location,
            time: mr.time,
          };
        }
        return a;
      })
    );
  }, [language]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const liveAlerts = await getBackendAlerts(user?.id);
      if (liveAlerts && liveAlerts.length > 0) {
        const mapped: AlertItem[] = liveAlerts.map((ba) => {
          const rawType = (ba.type || '').toUpperCase();
          let alertType: 'crowd' | 'safety' | 'emergency' | 'family' | 'info' = 'info';
          if (rawType.includes('CROWD')) alertType = 'crowd';
          else if (rawType.includes('SAFETY')) alertType = 'safety';
          else if (rawType.includes('EMERGENCY') || rawType.includes('CRITICAL')) alertType = 'emergency';
          else if (rawType.includes('FAMILY')) alertType = 'family';
          else alertType = 'info';

          let timeLabel = t.common.updatedNow || 'Just now';
          if (ba.created_at) {
            try {
              const d = new Date(ba.created_at);
              timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (_) {}
          }

          return {
            id: String(ba.id),
            type: alertType,
            title: ba.title,
            message: ba.message,
            severity: ba.severity,
            location: ba.location || ba.zone || undefined,
            time: timeLabel,
            isRead: ba.is_read,
            isDemo: false,
            isAuthorityBroadcast: true,
            actionText: alertType === 'crowd' ? 'View Camera' : undefined,
          };
        });
        setAlerts((prev) => {
          const map = new Map<string, AlertItem>();
          mapped.forEach((m) => map.set(m.id, m));
          // Keep live alerts, drop mock alerts when online
          prev.forEach((p) => {
            if (!p.id.startsWith('alert-') && !map.has(p.id)) {
              map.set(p.id, p);
            }
          });
          return Array.from(map.values());
        });
        setIsOfflineFallback(false);
      }
    } catch (err) {
      setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, t.common.updatedNow]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);

    // Real-time zero latency listener for authority alerts from Firestore
    const unsubscribeFirebase = firebaseService.subscribeToAlerts((fbAlerts) => {
      if (fbAlerts) {
        if (fbAlerts.length === 0) {
          // If authority resolved/deleted all alerts, remove them from UI immediately
          setAlerts((prev) => prev.filter((p) => !p.isAuthorityBroadcast));
        } else {
          const mapped: AlertItem[] = fbAlerts.map((fa) => {
            const rawType = (fa.type || '').toUpperCase();
            let alertType: 'crowd' | 'safety' | 'emergency' | 'family' | 'info' = 'info';
            if (rawType.includes('CROWD')) alertType = 'crowd';
            else if (rawType.includes('SAFETY')) alertType = 'safety';
            else if (rawType.includes('EMERGENCY') || rawType.includes('CRITICAL')) alertType = 'emergency';
            else if (rawType.includes('FAMILY')) alertType = 'family';
            else alertType = 'info';

            let timeLabel = t.common.updatedNow || 'Live';
            if (fa.createdAt) {
              try {
                const d = new Date(fa.createdAt);
                timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (_) {}
            }

            return {
              id: fa.id || String(Math.random()),
              type: alertType,
              title: fa.title,
              message: fa.message,
              severity: (fa.severity as any) || 'INFO',
              location: fa.location || fa.zone,
              time: timeLabel,
              isRead: false,
              isDemo: false,
              isAuthorityBroadcast: true,
              actionText: alertType === 'crowd' ? 'View Camera' : undefined,
            };
          });

          setAlerts((prev) => {
            const map = new Map<string, AlertItem>();
            // 1. Live broadcast alerts at the top
            mapped.forEach((m) => map.set(m.id, m));
            // 2. Keep any non-mock backend alerts
            prev.forEach((p) => {
              if (!p.id.startsWith('alert-') && !map.has(p.id)) {
                map.set(p.id, p);
              }
            });
            return Array.from(map.values());
          });
          setIsOfflineFallback(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      clearInterval(interval);
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, [fetchAlerts, t.common.updatedNow]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAlerts();
  };

  const handleMarkAllRead = async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    try {
      await markAllAlertsRead(user?.id || 1);
    } catch (_) {}
  };

  const handleAlertPress = async (alert: AlertItem) => {
    // Open detailed advisory modal
    setSelectedAlertForDetail(alert);
    setIsDetailModalVisible(true);

    // Mark as read in state and backend
    if (!alert.isRead) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a))
      );
      try {
        const numId = parseInt(alert.id, 10);
        if (!isNaN(numId)) {
          await markAlertRead(numId, user?.id || 1);
        }
      } catch (_) {}
    }
  };

  const handleNavigateToRouteFromAlert = (alert: AlertItem) => {
    setIsDetailModalVisible(false);
    const destinationTarget = alert.location || 'Ramkund';
    router.push({
      pathname: '/safe-route',
      params: { to: destinationTarget },
    });
  };

  const handleViewAlertOnMap = (alert: AlertItem) => {
    setIsDetailModalVisible(false);
    router.push({
      pathname: '/(tabs)/explore',
      params: { destination: alert.location || alert.title },
    });
  };

  const handleShareAlertWithFamily = (alert: AlertItem) => {
    setIsDetailModalVisible(false);
    router.push('/family');
  };

  const categories: { id: AlertCategoryType; label: string }[] = [
    { id: 'all', label: t.alerts.filterAll },
    { id: 'crowd', label: t.alerts.filterCrowd },
    { id: 'safety', label: t.alerts.filterSafety },
    { id: 'emergency', label: t.alerts.filterEmergency },
    { id: 'info', label: language === 'mr' ? 'माहिती' : language === 'hi' ? 'सूचना' : 'Info' },
    { id: 'family', label: t.alerts.filterFamily },
  ];

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedCategory === 'all') return true;
    return alert.type === selectedCategory;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerBellIcon}>🔔</Text>
            <Text style={styles.headerTitle}>{t.alerts.title}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.btnPressed]}
            onPress={handleMarkAllRead}
            accessibilityRole="button"
            accessibilityLabel={t.alerts.markAllRead}
          >
            <Text style={styles.filterIcon}>✓✓</Text>
          </Pressable>
        </View>

        {/* Filter Pills */}
        <View style={styles.pillsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.pill,
                    active && styles.pillActive,
                    highContrast && styles.highContrastPill,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${cat.label}`}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Live Online Synchronization Status Banner */}
          <View style={styles.onlineStatusBanner}>
            <View style={styles.onlineStatusDot} />
            <Text style={styles.onlineStatusText}>
              {language === 'mr'
                ? '🟢 थेट नियंत्रण कक्ष कनेक्टेड (Online Real-time Sync)'
                : language === 'hi'
                ? '🟢 लाइव कंट्रोल रूम कनेक्टेड (Online Real-time Sync)'
                : '🟢 Live Command Center Synced (Online Real-time Sync)'}
            </Text>
          </View>

          {/* Offline Network Notice if applicable */}
          {isOfflineFallback && (
            <View style={styles.offlineNoticeBanner}>
              <Text style={styles.offlineNoticeIcon}>📡</Text>
              <Text style={styles.offlineNoticeText}>{t.alerts.offlineNotice}</Text>
            </View>
          )}

          {/* Alerts Cards List */}
          <View style={styles.alertsList}>
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>{t.alerts.noAlertsTitle}</Text>
                <Text style={styles.emptyDesc}>{t.alerts.noAlertsDesc}</Text>
              </View>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => handleAlertPress(alert)}
                  highContrast={highContrast}
                />
              ))
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Rich Alert Details Modal */}
        <AlertDetailsModal
          visible={isDetailModalVisible}
          alert={selectedAlertForDetail}
          onClose={() => setIsDetailModalVisible(false)}
          onNavigateRoute={handleNavigateToRouteFromAlert}
          onViewMap={handleViewAlertOnMap}
          onShareFamily={handleShareAlertWithFamily}
        />

        <BottomTabBar unreadAlertsCount={alerts.filter((a) => !a.isRead).length} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: 12,
    backgroundColor: '#FAF7F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBellIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  filterIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  btnPressed: {
    opacity: 0.75,
  },
  pillsWrapper: {
    paddingVertical: 6,
    backgroundColor: '#FAF7F0',
  },
  pillsScroll: {
    paddingHorizontal: KumbhSpacing.base,
    gap: 8,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  highContrastPill: {
    borderWidth: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: 10,
  },
  onlineStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  onlineStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  onlineStatusText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  offlineNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  offlineNoticeIcon: {
    fontSize: 16,
  },
  offlineNoticeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  alertsList: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 90,
  },
});
