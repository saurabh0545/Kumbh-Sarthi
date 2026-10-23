import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prefillEmail?: string }>();
  const { login, loginGuest } = useAuth();
  const { language, setLanguage } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (params.prefillEmail) {
      setEmail(params.prefillEmail);
    }
  }, [params.prefillEmail]);

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setInfoMessage('');

    let hasError = false;

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
          ? 'कृपया आपला पासवर्ड प्रविष्ट करा'
          : language === 'hi'
          ? 'कृपया अपना पासवर्ड दर्ज करें'
          : 'Please enter your password'
      );
      hasError = true;
    }

    if (hasError) return;
    if (isLoading) return;

    setIsLoading(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      setIsLoading(false);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err.message ||
        (language === 'mr'
          ? 'अवैध ईमेल किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा.'
          : language === 'hi'
          ? 'अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।'
          : 'Invalid email or password. Please try again.');
      setGeneralError(msg);
    }
  };

  const handleGuestEntry = async () => {
    setIsGuestLoading(true);
    try {
      await loginGuest('Pilgrim');
    } catch (_) {}
    setIsGuestLoading(false);
    router.replace('/(tabs)/home');
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
                  ? 'सिंहस्थ कुंभमेळा २०२७ · अधिकृत नागरिक पोर्टल'
                  : language === 'hi'
                  ? 'सिंहस्थ महाकुंभ २०२७ · आधिकारिक नागरिक पोर्टल'
                  : 'SIMHASTHA MAHA KUMBH · OFFICIAL PORTAL'}
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              {language === 'mr'
                ? 'कुंभ सारथी लॉगिन'
                : language === 'hi'
                ? 'कुंभ सारथी लॉगिन'
                : 'Welcome to Kumbh Sarthi'}
            </Text>

            <Text style={styles.heroSubtitle}>
              {language === 'mr'
                ? 'थेट एआय गर्दी नियंत्रण, सुरक्षित मार्ग व कुटुंब रडारसाठी लॉगिन करा.'
                : language === 'hi'
                ? 'लाइव एआई भीड़ नियंत्रण, सुरक्षित मार्ग व परिवार रडार हेतु लॉगिन करें।'
                : 'Sign in to access live crowd AI, spoken route guidance & family radar.'}
            </Text>
          </View>

          {/* ── Status / Error Alerts ──────────────────────────────────── */}
          {generalError ? (
            <View style={styles.errorBannerCard}>
              <Text style={styles.errorBannerIcon}>⚠️</Text>
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          ) : null}

          {infoMessage ? (
            <View style={styles.infoBannerCard}>
              <Text style={styles.infoBannerIcon}>ℹ️</Text>
              <Text style={styles.infoBannerText}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* ── Professional Authentication Card ──────────────────────── */}
          <View style={styles.formCard}>
            {/* Email Field */}
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
                      ? 'उदा. ram@kumbh.in'
                      : language === 'hi'
                      ? 'उदा. ram@kumbh.in'
                      : 'e.g. pilgrim@kumbh.in'
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>
                  {language === 'mr' ? 'पासवर्ड' : language === 'hi' ? 'पासवर्ड' : 'Password'}
                </Text>
                <Pressable
                  onPress={() => {
                    setInfoMessage(
                      language === 'mr'
                        ? 'पासवर्ड रीसेटसाठी कृपया नाशिक महाकुंभ सहायता कक्ष (१०७७) किंवा हेल्पडेस्कशी संपर्क साधा.'
                        : language === 'hi'
                        ? 'पासवर्ड रीसेट हेतु नासिक महाकुंभ सहायता केंद्र (१०७७) से संपर्क करें।'
                        : 'To reset your password, contact the Kumbh Central Helpdesk (1077).'
                    );
                  }}
                  hitSlop={6}
                >
                  <Text style={styles.forgotPasswordLink}>
                    {language === 'mr'
                      ? 'पासवर्ड विसरलात?'
                      : language === 'hi'
                      ? 'पासवर्ड भूल गए?'
                      : 'Forgot Password?'}
                  </Text>
                </Pressable>
              </View>

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
                      ? 'आपला पासवर्ड टाका'
                      : language === 'hi'
                      ? 'अपना पासवर्ड दर्ज करें'
                      : 'Enter your password'
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
                styles.primaryLoginBtn,
                (isLoading || isGuestLoading) && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              onPress={handleLogin}
              disabled={isLoading || isGuestLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryLoginBtnText}>
                  {language === 'mr'
                    ? 'सुरक्षित लॉगिन करा →'
                    : language === 'hi'
                    ? 'सुरक्षित लॉगिन करें →'
                    : 'Secure Login →'}
                </Text>
              )}
            </Pressable>

            {/* Elegant Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {language === 'mr' ? 'किंवा' : language === 'hi' ? 'अथवा' : 'OR'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Direct Guest Pilgrim Access Button */}
            <Pressable
              style={({ pressed }) => [
                styles.guestPillBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleGuestEntry}
              disabled={isLoading || isGuestLoading}
              accessibilityRole="button"
            >
              {isGuestLoading ? (
                <ActivityIndicator size="small" color="#D97706" />
              ) : (
                <>
                  <Text style={styles.guestIcon}>⚡</Text>
                  <Text style={styles.guestBtnText}>
                    {language === 'mr'
                      ? 'थेट अतिथी प्रवेश (नोंदणीशिवाय सुरू करा)'
                      : language === 'hi'
                      ? 'सीधे अतिथि प्रवेश (बिना लॉगिन जारी रखें)'
                      : 'Continue as Guest (Instant Access)'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* ── Switch to Register Screen Row ──────────────────────────── */}
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>
              {language === 'mr'
                ? 'नवीन भाविक आहात का?'
                : language === 'hi'
                ? 'क्या आप नए श्रद्धालु हैं?'
                : "Don't have an account yet?"}{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.switchAuthAction}>
                {language === 'mr'
                  ? 'खाते तयार करा →'
                  : language === 'hi'
                  ? 'नया खाता बनाएं →'
                  : 'Register Now →'}
              </Text>
            </Pressable>
          </View>

          {/* ── Security Trust Footer ──────────────────────────────────── */}
          <View style={styles.trustBadgeFooter}>
            <Text style={styles.trustIcon}>🛡️</Text>
            <Text style={styles.trustText}>
              {language === 'mr'
                ? 'नाशिक पोलीस, महापालिका व आपत्ती व्यवस्थापन प्राधिकरणाद्वारे अधिकृत'
                : language === 'hi'
                ? 'नासिक पुलिस, महापालिका व आपदा प्रबंधन प्राधिकरण द्वारा सुरक्षित'
                : 'Secured by Nashik Police & Disaster Management Authority'}
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
  infoBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerIcon: {
    fontSize: 18,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
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
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontSize: 12,
    fontWeight: '700',
    color: KumbhColors.primary,
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
  primaryLoginBtn: {
    backgroundColor: KumbhColors.saffron,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...KumbhShadow.sm,
  },
  primaryLoginBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  guestPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    height: 48,
    gap: 8,
  },
  guestIcon: {
    fontSize: 15,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
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
