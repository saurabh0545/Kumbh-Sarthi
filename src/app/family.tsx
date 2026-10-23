import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FamilyMemberCard, FamilyMember, FamilyMemberRow } from '@/components/kumbh/FamilyMemberCard';
import { KumbhButton } from '@/components/kumbh/KumbhButton';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { INITIAL_MOCK_FAMILY, FamilyMemberItem } from '@/data/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  getMyFamily,
  createFamily,
  joinFamily,
  sendFamilySos,
  toggleLocationSharing,
  updateLocation,
} from '@/services/familyApi';
import { firebaseService } from '@/services/firebaseService';
import { isFirebaseConfigured } from '@/config/firebase';
import { getSavedFamily, saveFamily, clearSavedFamily } from '@/services/familyStorage';

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null || isNaN(meters)) return '';
  if (meters < 1000) return `${meters} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export default function FamilyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userLocation } = useUserLocation();
  const { t, shareLocationWithFamily, setShareLocationWithFamily, highContrast, language } = useSettings();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [offlineStatus, setOfflineStatus] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState<boolean>(true);

  const [groupName, setGroupName] = useState<string>(INITIAL_MOCK_FAMILY.groupName);
  const [groupCode, setGroupCode] = useState<string>(INITIAL_MOCK_FAMILY.groupCode);
  const [members, setMembers] = useState<FamilyMemberItem[]>(INITIAL_MOCK_FAMILY.members);

  // Modals
  const [showSosConfirm, setShowSosConfirm] = useState<boolean>(false);
  const [sosSentSuccess, setSosSentSuccess] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showLostModal, setShowLostModal] = useState<boolean>(false);
  const [selectedLostMember, setSelectedLostMember] = useState<FamilyMemberItem | null>(null);

  // Inputs
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  const fetchFamily = useCallback(async () => {
    // 1. First load from persistent local storage
    const saved = await getSavedFamily();
    if (saved) {
      setHasFamily(true);
      setGroupName(saved.groupName);
      setGroupCode(saved.groupCode);
      if (saved.members && saved.members.length > 0) {
        setMembers(saved.members);
      }
    }

    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      setOfflineStatus(null);
      const res = await getMyFamily(user.id);
      if (res.family) {
        setHasFamily(true);
        setGroupName(res.family.name);
        setGroupCode(res.family.code);
        const mapped: FamilyMemberItem[] = res.members.map((m) => {
          const isSos = (res.active_sos && res.active_sos.some((s) => s.user_id === m.user_id)) || m.status === 'SOS';
          return {
            id: String(m.user_id || m.id),
            name: m.name + (m.user_id === user.id ? ' (You)' : ''),
            relation: m.relation || 'Member',
            status: isSos ? 'SOS' : (m.status as any),
            lastSeenLocation: m.is_location_shared ? m.last_seen_location : 'Location sharing off',
            lastUpdated: m.last_updated ? 'Updated ' + new Date(m.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active recently',
            latitude: m.is_location_shared && m.latitude ? m.latitude : undefined,
            longitude: m.is_location_shared && m.longitude ? m.longitude : undefined,
            isLocationShared: m.is_location_shared,
          };
        });
        setMembers(mapped);
        await saveFamily({
          groupName: res.family.name,
          groupCode: res.family.code,
          members: mapped,
          isCustom: true,
        });
      } else if (!saved) {
        setHasFamily(false);
      }
    } catch (err) {
      // If Firebase is configured, Firebase Cloud Firestore handles real-time sync smoothly.
      // Do not display an offline warning banner when cloud sync is functioning.
      if (!isFirebaseConfigured() && !saved) {
        setOfflineStatus('Unable to update family status (showing cached/local data)');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  // ── 1. Real-time Firebase Sync for Family Group (Multi-user connect & location sharing) ──
  useEffect(() => {
    if (!groupCode) return;
    const cleanCode = groupCode.trim().toUpperCase();

    // Attach real-time Firestore listener for all connected members in this group
    const unsub = firebaseService.subscribeToFamilyGroup(cleanCode, (fbData) => {
      if (fbData.members && fbData.members.length > 0) {
        setOfflineStatus(null);
        const mapped: FamilyMemberItem[] = fbData.members.map((m) => {
          let distText = '';
          if (userLocation && m.latitude && m.longitude) {
            const d = calculateDistanceMeters(
              userLocation.latitude,
              userLocation.longitude,
              m.latitude,
              m.longitude
            );
            distText = formatDistance(d);
          }
          const isMe = String(m.userId) === String(user?.id || 1) || m.id === String(user?.id || 1);
          return {
            id: String(m.id || m.userId),
            name: m.name + (isMe ? ' (You)' : ''),
            relation: m.relation || 'Member',
            status: (m.status as any) || 'SAFE',
            lastSeenLocation: m.isLocationShared ? (m.lastSeenLocation || 'Ramkund Sacred Grounds') : 'Location sharing OFF',
            lastUpdated: m.lastUpdated || 'Active now',
            latitude: m.latitude,
            longitude: m.longitude,
            isLocationShared: m.isLocationShared,
            distanceText: distText,
          };
        });
        setMembers(mapped);
        setHasFamily(true);
        saveFamily({
          groupName: fbData.groupName || groupName,
          groupCode: cleanCode,
          members: mapped,
          isCustom: true,
        });
      }
    });

    // Also register / update current user inside this group
    const myId = user?.id || 1;
    const myName = user?.name || 'You';
    firebaseService.joinOrUpdateFamilyMember(cleanCode, groupName, {
      userId: myId,
      name: myName,
      relation: 'Member',
      status: 'SAFE',
      isLocationShared: shareLocationWithFamily,
      latitude: userLocation?.latitude || 19.9984,
      longitude: userLocation?.longitude || 73.7915,
      lastSeenLocation: 'Ramkund Sacred Grounds',
    });

    return () => {
      if (unsub) unsub();
    };
  }, [groupCode, user?.id, user?.name, shareLocationWithFamily, userLocation]);

  // ── 2. Live GPS location stream to all family members ─────────────────────
  useEffect(() => {
    if (groupCode && userLocation && shareLocationWithFamily) {
      const myId = user?.id || 1;
      firebaseService.updateFamilyMemberLocation(groupCode, myId, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        locationName: 'Ramkund Sacred Grounds',
        isLocationShared: true,
      });
    }
  }, [userLocation?.latitude, userLocation?.longitude, shareLocationWithFamily, groupCode, user?.id]);

  const handleShareCode = async () => {
    try {
      await Share.share({
        title: 'Kumbh Sarthi Family Code',
        message: `🙏 Connect with me on the Kumbh Sarthi App!\nOur Family Group Code is: ${groupCode}\n\nEnter this code in the Family tab to see my live location and stay safe together during Nashik Kumbh Mela 2027.`,
      });
    } catch (_) {
      Alert.alert('Family Code', `Your family group code is: ${groupCode}`);
    }
  };

  const handleSendSos = async () => {
    setShowSosConfirm(false);
    const myId = user?.id || 1;
    const myName = user?.name || 'Pilgrim';
    const lat = shareLocationWithFamily && userLocation ? userLocation.latitude : 19.9984;
    const lng = shareLocationWithFamily && userLocation ? userLocation.longitude : 73.7915;

    // Trigger instant real-time SOS in Firestore for all connected family devices
    firebaseService.triggerFamilyMemberSos(groupCode, myId, {
      userName: myName,
      latitude: lat,
      longitude: lng,
      locationName: 'Near Ramkund Sacred Grounds',
    });

    try {
      await sendFamilySos(Number(myId) || 1, lat, lng, 'Ramkund Approach');
    } catch (_) {}

    setSosSentSuccess(true);
    setTimeout(() => setSosSentSuccess(false), 6000);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setInputError('Please enter a family group name');
      return;
    }
    const generatedCode = 'KSA-' + Math.floor(1000 + Math.random() * 9000);
    const myId = user?.id || 1;
    const myName = user?.name || 'You';

    const creatorMember: FamilyMemberItem = {
      id: String(myId),
      name: `${myName} (You)`,
      relation: 'Admin',
      status: 'SAFE',
      isLocationShared: shareLocationWithFamily,
      latitude: userLocation?.latitude || 19.9984,
      longitude: userLocation?.longitude || 73.7915,
      lastSeenLocation: 'Ramkund Sacred Grounds',
      lastUpdated: 'Active now',
    };

    // 1. Write to Firestore immediately
    await firebaseService.joinOrUpdateFamilyMember(generatedCode, newGroupName.trim(), {
      userId: myId,
      name: myName,
      relation: 'Admin',
      status: 'SAFE',
      isLocationShared: shareLocationWithFamily,
      latitude: userLocation?.latitude || 19.9984,
      longitude: userLocation?.longitude || 73.7915,
      lastSeenLocation: 'Ramkund Sacred Grounds',
    });

    // 2. Persist locally to storage so closing the app preserves the created group
    await saveFamily({
      groupName: newGroupName.trim(),
      groupCode: generatedCode,
      members: [creatorMember],
      isCustom: true,
    });

    setGroupName(newGroupName.trim());
    setGroupCode(generatedCode);
    setMembers([creatorMember]);
    setHasFamily(true);
    setShowCreateModal(false);
    setNewGroupName('');
    setInputError('');

    // 3. Also record with backend if available
    try {
      await createFamily(newGroupName.trim(), Number(myId) || 1);
    } catch (_) {}

    Alert.alert(
      'Family Group Created!',
      `Group: ${newGroupName.trim()}\nFamily Code: ${generatedCode}\n\nShare this code with your family members so they can join and share live locations!`
    );
  };

  const handleJoinGroup = async () => {
    if (!joinCodeInput.trim()) {
      setInputError('Please enter the family code');
      return;
    }
    const cleanCode = joinCodeInput.trim().toUpperCase();
    const myId = user?.id || 1;
    const myName = user?.name || 'You';

    const joinedMember: FamilyMemberItem = {
      id: String(myId),
      name: `${myName} (You)`,
      relation: 'Member',
      status: 'SAFE',
      isLocationShared: shareLocationWithFamily,
      latitude: userLocation?.latitude || 19.9984,
      longitude: userLocation?.longitude || 73.7915,
      lastSeenLocation: 'Ramkund Sacred Grounds',
      lastUpdated: 'Active now',
    };

    setIsLoading(true);
    try {
      // 1. Join in Firestore
      await firebaseService.joinOrUpdateFamilyMember(cleanCode, `Family Group (${cleanCode})`, {
        userId: myId,
        name: myName,
        relation: 'Member',
        status: 'SAFE',
        isLocationShared: shareLocationWithFamily,
        latitude: userLocation?.latitude || 19.9984,
        longitude: userLocation?.longitude || 73.7915,
        lastSeenLocation: 'Ramkund Sacred Grounds',
      });

      const joinedGroupName = `Family Group (${cleanCode})`;
      await saveFamily({
        groupName: joinedGroupName,
        groupCode: cleanCode,
        members: [joinedMember],
        isCustom: true,
      });

      setGroupCode(cleanCode);
      setGroupName(joinedGroupName);
      setMembers([joinedMember]);
      setHasFamily(true);
      setShowJoinModal(false);
      setJoinCodeInput('');
      setInputError('');

      // 2. Also record in backend if available
      try {
        await joinFamily(cleanCode, Number(myId) || 1);
      } catch (_) {}

      Alert.alert(
        'Connected to Family Group!',
        `Successfully joined with Code: ${cleanCode}.\nYou are now connected in real-time with your family members!`
      );
    } catch (err: any) {
      Alert.alert('Notice', 'Connected to family code: ' + cleanCode);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      language === 'mr' ? 'कुटुंब गट सोडा' : 'Leave Family Group',
      language === 'mr'
        ? 'तुम्हाला खात्री आहे की तुम्ही हा कुटुंब गट सोडू इच्छिता?'
        : 'Are you sure you want to leave this family group?',
      [
        { text: language === 'mr' ? 'रद्द करा' : 'Cancel', style: 'cancel' },
        {
          text: language === 'mr' ? 'सोडा' : 'Leave',
          style: 'destructive',
          onPress: async () => {
            await clearSavedFamily();
            setGroupName(INITIAL_MOCK_FAMILY.groupName);
            setGroupCode(INITIAL_MOCK_FAMILY.groupCode);
            setMembers(INITIAL_MOCK_FAMILY.members);
            Alert.alert(
              language === 'mr' ? 'कुटुंब गट सोडला' : 'Left Family Group',
              language === 'mr'
                ? 'तुम्ही कुटुंब गट सोडला आहे.'
                : 'You have left the family group.'
            );
          },
        },
      ]
    );
  };

  const handleToggleLocationSharing = async (val: boolean) => {
    setShareLocationWithFamily(val);
    const myId = user?.id || 1;
    const myName = user?.name || 'You';

    // 1. Immediately update Firebase Cloud Firestore so all members see it in real time
    if (groupCode) {
      firebaseService.joinOrUpdateFamilyMember(groupCode, groupName, {
        userId: myId,
        name: myName,
        isLocationShared: val,
        latitude: userLocation?.latitude || 19.9984,
        longitude: userLocation?.longitude || 73.7915,
        lastSeenLocation: 'Ramkund Sacred Grounds',
      });
    }

    // 2. Safe local backend sync (if local server is running)
    if (user?.id) {
      try {
        await toggleLocationSharing(user.id, val);
        if (val && userLocation) {
          await updateLocation(user.id, userLocation.latitude, userLocation.longitude, 'Ramkund Sacred Ghats');
        }
      } catch (e) {
        // Handled silently - Firebase provides the real-time cloud sync
      }
    }
  };

  const handleContactMember = (member: FamilyMemberItem) => {
    Alert.alert(
      `Contact ${member.name}`,
      `Phone: ${member.phone || 'Available via Kumbh Help Post'}\n\nCall or send an emergency SMS?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Member', onPress: () => {} },
      ]
    );
  };

  const handleLocateMember = (member: FamilyMemberItem) => {
    if (!member.isLocationShared && !member.latitude) {
      Alert.alert(
        'Location Privacy Protected',
        `${member.name} has not turned on live location sharing. Location is only shared with explicit consent.`
      );
      return;
    }
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        highlightId: member.id,
        lat: member.latitude ? String(member.latitude) : undefined,
        lng: member.longitude ? String(member.longitude) : undefined,
        name: member.name,
      },
    } as any);
  };

  const openLostMemberDialog = () => {
    if (members.length > 0) {
      setSelectedLostMember(members[0]);
    }
    setShowLostModal(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ── Top Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>{t.family.title} 👨‍👩‍👧</Text>
            <Text style={styles.headerSubtitle}>{t.family.subtitle}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Offline/Weak Network Notice if applicable */}
          {offlineStatus && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineBannerIcon}>⚠️</Text>
              <Text style={styles.offlineBannerText}>{offlineStatus}</Text>
            </View>
          )}

          {/* SOS Success Banner */}
          {sosSentSuccess && (
            <View style={styles.sosAlertBanner}>
              <Text style={styles.sosBannerIcon}>🚨</Text>
              <Text style={styles.sosBannerText}>{t.family.sosSent}</Text>
            </View>
          )}

          {/* ── State 2: Active Family Group ────────────────────── */}
          {hasFamily ? (
            <>
              {/* Group Overview Card with Shareable Family Code */}
              <View style={[styles.groupCard, highContrast && styles.highContrastCard]}>
                <View style={styles.groupTopRow}>
                  <View style={styles.groupLeft}>
                    <View style={styles.groupAvatarCircle}>
                      <Text style={styles.groupAvatarEmoji}>👥</Text>
                    </View>
                    <View style={styles.groupTextCol}>
                      <Text style={styles.groupName}>{groupName}</Text>
                      <Text style={styles.groupSubText}>
                        🟢 {members.length} {language === 'mr' ? 'सदस्य जोडले आहेत (Live)' : 'members connected (Live)'}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.shareCodeHeroBtn, pressed && styles.btnPressed]}
                    onPress={handleShareCode}
                    accessibilityRole="button"
                    accessibilityLabel="Share Family Code"
                  >
                    <Text style={styles.shareCodeHeroText}>
                      📋 {language === 'mr' ? 'कोड शेअर करा' : 'Share Code'}
                    </Text>
                  </Pressable>
                </View>

                {/* Highlighted Family Code Banner for Multi-Device Connect */}
                <View style={styles.codeShareBar}>
                  <View style={styles.codeShareCol}>
                    <Text style={styles.codeShareLabel}>
                      {language === 'mr' ? 'आपला कुटुंब गट कोड' : 'FAMILY GROUP CODE'}
                    </Text>
                    <Text style={styles.codeShareValue}>{groupCode}</Text>
                  </View>
                  <Text style={styles.codeShareHint}>
                    {language === 'mr'
                      ? 'इतर भाविकांना हा कोड टाकून त्वरित जोडता येईल'
                      : 'Anyone enters this code to join & share location'}
                  </Text>
                </View>
              </View>

              {/* ── Members List matching Screen 3 ─────────────────── */}
              <View style={styles.membersSection}>
                <View style={styles.membersHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    {language === 'mr' ? 'कुटुंबातील सदस्य' : 'Family Members'} ({members.length})
                  </Text>
                  <View style={styles.liveSyncBadge}>
                    <Text style={styles.liveSyncDot}>🟢</Text>
                    <Text style={styles.liveSyncText}>Live GPS</Text>
                  </View>
                </View>

                <View style={styles.membersList}>
                  {members.map((member) => (
                    <FamilyMemberRow
                      key={member.id}
                      member={member}
                      onPress={() => handleContactMember(member)}
                      onLocate={() => handleLocateMember(member)}
                    />
                  ))}
                </View>
              </View>

              {/* ── Two Action Buttons: Create Family & Join Family ─ */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={({ pressed }) => [styles.createFamilyBtn, pressed && styles.btnPressed]}
                  onPress={() => setShowCreateModal(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.createFamilyBtnText}>
                    {language === 'mr' ? '+ कुटुंब गट तयार करा' : '+ Create Family'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.joinFamilyBtn, pressed && styles.btnPressed]}
                  onPress={() => setShowJoinModal(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.joinFamilyBtnText}>
                    {language === 'mr' ? '👥 कुटुंब गटात सामील व्हा' : '👥 Join Family'}
                  </Text>
                </Pressable>
              </View>

              {/* Leave / Switch Group Button if custom group */}
              {groupCode !== INITIAL_MOCK_FAMILY.groupCode && (
                <Pressable
                  style={({ pressed }) => [styles.leaveGroupBtn, pressed && styles.btnPressed]}
                  onPress={handleLeaveGroup}
                  accessibilityRole="button"
                >
                  <Text style={styles.leaveGroupBtnText}>
                    {language === 'mr' ? '🚪 हा कुटुंब गट सोडा (Reset)' : '🚪 Leave Family Group (Reset)'}
                  </Text>
                </Pressable>
              )}

              {/* ── Full Width Red Family SOS Button ───────────────── */}
              <Pressable
                style={({ pressed }) => [styles.familySosHeroBtn, pressed && styles.btnPressed]}
                onPress={() => setShowSosConfirm(true)}
                accessibilityRole="button"
                accessibilityLabel="Trigger Family SOS"
              >
                <Text style={styles.familySosHeroIcon}>🚨</Text>
                <Text style={styles.familySosHeroText}>
                  {language === 'mr' ? 'फॅमिली SOS (मदत मागा)' : 'Family SOS'}
                </Text>
              </Pressable>

              {/* ── Share Your Location Toggle Card matching Screen 3 ── */}
              <View style={[styles.shareLocCard, highContrast && styles.highContrastCard]}>
                <View style={styles.shareLocLeft}>
                  <View style={styles.shareLocIconBox}>
                    <Text style={styles.shareLocIcon}>👥</Text>
                  </View>
                  <View style={styles.shareLocTextCol}>
                    <Text style={styles.shareLocTitle}>
                      {language === 'mr' ? 'आपले स्थान सामायिक करा' : 'Share Your Location'}
                    </Text>
                    <Text style={styles.shareLocDesc}>
                      {language === 'mr'
                        ? 'कुटुंबातील सदस्यांना आपले सुरक्षित स्थान समजण्यास मदत होते.'
                        : 'Helps your family members know your safe status and location.'}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={shareLocationWithFamily}
                  onValueChange={handleToggleLocationSharing}
                  trackColor={{ false: '#CBD5E1', true: '#16A34A' }}
                  thumbColor={KumbhColors.white}
                  accessibilityLabel="Share Your Location"
                />
              </View>
            </>
          ) : (
            /* ── State 1: No Family Group Yet ───────────────────── */
            <View style={[styles.emptyFamilyCard, highContrast && styles.highContrastCard]}>
              <Text style={styles.emptyFamilyIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.emptyFamilyTitle}>
                {language === 'mr' ? 'अद्याप कोणताही कुटुंब गट जोडलेला नाही' : 'No family group yet'}
              </Text>
              <Text style={styles.emptyFamilyDesc}>
                {language === 'mr'
                  ? 'कुंभमेळ्यात आपल्या कुटुंबाशी संपर्क ठेवण्यासाठी, स्थान जाणून घेण्यासाठी आणि आपत्कालीन प्रसंगी एका स्पर्शात SOS अलर्ट पाठवण्यासाठी कुटुंब गटात सामील व्हा.'
                  : 'Connect with your family members to share safety updates, check locations (with explicit consent), and receive instant SOS alerts during the Kumbh Mela.'}
              </Text>

              <View style={styles.emptyBtnCol}>
                <Pressable
                  style={({ pressed }) => [styles.primaryActionBtn, pressed && styles.btnPressed]}
                  onPress={() => setShowCreateModal(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryActionBtnText}>
                    {language === 'mr' ? '+ कुटुंब गट तयार करा' : '+ Create Family Group'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.outlineActionBtn, pressed && styles.btnPressed]}
                  onPress={() => setShowJoinModal(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.outlineActionBtnText}>
                    {language === 'mr' ? 'कुटुंब कोड वापरून सामील व्हा' : 'Join with Family Code'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Modal: SOS Confirmation (Double Check to Prevent Accidental) ── */}
        <Modal
          visible={showSosConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSosConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModalBox}>
              <Text style={styles.confirmModalIcon}>🚨</Text>
              <Text style={styles.confirmModalTitle}>
                {language === 'mr' ? 'फॅमिली SOS पुष्टी करा' : 'Confirm Family SOS'}
              </Text>
              <Text style={styles.confirmModalText}>
                {language === 'mr'
                  ? 'आपण खात्री देता का? आपल्या कुटुंब गटातील सर्व सदस्यांना तात्काळ मदतीचा संदेश आणि अलर्ट जाईल.'
                  : 'Are you sure? This will notify your family group that you may need help.'}
                {!shareLocationWithFamily && (language === 'mr'
                  ? '\n\nटीप: आपले स्थान सामायिकरण बंद आहे, त्यामुळे सदस्यांना अचूक जीपीएस समन्वय दिसणार नाहीत.'
                  : '\n\nNote: Your location sharing is currently OFF, so members will be alerted without precise coordinates.')}
              </Text>
              <View style={styles.confirmModalActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
                  onPress={() => setShowSosConfirm(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel SOS"
                >
                  <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.confirmSosBtn, pressed && styles.btnPressed]}
                  onPress={handleSendSos}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm send SOS"
                >
                  <Text style={styles.confirmSosBtnText}>
                    {language === 'mr' ? 'होय, अलर्ट पाठवा' : 'Yes, Send Alert'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Lost Family Member Detail ──────────────── */}
        <Modal
          visible={showLostModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.lostModalBox}>
              <View style={styles.lostModalHeader}>
                <Text style={styles.lostModalTitle}>
                  {language === 'mr' ? 'कुटुंब सदस्य शोधा व संपर्क' : 'Locate Family Member'}
                </Text>
                <Pressable onPress={() => setShowLostModal(false)} hitSlop={8}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.lostPickerLabel}>
                {language === 'mr' ? 'कुटुंब सदस्य निवडा:' : 'Select family member:'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberChipsScroll}>
                {members.map((m) => (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.memberChip,
                      selectedLostMember?.id === m.id && styles.memberChipSelected,
                    ]}
                    onPress={() => setSelectedLostMember(m)}
                  >
                    <Text
                      style={[
                        styles.memberChipText,
                        selectedLostMember?.id === m.id && styles.memberChipTextSelected,
                      ]}
                    >
                      {m.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {selectedLostMember && (
                <View style={styles.lostMemberInfoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{language === 'mr' ? 'स्थिती:' : 'Status:'}</Text>
                    <Text style={[styles.infoVal, selectedLostMember.status === 'SOS' ? { color: KumbhColors.emergency } : { color: KumbhColors.statusLowText }]}>
                      {selectedLostMember.status === 'SOS'
                        ? (language === 'mr' ? '🚨 मदत मागितली (SOS)' : '🚨 SOS TRIGGERED')
                        : selectedLostMember.status === 'SAFE'
                        ? (language === 'mr' ? '🟢 सुरक्षित' : '🟢 SAFE')
                        : (language === 'mr' ? '🟡 शेवटचे पाहिले' : '🟡 LAST SEEN')}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{language === 'mr' ? 'शेवटची नोंद:' : 'Last Recorded:'}</Text>
                    <Text style={styles.infoVal}>{selectedLostMember.lastUpdated}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{language === 'mr' ? 'सामायिक स्थान:' : 'Shared Location:'}</Text>
                    <Text style={[styles.infoVal, { flex: 1, textAlign: 'right' }]}>
                      {selectedLostMember.isLocationShared || selectedLostMember.latitude
                        ? (selectedLostMember.lastSeenLocation || 'Ramkund Sector 1')
                        : (language === 'mr' ? '🔒 गोपनीयतेसाठी स्थान बंद' : '🔒 Location not shared for privacy')}
                    </Text>
                  </View>

                  <View style={styles.lostActionsRow}>
                    {(selectedLostMember.isLocationShared || selectedLostMember.latitude) && (
                      <Pressable
                        style={styles.viewOnMapBtn}
                        onPress={() => {
                          setShowLostModal(false);
                          handleLocateMember(selectedLostMember);
                        }}
                      >
                        <Text style={styles.viewOnMapText}>
                          {language === 'mr' ? '🗺️ नकाशावर पहा' : '🗺️ View on OpenStreetMap'}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={styles.contactLostBtn}
                      onPress={() => {
                        setShowLostModal(false);
                        handleContactMember(selectedLostMember);
                      }}
                    >
                      <Text style={styles.contactLostText}>
                        {language === 'mr' ? '📞 कॉल करा' : '📞 Call Member'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* ── Modal: Create Family Group ─────────────────────── */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.inputModalBox}>
              <Text style={styles.inputModalTitle}>
                {language === 'mr' ? 'नवीन कुटुंब गट तयार करा' : 'Create Family Group'}
              </Text>
              <Text style={styles.inputModalDesc}>
                {language === 'mr'
                  ? 'आपल्या कुटुंबाचे नाव टाका. आपल्याला इतर सदस्यांसोबत सामायिक करण्यासाठी एक विशेष कुटुंब कोड मिळेल.'
                  : 'Enter your family or group name. You will receive a unique Family Code to share.'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={language === 'mr' ? 'उदा. पाटील परिवार, नाशिक यात्रेकरू' : 'e.g. Patil Family, Nashik Yatris'}
                placeholderTextColor={KumbhColors.textMuted}
                value={newGroupName}
                onChangeText={(text) => {
                  setNewGroupName(text);
                  setInputError('');
                }}
              />
              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowCreateModal(false);
                    setInputError('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleCreateGroup}>
                  <Text style={styles.saveBtnText}>
                    {language === 'mr' ? 'गट तयार करा' : 'Create Group'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Join Family Group ───────────────────────── */}
        <Modal
          visible={showJoinModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.inputModalBox}>
              <Text style={styles.inputModalTitle}>
                {language === 'mr' ? 'कुटुंब गटात सामील व्हा' : 'Join Family Group'}
              </Text>
              <Text style={styles.inputModalDesc}>
                {language === 'mr'
                  ? 'कुटुंबातील सदस्याने दिलेला कुटुंब कोड टाका (उदा. KSA-4821).'
                  : 'Enter the Family Code shared by your family member (e.g. KSA-4821).'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={language === 'mr' ? 'कुटुंब कोड टाका (उदा. KSA-4821)' : 'Enter Code (e.g. KSA-4821)'}
                placeholderTextColor={KumbhColors.textMuted}
                value={joinCodeInput}
                autoCapitalize="characters"
                onChangeText={(text) => {
                  setJoinCodeInput(text);
                  setInputError('');
                }}
              />
              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowJoinModal(false);
                    setInputError('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleJoinGroup}>
                  <Text style={styles.saveBtnText}>
                    {language === 'mr' ? 'सामील व्हा' : 'Join Group'}
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
    backgroundColor: KumbhColors.background,
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
    backgroundColor: KumbhColors.white,
    borderBottomWidth: 1,
    borderBottomColor: KumbhColors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: KumbhColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: KumbhColors.textPrimary,
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
  },
  headerSubtitle: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: KumbhSpacing.base,
  },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.md,
    marginBottom: KumbhSpacing.base,
    gap: 8,
  },
  offlineBannerIcon: {
    fontSize: 16,
  },
  offlineBannerText: {
    ...KumbhTypography.small,
    color: '#92400E',
    flex: 1,
    fontWeight: '600',
  },

  sosAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.md,
    marginBottom: KumbhSpacing.base,
    gap: 8,
  },
  sosBannerIcon: {
    fontSize: 18,
  },
  sosBannerText: {
    ...KumbhTypography.smallMedium,
    color: '#991B1B',
    fontWeight: '700',
    flex: 1,
  },

  // Empty Family State
  emptyFamilyCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.md,
    marginVertical: KumbhSpacing.lg,
    gap: KumbhSpacing.md,
  },
  emptyFamilyIcon: {
    fontSize: 54,
  },
  emptyFamilyTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
    fontWeight: '700',
  },
  emptyFamilyDesc: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtnCol: {
    width: '100%',
    gap: KumbhSpacing.md,
    marginTop: 8,
  },
  primaryActionBtn: {
    backgroundColor: KumbhColors.primary,
    borderRadius: KumbhRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryActionBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },
  outlineActionBtn: {
    backgroundColor: KumbhColors.white,
    borderWidth: 1.5,
    borderColor: KumbhColors.primary,
    borderRadius: KumbhRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outlineActionBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.primary,
    fontWeight: '700',
  },

  // Group Card matching Screen 3
  groupCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    marginBottom: KumbhSpacing.base,
    gap: KumbhSpacing.md,
  },
  groupTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareCodeHeroBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: KumbhRadius.full,
  },
  shareCodeHeroText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  codeShareBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: KumbhRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: KumbhSpacing.md,
    gap: 4,
  },
  codeShareCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeShareLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: KumbhColors.textSecondary,
    letterSpacing: 0.8,
  },
  codeShareValue: {
    fontSize: 18,
    fontWeight: '900',
    color: KumbhColors.primary,
    letterSpacing: 1.5,
  },
  codeShareHint: {
    fontSize: 11,
    color: KumbhColors.textMuted,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarEmoji: {
    fontSize: 24,
  },
  groupTextCol: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: KumbhColors.navy,
  },
  groupCodeText: {
    fontSize: 12,
    color: KumbhColors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  groupSubText: {
    fontSize: 11,
    color: KumbhColors.textMuted,
    marginTop: 1,
  },
  manageBtn: {
    backgroundColor: KumbhColors.white,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: KumbhRadius.full,
    ...KumbhShadow.sm,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: KumbhColors.navy,
  },

  // Action Buttons Row (Create & Join)
  actionButtonsRow: {
    flexDirection: 'row',
    gap: KumbhSpacing.md,
    marginVertical: KumbhSpacing.sm,
  },
  createFamilyBtn: {
    flex: 1,
    backgroundColor: KumbhColors.white,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: KumbhRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.sm,
  },
  createFamilyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  joinFamilyBtn: {
    flex: 1,
    backgroundColor: KumbhColors.white,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: KumbhRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.sm,
  },
  joinFamilyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: KumbhColors.navy,
  },

  // Full Width Red Family SOS Button (Screen 3)
  familySosHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: KumbhRadius.lg,
    paddingVertical: 14,
    gap: 8,
    marginVertical: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  familySosHeroIcon: {
    fontSize: 20,
  },
  familySosHeroText: {
    fontSize: 16,
    fontWeight: '800',
    color: KumbhColors.white,
    letterSpacing: 0.3,
  },

  // Share Location Toggle Card (Screen 3)
  shareLocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    marginTop: 8,
  },
  shareLocLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  shareLocIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLocIcon: {
    fontSize: 20,
  },
  shareLocTextCol: {
    flex: 1,
  },
  shareLocTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  shareLocDesc: {
    fontSize: 12,
    color: KumbhColors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },

  // Family SOS Card
  sosCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    marginBottom: KumbhSpacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: KumbhSpacing.md,
  },
  sosTextCol: {
    flex: 1,
    gap: 2,
  },
  sosCardTitle: {
    ...KumbhTypography.h4,
    color: '#991B1B',
    fontWeight: '700',
  },
  sosCardDesc: {
    ...KumbhTypography.caption,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  sosBtn: {
    backgroundColor: KumbhColors.emergency,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: KumbhRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 2,
  },
  sosBtnIcon: {
    fontSize: 16,
  },
  sosBtnText: {
    ...KumbhTypography.caption,
    color: KumbhColors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Privacy Card
  privacyCard: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    marginBottom: KumbhSpacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: KumbhSpacing.md,
  },
  privacyTextCol: {
    flex: 1,
    gap: 4,
  },
  privacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    ...KumbhTypography.h4,
    color: KumbhColors.textPrimary,
  },
  privacyStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  privacyStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#15803D',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  privacyDesc: {
    ...KumbhTypography.small,
    color: KumbhColors.textSecondary,
    lineHeight: 18,
  },

  // Members Section
  membersSection: {
    gap: KumbhSpacing.sm,
    marginBottom: KumbhSpacing.base,
  },
  membersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: KumbhRadius.full,
    gap: 4,
  },
  liveSyncDot: {
    fontSize: 8,
  },
  liveSyncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.3,
  },
  sectionHeading: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  privacyNote: {
    ...KumbhTypography.caption,
    color: KumbhColors.statusLowText,
    fontWeight: '600',
  },
  membersList: {
    gap: KumbhSpacing.md,
  },

  // Lost member card
  lostMemberCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    gap: KumbhSpacing.md,
    ...KumbhShadow.sm,
  },
  lostCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  lostCardIcon: {
    fontSize: 28,
  },
  lostCardTitle: {
    ...KumbhTypography.h4,
    color: '#166534',
    fontWeight: '700',
  },
  lostCardDesc: {
    ...KumbhTypography.small,
    color: '#15803D',
    lineHeight: 18,
  },
  lostSearchBtn: {
    backgroundColor: '#16A34A',
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostSearchBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: KumbhSpacing.base,
  },
  confirmModalBox: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    gap: KumbhSpacing.md,
    ...KumbhShadow.lg,
  },
  confirmModalIcon: {
    fontSize: 48,
  },
  confirmModalTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
    textAlign: 'center',
  },
  confirmModalText: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: KumbhSpacing.md,
    width: '100%',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: KumbhColors.background,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  confirmSosBtn: {
    flex: 1,
    backgroundColor: KumbhColors.emergency,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmSosBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },

  // Lost modal
  lostModalBox: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    width: '100%',
    maxWidth: 380,
    gap: KumbhSpacing.sm,
    ...KumbhShadow.lg,
  },
  lostModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lostModalTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
  },
  closeBtnText: {
    fontSize: 20,
    color: KumbhColors.textSecondary,
    padding: 4,
  },
  lostPickerLabel: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    fontWeight: '700',
  },
  memberChipsScroll: {
    maxHeight: 44,
    marginVertical: 4,
  },
  memberChip: {
    backgroundColor: KumbhColors.background,
    borderRadius: KumbhRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  memberChipSelected: {
    backgroundColor: KumbhColors.primary,
    borderColor: KumbhColors.primary,
  },
  memberChipText: {
    ...KumbhTypography.caption,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  memberChipTextSelected: {
    color: KumbhColors.white,
  },
  lostMemberInfoCard: {
    backgroundColor: KumbhColors.background,
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.md,
    marginTop: 8,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...KumbhTypography.small,
    color: KumbhColors.textSecondary,
    fontWeight: '600',
  },
  infoVal: {
    ...KumbhTypography.small,
    color: KumbhColors.textPrimary,
    fontWeight: '700',
  },
  lostActionsRow: {
    gap: 8,
    marginTop: 10,
  },
  viewOnMapBtn: {
    backgroundColor: KumbhColors.primary,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewOnMapText: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },
  contactLostBtn: {
    backgroundColor: KumbhColors.white,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactLostText: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },

  // Input modal
  inputModalBox: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    width: '100%',
    maxWidth: 360,
    gap: KumbhSpacing.sm,
    ...KumbhShadow.lg,
  },
  inputModalTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
  },
  inputModalDesc: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: 12,
    ...KumbhTypography.body,
    color: KumbhColors.textPrimary,
    minHeight: 48,
  },
  errorText: {
    ...KumbhTypography.caption,
    color: KumbhColors.emergency,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: KumbhSpacing.md,
    marginTop: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: KumbhColors.primary,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },

  highContrastCard: {
    borderWidth: 2,
    borderColor: KumbhColors.textPrimary,
  },
  btnPressed: {
    opacity: 0.8,
  },
  leaveGroupBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  leaveGroupBtnText: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
