import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '@/components/kumbh/BottomTabBar';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { KumbhLogo } from '@/components/kumbh/KumbhLogo';
import axios from 'axios';
import {
  getActiveApiUrl,
  saveCustomApiUrl,
  loadSavedApiUrl,
  DEFAULT_LAN_HOST_IP,
  normalizeApiUrl,
} from '@/services/api';
import { LanguageCode } from '@/locales';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    language,
    setLanguage,
    t,
    largerText,
    setLargerText,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    shareLocationWithFamily,
    setShareLocationWithFamily,
    notifications,
    updateNotificationSetting,
    textScale,
  } = useSettings();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getActiveApiUrl());
  const [activeServerUrl, setActiveServerUrl] = useState(getActiveApiUrl());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  React.useEffect(() => {
    loadSavedApiUrl().then((url) => {
      setActiveServerUrl(url);
      setServerUrlInput(url);
    });
  }, []);

  const handleTestConnection = async (urlToTest: string) => {
    setIsTesting(true);
    setTestStatus('Testing connection...');
    try {
      const clean = normalizeApiUrl(urlToTest);
      if (!clean) {
        setTestStatus('⚠️ Please enter a server URL');
        setIsTesting(false);
        return;
      }
      setServerUrlInput(clean);
      const resp = await axios.get(`${clean}/api/crowd/Gate-A`, {
        timeout: 7000,
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
      });
      if (resp.status === 200) {
        setTestStatus('✓ Connected! Server & Live Gate 1 reachable.');
      } else {
        setTestStatus(`⚠️ Server responded with HTTP ${resp.status}`);
      }
    } catch (err: any) {
      setTestStatus(`✗ Connection failed: ${err.message || 'Check network / URL'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveServerUrl = async () => {
    const clean = normalizeApiUrl(serverUrlInput);
    const saved = await saveCustomApiUrl(clean || null);
    setActiveServerUrl(saved);
    setServerUrlInput(saved);
    setShowServerModal(false);
    Alert.alert('Server Connected', `App is now communicating with:\n${saved}`);
  };

  const handleResetServerUrl = async () => {
    const saved = await saveCustomApiUrl(null);
    setActiveServerUrl(saved);
    setServerUrlInput(saved);
    setTestStatus('Reset to default Wi-Fi address.');
  };

  // Edit Name State (local profile demonstration)
  const [customName, setCustomName] = useState(user?.name || 'Pilgrim');

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      router.replace('/(auth)/welcome');
    } catch (e) {
      console.warn('Logout error:', e);
      router.replace('/(auth)/welcome');
    }
  };

  const displayName = customName || user?.name || 'Pilgrim';
  const displayEmail = user?.email || 'pilgrim@kumbh.in';
  const displayRole = user?.role || 'PILGRIM';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header matching Screen 6 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {language === 'mr' ? 'प्रोफाइल' : language === 'hi' ? 'प्रोफाइल' : 'Profile'}
            </Text>
            <Pressable
              style={styles.settingsIconBtn}
              onPress={() => setShowAccessibilityModal(true)}
              accessibilityLabel={language === 'mr' ? 'सेटिंग्ज' : 'Settings'}
            >
              <Text style={styles.settingsGearIcon}>⚙️</Text>
            </Pressable>
          </View>

          {/* User Profile Card matching Screen 6 */}
          <View style={[styles.userCard, highContrast && styles.highContrastCard]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>

            <View style={styles.userTextCol}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedShield}>🛡️</Text>
                <Text style={styles.verifiedText}>
                  {language === 'mr' ? 'प्रमाणित भाविक' : language === 'hi' ? 'सत्यापित श्रद्धालु' : 'Verified'}
                </Text>
              </View>
            </View>
          </View>

          {/* Clean Settings Rows matching Screen 6 */}
          <View style={styles.settingsListCard}>
            {/* Edit Profile */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowEditModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>👤</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'प्रोफाइल संपादन' : language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Family Connect */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => router.push('/family' as any)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>👥</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'फॅमिली कनेक्ट (कुटुंब)' : language === 'hi' ? 'फैमिली कनेक्ट' : 'Family Connect'}
                  </Text>
                  <Text style={styles.settingsRowSub}>
                    {language === 'mr' ? 'जोडलेले आहे' : language === 'hi' ? 'जुड़ा हुआ है' : 'Connected'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Accessibility */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowAccessibilityModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>🌓</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'सुलभ वापर व स्क्रीन' : t.profile?.accessibility || 'Accessibility'}
                  </Text>
                  <Text style={styles.settingsRowSub}>
                    {language === 'mr' ? 'मोठा मजकूर, हाय कॉन्ट्रास्ट' : 'Large Text, High Contrast'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Notifications */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowNotificationsModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'सूचना व नोटिफिकेशन्स' : t.profile?.notifications || 'Notifications'}
                  </Text>
                  <Text style={styles.settingsRowSub}>
                    {language === 'mr' ? 'सुरक्षा, गर्दी, कुटुंब, आपत्कालीन' : 'Safety, Crowd, Family, Emergency'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Language */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowLanguageModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>🌐</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'भाषा निवडा' : t.profile?.language || 'Language / भाषा'}
                  </Text>
                  <Text style={styles.settingsRowSub}>
                    {language === 'hi' ? 'हिंदी (Hindi)' : language === 'mr' ? 'मराठी (Marathi)' : 'English'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Privacy */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowPrivacyModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>🔒</Text>
                <View>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'गोपनीयता व स्थान' : t.profile?.privacy || 'Privacy & Location'}
                  </Text>
                  <Text style={styles.settingsRowSub}>
                    {language === 'mr' ? 'स्थान सामायिकरण, डेटा' : 'Location Sharing, Data'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            {/* Server Connection */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => {
                setServerUrlInput(activeServerUrl);
                setTestStatus(null);
                setShowServerModal(true);
              }}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsRowIcon}>📡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsRowLabel}>
                    {language === 'mr' ? 'सर्व्हर व कॅमेरा कनेक्शन' : 'Server & Camera Connection'}
                  </Text>
                  <Text style={styles.settingsRowSub} numberOfLines={1}>
                    {activeServerUrl}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingsRowChevron}>›</Text>
            </Pressable>
            <View style={styles.rowDivider} />

            {/* Logout */}
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && styles.actionPressed]}
              onPress={() => setShowLogoutConfirm(true)}
              accessibilityRole="button"
            >
              <View style={styles.settingsRowLeft}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutLabel}>
                  {language === 'mr' ? 'बाहेर पडा (लॉग आउट)' : t.profile?.logout || 'Logout'}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* App Branding & Version Badge */}
          <View style={styles.appBrandFooter}>
            <KumbhLogo size="sm" showText variant="light" layout="row" />
            <Text style={styles.appVersionText}>
              {language === 'mr' ? 'कुंभ सारथी आवृत्ती १.०.० · नाशिक कुंभमेळा' : 'Kumbh Sarthi v1.0.0 · Nashik Kumbh Mela'}
            </Text>
            <Text style={styles.appBlessingText}>🙏 हर हर गंगे · जय गोदावरी माता</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Modal: Accessibility ───────────────────────────── */}
        <Modal
          visible={showAccessibilityModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAccessibilityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '👓 सुलभ वापर व स्क्रीन' : '👓 Accessibility & Display'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'वाचनाच्या सोयीसाठी अक्षरांचा आकार आणि स्क्रीन कॉन्ट्रास्ट बदला.'
                  : 'Customize display settings for enhanced comfort and readability.'}
              </Text>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.largerText}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'संपूर्ण ॲपमध्ये फॉन्टचा आकार मोठा करतो' : 'Increases font sizing across app'}
                  </Text>
                </View>
                <Switch
                  value={largerText}
                  onValueChange={setLargerText}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.highContrast}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'कडा आणि मजकूर अधिक स्पष्ट दाखवतो' : 'Emphasizes borders & contrast'}
                  </Text>
                </View>
                <Switch
                  value={highContrast}
                  onValueChange={setHighContrast}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.reducedMotion}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'स्क्रीनवरील ॲनिमेशन कमी करतो' : 'Minimizes UI animations'}
                  </Text>
                </View>
                <Switch
                  value={reducedMotion}
                  onValueChange={setReducedMotion}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <Pressable
                style={styles.modalDoneBtn}
                onPress={() => setShowAccessibilityModal(false)}
              >
                <Text style={styles.modalDoneBtnText}>
                  {language === 'mr' ? 'पूर्ण' : 'Done'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Notifications ───────────────────────────── */}
        <Modal
          visible={showNotificationsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotificationsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '🔔 सूचना प्राधान्ये' : '🔔 Notification Preferences'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'आपल्या मोबाईलवर कोणत्या प्रकारच्या सूचना हव्यात ते निवडा.'
                  : 'Select which types of alerts you want to receive on your device.'}
              </Text>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.safetyAlerts}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'अधिकृत पोलीस व सुरक्षा इशारे' : 'Official police & security notices'}
                  </Text>
                </View>
                <Switch
                  value={notifications.safetyAlerts}
                  onValueChange={(val) => updateNotificationSetting('safetyAlerts', val)}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.crowdAlerts}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'थेट गर्दीची माहिती व इशारे' : 'Real-time high density warnings'}
                  </Text>
                </View>
                <Switch
                  value={notifications.crowdAlerts}
                  onValueChange={(val) => updateNotificationSetting('crowdAlerts', val)}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>{t.profile.familyAlerts}</Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr' ? 'कुटुंब सदस्यांचे SOS व संपर्क इशारे' : 'Family SOS & connection notices'}
                  </Text>
                </View>
                <Switch
                  value={notifications.familyAlerts}
                  onValueChange={(val) => updateNotificationSetting('familyAlerts', val)}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <Pressable
                style={styles.modalDoneBtn}
                onPress={() => setShowNotificationsModal(false)}
              >
                <Text style={styles.modalDoneBtnText}>
                  {language === 'mr' ? 'पूर्ण' : 'Done'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Language Selector ───────────────────────── */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '🌐 भाषा निवडा' : '🌐 Select Language / भाषा'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'कुंभ सारथी ॲपसाठी आपली पसंतीची भाषा निवडा.'
                  : 'Choose your preferred language for Kumbh Sarthi.'}
              </Text>

              {(
                [
                  { code: 'mr' as LanguageCode, label: 'मराठी', sub: 'Marathi (सर्व माहिती मराठीत)' },
                  { code: 'hi' as LanguageCode, label: 'हिन्दी', sub: 'Hindi (हिंदी)' },
                  { code: 'en' as LanguageCode, label: 'English', sub: 'English' },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.langSelectItem,
                    language === item.code && styles.langSelectItemActive,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.langSelectName,
                        language === item.code && styles.langSelectNameActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.langSelectSub}>{item.sub}</Text>
                  </View>
                  {language === item.code ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : null}
                </Pressable>
              ))}

              <Pressable
                style={styles.modalDoneBtn}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.modalDoneBtnText}>
                  {language === 'mr' ? 'बंद करा' : 'Close'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Privacy & Location ──────────────────────── */}
        <Modal
          visible={showPrivacyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '🔒 गोपनीयता व स्थान' : '🔒 Privacy & Location'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'आपली सुरक्षितता आणि डेटा गोपनीयता सर्वोच्च प्राधान्य आहे.'
                  : 'Your safety and data privacy are paramount.'}
              </Text>

              <View style={styles.settingToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.settingToggleLabel}>
                    {language === 'mr' ? 'कुटुंबासोबत स्थान सामायिक करा' : 'Share location with family'}
                  </Text>
                  <Text style={styles.settingToggleSub}>
                    {language === 'mr'
                      ? 'डीफॉल्ट बंद आहे. चालू केल्यास केवळ आपले जोडलेले कुटुंब सदस्यच अंदाजे परिसर पाहू शकतात.'
                      : 'Default is OFF. When enabled, only your connected family members can view your general sector.'}
                  </Text>
                </View>
                <Switch
                  value={shareLocationWithFamily}
                  onValueChange={setShareLocationWithFamily}
                  trackColor={{ true: KumbhColors.primary, false: '#CBD5E1' }}
                />
              </View>

              <View style={styles.privacyNoticeBox}>
                <Text style={styles.privacyNoticeTitle}>
                  {language === 'mr' ? '🛡️ डेटा सुरक्षा हमी' : '🛡️ Data Protection Guarantee'}
                </Text>
                <Text style={styles.privacyNoticeText}>
                  {language === 'mr'
                    ? 'आपले स्थान कधीही तृतीय पक्षांसोबत सामायिक केले जात नाही. केवळ आपण SOS पाठवल्यासच मदत पथकाला स्थान मिळते.'
                    : 'Your location is never shared with third parties or publicly displayed. Emergency dispatch coordinates are only transmitted when an SOS is confirmed by you.'}
                </Text>
              </View>

              <Pressable
                style={styles.modalDoneBtn}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalDoneBtnText}>
                  {language === 'mr' ? 'पूर्ण' : 'Done'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Edit Profile ────────────────────────────── */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '✏️ प्रोफाइल संपादन' : '✏️ Edit Profile'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr' ? 'आपले नाव प्रविष्ट करा' : 'Update your display name'}
              </Text>

              <TextInput
                style={styles.modalInput}
                value={customName}
                onChangeText={setCustomName}
                placeholder={language === 'mr' ? 'आपले नाव टाका' : 'Enter your name'}
              />

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.modalDoneBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalDoneBtnText}>
                    {language === 'mr' ? 'जतन करा' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Logout Confirmation ─────────────────────── */}
        <Modal
          visible={showLogoutConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? '🚪 बाहेर पडण्याची पुष्टी करा' : '🚪 Confirm Logout'}
              </Text>
              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'आपण कुंभ सारथी ॲपमधून बाहेर पडू इच्छिता का?'
                  : t.profile.logoutConfirm}
              </Text>

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setShowLogoutConfirm(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable style={styles.modalLogoutConfirmBtn} onPress={handleLogout}>
                  <Text style={styles.modalLogoutConfirmBtnText}>
                    {language === 'mr' ? 'लॉग आउट' : 'Log Out'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Modal: Server & Camera Connection ──────────────── */}
        <Modal
          visible={showServerModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowServerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>
                  {language === 'mr' ? '📡 सर्व्हर व कॅमेरा कनेक्शन' : '📡 Server Connection'}
                </Text>
                <Pressable
                  style={styles.modalCloseBtn}
                  onPress={() => setShowServerModal(false)}
                  hitSlop={8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.modalDesc}>
                {language === 'mr'
                  ? 'थेट गर्दी मोजणी (लॅपटॉप YOLO कॅमेरा) व अलर्ट सिंक करण्यासाठी बॅकएंड पत्ता सेट करा.'
                  : 'Set the backend URL for live crowd detection (laptop YOLO camera), alerts, and family sync.'}
              </Text>

              <Text style={styles.inputLabel}>
                {language === 'mr' ? 'बॅकएंड सर्व्हर पत्ता (URL):' : 'Backend Server URL:'}
              </Text>
              <TextInput
                style={styles.serverInput}
                value={serverUrlInput}
                onChangeText={setServerUrlInput}
                placeholder="e.g. http://192.168.137.1:8001"
                placeholderTextColor={KumbhColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Quick Preset Buttons */}
              <View style={styles.presetRow}>
                <Pressable
                  style={({ pressed }) => [styles.presetBtn, styles.presetBtnHighlight, pressed && styles.actionPressed]}
                  onPress={() => {
                    const url = 'https://fresh-facts-search.loca.lt';
                    setServerUrlInput(url);
                    handleTestConnection(url);
                  }}
                >
                  <Text style={[styles.presetBtnText, styles.presetBtnHighlightText]}>
                    {language === 'mr' ? '⚡ ऑनलाइन टनेल (शिफारस)' : '⚡ Online Tunnel (Recommended)'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.presetRow}>
                <Pressable
                  style={({ pressed }) => [styles.presetBtn, pressed && styles.actionPressed]}
                  onPress={() => {
                    const url = 'http://192.168.137.1:8001';
                    setServerUrlInput(url);
                    handleTestConnection(url);
                  }}
                >
                  <Text style={styles.presetBtnText}>
                    {language === 'mr' ? '📱 लॅपटॉप हॉटस्पॉट' : '📱 Laptop Hotspot'}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.presetBtn, pressed && styles.actionPressed]}
                  onPress={() => {
                    const url = 'http://192.168.29.22:8001';
                    setServerUrlInput(url);
                    handleTestConnection(url);
                  }}
                >
                  <Text style={styles.presetBtnText}>
                    {language === 'mr' ? '📶 स्थानिक वाय-फाय' : '📶 Local Wi-Fi'}
                  </Text>
                </Pressable>
              </View>

              {testStatus ? (
                <View
                  style={[
                    styles.testStatusBox,
                    testStatus.startsWith('✓') ? styles.testSuccess : styles.testWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.testStatusText,
                      testStatus.startsWith('✓') ? styles.testSuccessText : styles.testWarningText,
                    ]}
                  >
                    {testStatus}
                  </Text>
                </View>
              ) : null}

              {/* Quick Ping Test */}
              <Pressable
                style={({ pressed }) => [styles.pingBtn, pressed && styles.actionPressed]}
                onPress={() => handleTestConnection(serverUrlInput)}
                disabled={isTesting}
              >
                <Text style={styles.pingBtnText}>
                  {isTesting
                    ? (language === 'mr' ? 'कनेक्शन तपासत आहे...' : 'Testing connection...')
                    : (language === 'mr' ? '⚡ कनेक्शन तपासा' : '⚡ Test Connection')}
                </Text>
              </Pressable>

              {/* Guide for Mobile on Different Network */}
              <View style={styles.guideBox}>
                <Text style={styles.guideTitle}>
                  {language === 'mr' ? '💡 कॅमेरा व जोडणी मार्गदर्शक:' : '💡 Hotspot & Camera Guide:'}
                </Text>
                <Text style={styles.guideStep}>
                  • <Text style={{ fontWeight: '700' }}>{language === 'mr' ? 'हॉटस्पॉट पत्ता:' : 'Hotspot IP:'}</Text> {language === 'mr' ? 'मोबाईल लॅपटॉप हॉटस्पॉटशी जोडलेला असताना http://192.168.137.1:8001 वापरा.' : 'When phone is connected to Laptop Hotspot, use http://192.168.137.1:8001.'}
                </Text>
                <Text style={styles.guideStep}>
                  • <Text style={{ fontWeight: '700' }}>{language === 'mr' ? 'थेट कॅमेरा:' : 'Live Camera:'}</Text> {language === 'mr' ? 'लॅपटॉपवर python scripts/run_crowd_detection.py सुरू केल्यास गेट १ चा कॅमेरा थेट सुरू होतो.' : 'Runs on the laptop webcam via YOLO. Start python scripts/run_crowd_detection.py on laptop.'}
                </Text>
              </View>

              <View style={styles.modalBtnRow}>
                <Pressable style={styles.modalResetBtn} onPress={handleResetServerUrl}>
                  <Text style={styles.modalResetBtnText}>
                    {language === 'mr' ? 'मूळ स्थितीत आणा' : 'Reset to Default'}
                  </Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSaveServerUrl}>
                  <Text style={styles.modalSaveBtnText}>
                    {language === 'mr' ? 'जतन करा व लागू करा' : 'Save & Apply'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Bottom Tab Bar ───────────────────────────────── */}
        <BottomTabBar unreadAlertsCount={3} />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: KumbhSpacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: KumbhSpacing.base,
    paddingTop: KumbhSpacing.xs,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: KumbhColors.navy,
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: KumbhColors.white,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.sm,
  },
  settingsGearIcon: {
    fontSize: 18,
  },
  userCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: KumbhSpacing.md,
    marginBottom: KumbhSpacing.base,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userTextCol: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: KumbhColors.navy,
  },
  userEmail: {
    fontSize: 13,
    color: KumbhColors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: KumbhRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 2,
  },
  verifiedShield: {
    fontSize: 11,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Settings List Card (Screen 6)
  settingsListCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    marginBottom: KumbhSpacing.base,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: 14,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingsRowIcon: {
    fontSize: 18,
    color: KumbhColors.navy,
    width: 24,
    textAlign: 'center',
  },
  settingsRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  settingsRowSub: {
    fontSize: 11,
    color: KumbhColors.textMuted,
    marginTop: 1,
  },
  settingsRowChevron: {
    fontSize: 20,
    color: KumbhColors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: KumbhColors.borderLight,
    marginLeft: 48,
  },
  logoutIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: KumbhColors.emergency,
  },
  roleText: {
    ...KumbhTypography.caption,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  userIdText: {
    ...KumbhTypography.caption,
    color: KumbhColors.textMuted,
  },
  sectionCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    ...KumbhShadow.sm,
    marginBottom: KumbhSpacing.base,
  },
  sectionTitle: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: KumbhSpacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: KumbhSpacing.xs,
  },
  detailLabel: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
  },
  detailValue: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
  },
  dbStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  dbStatusText: {
    ...KumbhTypography.smallMedium,
    color: '#16A34A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: KumbhColors.borderLight,
    marginVertical: KumbhSpacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: KumbhSpacing.xs,
    minHeight: 44,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KumbhSpacing.sm,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
  },
  actionArrow: {
    fontSize: 16,
    color: KumbhColors.textMuted,
  },
  badgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: KumbhRadius.full,
  },
  activePillText: {
    ...KumbhTypography.caption,
    color: '#15803D',
    fontWeight: '700',
  },
  langBadgeText: {
    ...KumbhTypography.smallMedium,
    color: KumbhColors.primary,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 8,
    marginBottom: KumbhSpacing.lg,
  },
  logoutBtnIcon: {
    fontSize: 18,
  },
  logoutBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.emergency,
    fontWeight: '700',
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: KumbhSpacing.base,
  },
  modalCard: {
    backgroundColor: KumbhColors.white,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    width: '100%',
    maxWidth: 360,
    gap: KumbhSpacing.md,
    ...KumbhShadow.lg,
  },
  modalTitle: {
    ...KumbhTypography.h3,
    color: KumbhColors.textPrimary,
  },
  modalDesc: {
    ...KumbhTypography.small,
    color: KumbhColors.textSecondary,
    lineHeight: 18,
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: KumbhSpacing.xs,
    gap: KumbhSpacing.sm,
  },
  toggleTextCol: {
    flex: 1,
    gap: 2,
  },
  settingToggleLabel: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  settingToggleSub: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    lineHeight: 15,
  },
  modalDoneBtn: {
    backgroundColor: KumbhColors.primary,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 8,
  },
  modalDoneBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },
  langSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: KumbhSpacing.md,
    borderRadius: KumbhRadius.md,
    backgroundColor: KumbhColors.background,
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  langSelectItemActive: {
    backgroundColor: '#FFF0E8',
    borderColor: KumbhColors.primary,
  },
  langSelectName: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  langSelectNameActive: {
    color: KumbhColors.primary,
    fontWeight: '700',
  },
  langSelectSub: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
  },
  checkMark: {
    fontSize: 16,
    color: KumbhColors.primary,
    fontWeight: '800',
  },
  privacyNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.md,
    gap: 4,
  },
  privacyNoticeTitle: {
    ...KumbhTypography.caption,
    color: '#166534',
    fontWeight: '700',
  },
  privacyNoticeText: {
    ...KumbhTypography.caption,
    color: '#15803D',
    lineHeight: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.md,
    ...KumbhTypography.body,
    color: KumbhColors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: KumbhSpacing.md,
    marginTop: 8,
  },
  modalCancelBtn: {
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
  modalCancelBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textPrimary,
    fontWeight: '600',
  },
  modalLogoutConfirmBtn: {
    flex: 1,
    backgroundColor: KumbhColors.emergency,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalLogoutConfirmBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: KumbhColors.textMuted,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: KumbhColors.navy,
    marginBottom: 4,
  },
  serverInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    borderRadius: KumbhRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: KumbhColors.navy,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: KumbhRadius.sm,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  presetBtnHighlight: {
    backgroundColor: '#FFF7ED',
    borderColor: KumbhColors.saffron,
    paddingVertical: 9,
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: KumbhColors.navy,
  },
  presetBtnHighlightText: {
    color: KumbhColors.saffron,
    fontSize: 12,
  },
  testStatusBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: KumbhRadius.md,
    marginBottom: 10,
  },
  testSuccess: {
    backgroundColor: '#DCFCE7',
  },
  testWarning: {
    backgroundColor: '#FEE2E2',
  },
  testStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testSuccessText: {
    color: '#15803D',
  },
  testWarningText: {
    color: '#B91C1C',
  },
  pingBtn: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: KumbhColors.saffron,
    paddingVertical: 9,
    borderRadius: KumbhRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pingBtnText: {
    color: KumbhColors.saffron,
    fontSize: 13,
    fontWeight: '700',
  },
  guideBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: KumbhRadius.md,
    padding: 10,
    marginBottom: 16,
    gap: 4,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: KumbhColors.navy,
    marginBottom: 2,
  },
  guideStep: {
    fontSize: 11,
    color: KumbhColors.textSecondary,
    lineHeight: 16,
  },
  modalResetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  modalResetBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: KumbhColors.saffron,
    borderRadius: KumbhRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  modalSaveBtnText: {
    ...KumbhTypography.bodyMedium,
    color: KumbhColors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  highContrastCard: {
    borderWidth: 2,
    borderColor: KumbhColors.textPrimary,
  },
  actionPressed: {
    opacity: 0.7,
  },
  appBrandFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: KumbhSpacing.xl,
    paddingVertical: KumbhSpacing.base,
    gap: 4,
  },
  appVersionText: {
    ...KumbhTypography.caption,
    color: KumbhColors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  appBlessingText: {
    ...KumbhTypography.caption,
    color: KumbhColors.saffron,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 36,
  },
});
