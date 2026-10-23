import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KumbhColors, KumbhShadow, KumbhSpacing, KumbhTypography } from '@/constants/kumbh-theme';
import { useSettings } from '@/context/SettingsContext';

interface TabItem {
  id: 'home' | 'explore' | 'alerts' | 'profile';
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

interface BottomTabBarProps {
  unreadAlertsCount?: number;
}

export function BottomTabBar({ unreadAlertsCount = 3 }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();

  const tabItems: TabItem[] = [
    { id: 'home', label: t.nav.home, icon: '🏠', activeIcon: '🏠', route: '/(tabs)/home' },
    { id: 'explore', label: t.nav.explore, icon: '🧭', activeIcon: '🧭', route: '/(tabs)/explore' },
    { id: 'alerts', label: t.nav.alerts, icon: '🔔', activeIcon: '🔔', route: '/(tabs)/alerts' },
    { id: 'profile', label: t.nav.profile, icon: '👤', activeIcon: '👤', route: '/(tabs)/profile' },
  ];

  const isActive = (route: string) => {
    const routeName = route.split('/').pop() ?? '';
    if (routeName === 'home' && (pathname === '/' || pathname === '/home' || pathname.includes('home'))) {
      return true;
    }
    return pathname.includes(routeName);
  };

  const handleTabPress = (route: string) => {
    if (isActive(route)) return;
    try {
      if (typeof (router as any).navigate === 'function') {
        (router as any).navigate(route);
      } else {
        router.push(route as any);
      }
    } catch (_) {
      router.replace(route as any);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, KumbhSpacing.md) }]}>
      {tabItems.map((tab) => {
        const active = isActive(tab.route);
        const isAlerts = tab.id === 'alerts';
        const showBadge = isAlerts && unreadAlertsCount > 0;

        return (
          <Pressable
            key={tab.route}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            onPress={() => handleTabPress(tab.route)}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.iconWrapper, active && styles.activeIconWrapper]}>
              <Text style={styles.tabIcon}>{active ? tab.activeIcon : tab.icon}</Text>
              {showBadge && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: KumbhColors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: KumbhColors.border,
    paddingTop: KumbhSpacing.sm,
    ...KumbhShadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: KumbhSpacing.xs,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconWrapper: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  activeIconWrapper: {
    backgroundColor: '#FFF0E8',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    ...KumbhTypography.caption,
    color: KumbhColors.tabInactive,
  },
  activeTabLabel: {
    color: KumbhColors.tabActive,
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: KumbhColors.emergency,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: KumbhColors.white,
    zIndex: 10,
  },
  tabBadgeText: {
    color: KumbhColors.white,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});
