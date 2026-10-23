import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KumbhLogo } from '@/components/kumbh/KumbhLogo';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { useSettings } from '@/context/SettingsContext';
import { registerUser } from '@/services/authApi';

export default function RegisterScreen() {
  const router = useRouter();
  const { language, setLanguage } = useSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleRegister = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');

    let hasError = false;

    if (!name.trim()) {
      setNameError(
        language === 'mr'
          ? 'कृपया आपले पूर्ण नाव प्रविष्ट करा'
          : language === 'hi'
          ? 'कृपया अपना पूरा नाम दर्ज करें'
          : 'Please enter your full name'
      );
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameError(
        language === 'mr'
          ? 'नाव किमान २ अक्षरांचे असावे'
          : language === 'hi'
          ? 'नाम कम से कम २ अक्षरों का होना चाहिए'
          : 'Name must be at least 2 characters'
      );
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError(
        language === 'mr'
          ? 'कृपया आपला ईमेल पत्ता प्रविष्ट करा'
          : language === 'hi'
          ? 'कृपया अपना ईमेल पता दर्ज करें'
          : 'Please enter your email address'
      );
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(
        language === 'mr'
          ? 'कृपया वैध ईमेल प्रविष्ट करा (उदा. name@email.com)'
          : language === 'hi'
          ? 'कृपया वैध ईमेल दर्ज करें (उदा. name@email.com)'
          : 'Please enter a valid email address'
      );
      hasError = true;
    }

    if (!password) {
      setPasswordError(
        language === 'mr'
          ? 'कृपया पासवर्ड प्रविष्ट करा'
          : language === 'hi'
          ? 'कृपया पासवर्ड दर्ज करें'
          : 'Please enter a password'
      );
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError(
        language === 'mr'
          ? 'पासवर्ड किमान ६ वर्णांचा असावा'
          : language === 'hi'
          ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए'
          : 'Password must be at least 6 characters'
      );
      hasError = true;
    }

    if (hasError) return;
    if (isLoading) return;

    setIsLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccessMessage(
        language === 'mr'
          ? 'खाते यशस्वीरित्या तयार झाले! लॉगिन पानावर पाठवत आहे...'
          : language === 'hi'
          ? 'खाता सफलतापूर्वक बन गया! लॉगिन पेज पर भेज रहे हैं...'
          : 'Account created successfully! Redirecting to login...'
      );

      setTimeout(() => {
        setIsLoading(false);
        router.replace({
          pathname: '/(auth)/login',
          params: { prefillEmail: email.trim().toLowerCase() },
        });
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err.message ||
        (language === 'mr'
          ? 'नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.'
          : language === 'hi'
          ? 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।'
          : 'Registration failed. Please try again.');
      setGeneralError(msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top Bar: Circular Back & Multilingual Selector ────────── */}
          <View style={styles.topNavRow}>
            <Pressable
              style={({ pressed }) => [styles.backCircleBtn, pressed && styles.btnPressed]}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.backCircleArrow}>←</Text>
            </Pressable>

            {/* Language Selector Pill */}
            <View style={styles.langPillContainer}>
              <Pressable
                style={[styles.langChoice, language === 'mr' && styles.langChoiceActive]}
                onPress={() => setLanguage('mr')}
                hitSlop={4}
              >
                <Text style={[styles.langText, language === 'mr' && styles.langTextActive]}>
                  मराठी
                </Text>
              </Pressable>

              <Pressable
                style={[styles.langChoice, language === 'hi' && styles.langChoiceActive]}
                onPress={() => setLanguage('hi')}
                hitSlop={4}
              >
                <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>
                  हिंदी
                </Text>
              </Pressable>

              <Pressable
                style={[styles.langChoice, language === 'en' && styles.langChoiceActive]}
                onPress={() => setLanguage('en')}
                hitSlop={4}
              >
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                  EN
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── Official Branding Hero Header ─────────────────────────── */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadgeContainer}>
              <KumbhLogo size="md" showText={false} variant="light" />
            </View>

            <View style={styles.officialBadgePill}>
              <Text style={styles.officialBadgeDot}>🪔</Text>
              <Text style={styles.officialBadgeText}>
                {language === 'mr'
                  ? 'सिंहस्थ कुंभमेळा २०२७ · नवीन भाविक नोंदणी'
                  : language === 'hi'
                  ? 'सिंहस्थ महाकुंभ २०२७ · नया श्रद्धालु पंजीकरण'
                  : 'SIMHASTHA MAHA KUMBH · PILGRIM REGISTRATION'}
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              {language === 'mr'
                ? 'नवीन खाते तयार करा 🙏'
                : language === 'hi'
                ? 'नया खाता बनाएं 🙏'
                : 'Create Pilgrim Account 🙏'}
            </Text>

            <Text style={styles.heroSubtitle}>
              {language === 'mr'
                ? 'सुरक्षित डिजिटल यात्रा, कुटुंब सुरक्षा व थेट मार्गदर्शनासाठी सामील व्हा.'
                : language === 'hi'
                ? 'सुरक्षित डिजिटल यात्रा, परिवार सुरक्षा व लाइव मार्गदर्शन हेतु जुड़ें।'
                : 'Join to receive real-time crowd safety, family radar & offline navigation.'}
            </Text>
          </View>

          {/* ── Status Alerts ─────────────────────────────────────────── */}
          {generalError ? (
            <View style={styles.errorBannerCard}>
              <Text style={styles.errorBannerIcon}>⚠️</Text>
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBannerCard}>
              <Text style={styles.successBannerIcon}>✅</Text>
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* ── Professional Registration Card ───────────────────────── */}
          <View style={styles.formCard}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'mr' ? 'पूर्ण नाव' : language === 'hi' ? 'पूरा नाम' : 'Full Name'}
              </Text>
              <View style={[styles.inputBox, nameError ? styles.inputBoxError : null]}>
                <Text style={styles.inputLeadIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError('');
                  }}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. रमेश पाटील'
                      : language === 'hi'
                      ? 'उदा. रमेश शर्मा'
                      : 'e.g. Ramesh Sharma'
                  }
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
              {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'mr' ? 'ईमेल पत्ता' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </Text>
              <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
                <Text style={styles.inputLeadIcon}>✉️</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                    if (generalError) setGeneralError('');
                  }}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. name@kumbh.in'
                      : language === 'hi'
                      ? 'उदा. name@kumbh.in'
                      : 'e.g. name@kumbh.in'
                  }
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'mr'
                  ? 'पासवर्ड (किमान ६ वर्ण)'
                  : language === 'hi'
                  ? 'पासवर्ड (कम से कम ६ अक्षर)'
                  : 'Password (min 6 characters)'}
              </Text>
              <View style={[styles.inputBox, passwordError ? styles.inputBoxError : null]}>
                <Text style={styles.inputLeadIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                    if (generalError) setGeneralError('');
                  }}
                  placeholder={
                    language === 'mr'
                      ? 'मजबूत पासवर्ड तयार करा'
                      : language === 'hi'
                      ? 'मजबूत पासवर्ड बनाएं'
                      : 'Create a secure password'
                  }
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <Pressable
                  style={styles.eyeToggleBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Text style={styles.eyeToggleText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
            </View>

            {/* Primary Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primarySubmitBtn,
                isLoading && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primarySubmitBtnText}>
                  {language === 'mr'
                    ? 'खाते तयार करा →'
                    : language === 'hi'
                    ? 'खाता बनाएं →'
                    : 'Create Account →'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* ── Switch to Login Row ────────────────────────────────────── */}
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>
              {language === 'mr'
                ? 'आधीच खाते आहे का?'
                : language === 'hi'
                ? 'क्या आपके पास पहले से खाता है?'
                : 'Already have an account?'}{' '}
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.switchAuthAction}>
                {language === 'mr'
                  ? 'लॉगिन करा →'
                  : language === 'hi'
                  ? 'लॉगिन करें →'
                  : 'Log In →'}
              </Text>
            </Pressable>
          </View>

          {/* ── Security Trust Footer ──────────────────────────────────── */}
          <View style={styles.trustBadgeFooter}>
            <Text style={styles.trustIcon}>🛡️</Text>
            <Text style={styles.trustText}>
              {language === 'mr'
                ? 'आपला डेटा पूर्णपणे सुरक्षित व गोपनीय ठेवला जातो · नाशिक कुंभमेळा प्रशासन'
                : language === 'hi'
                ? 'आपका डेटा पूरी तरह सुरक्षित व गोपनीय है · नासिक कुंभ मेला प्रशासन'
                : 'Your data is secured by 256-bit encryption · Nashik Kumbh Authority'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },

  // Top Nav
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  backCircleArrow: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langChoice: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langChoiceActive: {
    backgroundColor: KumbhColors.saffron,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadgeContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    ...KumbhShadow.md,
    marginBottom: 12,
  },
  officialBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
    gap: 6,
  },
  officialBadgeDot: {
    fontSize: 12,
  },
  officialBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },

  // Banners
  errorBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorBannerIcon: {
    fontSize: 18,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    lineHeight: 18,
  },
  successBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  successBannerIcon: {
    fontSize: 18,
  },
  successBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#15803D',
    fontWeight: '700',
    lineHeight: 18,
  },

  // Card Form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.md,
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputLeadIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  eyeToggleBtn: {
    padding: 6,
  },
  eyeToggleText: {
    fontSize: 16,
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },

  // Buttons
  primarySubmitBtn: {
    backgroundColor: KumbhColors.saffron,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...KumbhShadow.sm,
  },
  primarySubmitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.65,
  },

  // Switch Auth
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  switchAuthText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  switchAuthAction: {
    fontSize: 14,
    fontWeight: '800',
    color: KumbhColors.primary,
  },

  // Trust footer
  trustBadgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 6,
  },
  trustIcon: {
    fontSize: 13,
  },
  trustText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
