import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode, Translations, translations } from '@/locales';

interface NotificationSettings {
  safetyAlerts: boolean;
  crowdAlerts: boolean;
  familyAlerts: boolean;
  emergencyAlerts: boolean;
}

interface SettingsContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  largerText: boolean;
  setLargerText: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  shareLocationWithFamily: boolean;
  setShareLocationWithFamily: (val: boolean) => void;
  notifications: NotificationSettings;
  updateNotificationSetting: (key: keyof NotificationSettings, val: boolean) => void;
  textScale: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const KEY_LANG = '@kumbh_app_lang';
const KEY_LARGE_TEXT = '@kumbh_setting_large_text';
const KEY_HIGH_CONTRAST = '@kumbh_setting_high_contrast';
const KEY_REDUCED_MOTION = '@kumbh_setting_reduced_motion';
const KEY_FAMILY_LOCATION = '@kumbh_setting_family_location';
const KEY_NOTIFICATIONS = '@kumbh_setting_notifications';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [largerText, setLargerTextState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [shareLocationWithFamily, setShareLocationWithFamilyState] = useState<boolean>(false); // Default OFF for privacy
  const [notifications, setNotifications] = useState<NotificationSettings>({
    safetyAlerts: true,
    crowdAlerts: true,
    familyAlerts: true,
    emergencyAlerts: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const [savedLang, savedLargeText, savedContrast, savedMotion, savedLoc, savedNotifs] =
          await Promise.all([
            AsyncStorage.getItem(KEY_LANG),
            AsyncStorage.getItem(KEY_LARGE_TEXT),
            AsyncStorage.getItem(KEY_HIGH_CONTRAST),
            AsyncStorage.getItem(KEY_REDUCED_MOTION),
            AsyncStorage.getItem(KEY_FAMILY_LOCATION),
            AsyncStorage.getItem(KEY_NOTIFICATIONS),
          ]);

        if (savedLang === 'en' || savedLang === 'hi' || savedLang === 'mr') {
          setLanguageState(savedLang);
        }
        if (savedLargeText !== null) setLargerTextState(savedLargeText === 'true');
        if (savedContrast !== null) setHighContrastState(savedContrast === 'true');
        if (savedMotion !== null) setReducedMotionState(savedMotion === 'true');
        if (savedLoc !== null) setShareLocationWithFamilyState(savedLoc === 'true');
        if (savedNotifs) {
          try {
            setNotifications(JSON.parse(savedNotifs));
          } catch {}
        }
      } catch (err) {
        console.warn('Error reading settings from storage:', err);
      }
    }
    loadSettings();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(KEY_LANG, lang);
  };

  const setLargerText = async (val: boolean) => {
    setLargerTextState(val);
    await AsyncStorage.setItem(KEY_LARGE_TEXT, String(val));
  };

  const setHighContrast = async (val: boolean) => {
    setHighContrastState(val);
    await AsyncStorage.setItem(KEY_HIGH_CONTRAST, String(val));
  };

  const setReducedMotion = async (val: boolean) => {
    setReducedMotionState(val);
    await AsyncStorage.setItem(KEY_REDUCED_MOTION, String(val));
  };

  const setShareLocationWithFamily = async (val: boolean) => {
    setShareLocationWithFamilyState(val);
    await AsyncStorage.setItem(KEY_FAMILY_LOCATION, String(val));
  };

  const updateNotificationSetting = async (key: keyof NotificationSettings, val: boolean) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    await AsyncStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(updated));
  };

  const t = translations[language] || translations.en;
  const textScale = largerText ? 1.15 : 1.0;

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
