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

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  status: 'SAFE' | 'LAST_SEEN' | 'SOS' | 'OFFLINE';
  lastSeenLocation?: string;
  lastUpdated: string;
  phone?: string;
  isLocationShared?: boolean;
  latitude?: number;
  longitude?: number;
  distanceText?: string;
}

interface FamilyMemberCardProps {
  member: FamilyMember;
  onContact?: (member: FamilyMember) => void;
  onLocate?: (member: FamilyMember) => void;
  onPress?: () => void;
  highContrast?: boolean;
}

// ─── Row Style matching Screen 3 Reference ──────────────────────────────────
export function FamilyMemberRow({
  member,
  onPress,
  onLocate,
}: {
  member: FamilyMember;
  onPress?: () => void;
  onLocate?: () => void;
}) {
  const { language } = useSettings();
  const isSOS = member.status === 'SOS';
  const isSafe = member.status === 'SAFE';
  const isOnline = isSafe;

  const onlineText = isSOS
    ? (language === 'mr' ? '🚨 मदत हवी (SOS)' : language === 'hi' ? '🚨 मदद चाहिए (SOS)' : '🚨 SOS Triggered')
    : isOnline
    ? (language === 'mr' ? 'ऑनलाइन (सुरक्षित)' : language === 'hi' ? 'ऑनलाइन (सुरक्षित)' : 'Online')
    : member.lastUpdated.includes('Last seen')
    ? (language === 'mr' ? member.lastUpdated.replace('Last seen', 'शेवटचे पाहिले').replace('min ago', 'मि. पूर्वी') : member.lastUpdated)
    : (language === 'mr' ? 'ऑफलाइन' : 'Offline');

  const locText = member.isLocationShared
    ? (language === 'mr' ? 'स्थान चालू' : language === 'hi' ? 'स्थान चालू' : 'Location Sharing ON')
    : (language === 'mr' ? 'स्थान बंद' : language === 'hi' ? 'स्थान बंद' : 'Location OFF');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.rowCard,
        isSOS && styles.sosCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${onlineText}, ${locText}`}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.avatarBox, isSOS && styles.avatarBoxSos]}>
          <Text style={styles.avatarText}>
            {member.name.split(' ')[0][0] || '👤'}
          </Text>
        </View>

        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{member.name}</Text>
          <View style={styles.rowSub}>
            <Text style={styles.dot}>
              {isSOS ? '🔴' : isOnline ? '🟢' : '⚪'}
            </Text>
            <Text
              style={[
                styles.rowSubText,
                isSOS && { color: KumbhColors.emergency, fontWeight: '700' },
              ]}
            >
              {onlineText} · {locText}
            </Text>
          </View>
          {member.distanceText || member.lastSeenLocation ? (
            <Text style={styles.rowDistanceText} numberOfLines={1}>
              📍 {member.distanceText ? `${member.distanceText} · ` : ''}{member.lastSeenLocation || 'Kumbh Grounds'}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rowRightActions}>
        {onLocate && (member.isLocationShared || member.latitude) ? (
          <Pressable
            style={styles.mapPillBtn}
            onPress={(e) => {
              e.stopPropagation();
              onLocate();
            }}
            hitSlop={6}
          >
            <Text style={styles.mapPillText}>🗺️ Map</Text>
          </Pressable>
        ) : null}
        <Text style={styles.rowChevron}>›</Text>
      </View>
    </Pressable>
  );
}

// ─── Full Member Card (Backwards compatible) ───────────────────────────────
export function FamilyMemberCard({
  member,
  onContact,
  onLocate,
  highContrast = false,
}: FamilyMemberCardProps) {
  const { language } = useSettings();
  const isSafe = member.status === 'SAFE';
  const isSOS = member.status === 'SOS';

  const statusLabel = isSOS
    ? (language === 'mr' ? '🚨 मदतीची विनंती (SOS)' : language === 'hi' ? '🚨 मदद की पुकार' : '🚨 SOS REQUEST')
    : isSafe
    ? (language === 'mr' ? '🟢 ऑनलाइन (सुरक्षित)' : language === 'hi' ? '🟢 ऑनलाइन' : '🟢 Online')
    : (language === 'mr' ? '🟡 शेवटचे पाहिले' : '🟡 Last seen');

  const statusColor = isSOS
    ? KumbhColors.statusHighText
    : isSafe
    ? KumbhColors.statusLowText
    : KumbhColors.statusModerateText;

  const statusBg = isSOS
    ? KumbhColors.statusHighBg
    : isSafe
    ? KumbhColors.statusLowBg
    : KumbhColors.statusModerateBg;

  return (
    <View
      style={[
        styles.card,
        isSOS && styles.sosCard,
        highContrast && styles.highContrastCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{member.name[0] || '👤'}</Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.relation}>({member.relation})</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <Text style={styles.timeText}>{member.lastUpdated}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {member.lastSeenLocation || (language === 'mr' ? 'स्थान सामायिक बंद' : 'Location sharing off')}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        {onContact && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            onPress={() => onContact(member)}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionBtnText}>
              {language === 'mr' ? 'संपर्क साधा' : language === 'hi' ? 'कॉल करें' : 'Call Member'}
            </Text>
          </Pressable>
        )}

        {onLocate && (
          <Pressable
            style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.pressed]}
            onPress={() => onLocate(member)}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionBtnOutlineText}>
              {language === 'mr' ? 'नकाशावर पहा' : language === 'hi' ? 'नक्शे पर देखें' : 'Show on Map'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KumbhColors.white,
    paddingVertical: 12,
    paddingHorizontal: KumbhSpacing.base,
    borderRadius: KumbhRadius.lg,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    marginBottom: 8,
    ...KumbhShadow.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  rowSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    fontSize: 10,
  },
  rowSubText: {
    fontSize: 12,
    color: KumbhColors.textSecondary,
    fontWeight: '500',
  },
  rowDistanceText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  rowRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapPillBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  mapPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  rowChevron: {
    fontSize: 22,
    color: KumbhColors.textMuted,
    paddingLeft: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBoxSos: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: KumbhColors.navy,
  },
  card: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    gap: KumbhSpacing.sm,
    marginBottom: 10,
  },
  sosCard: {
    borderColor: KumbhColors.emergency,
    backgroundColor: '#FFF5F5',
  },
  highContrastCard: {
    borderWidth: 2,
    borderColor: KumbhColors.navy,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KumbhSpacing.md,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  relation: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: KumbhRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: KumbhColors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locIcon: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 12,
    color: KumbhColors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: KumbhColors.navy,
    paddingVertical: 8,
    borderRadius: KumbhRadius.md,
  },
  actionBtnText: {
    color: KumbhColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: KumbhColors.white,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    paddingVertical: 8,
    borderRadius: KumbhRadius.md,
  },
  actionBtnOutlineText: {
    color: KumbhColors.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  actionIcon: {
    fontSize: 14,
  },
});
