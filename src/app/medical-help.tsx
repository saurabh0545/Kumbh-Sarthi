import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
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

export default function MedicalHelpScreen() {
  const router = useRouter();
  const { language } = useSettings();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
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
            {language === 'mr' ? 'वैद्यकीय मदत व रुग्णालय' : language === 'hi' ? 'चिकित्सा सहायता' : 'Medical Help'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>🏥</Text>
            <Text style={styles.heroTitle}>
              {language === 'mr' ? 'वैद्यकीय सेवा व प्रथमोपचार' : 'Medical Assistance'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'mr'
                ? 'कुंभमेळा परिसरातील सर्व प्रथमोपचार व रुग्णालय केंद्रे येथे उपलब्ध आहेत. तात्काळ प्रसंगी १०८ रुग्णवाहिका किंवा आपत्कालीन SOS वापरा.'
                : 'Medical assistance locations will appear here. In an emergency, please use the Emergency SOS or contact nearest aid post.'}
            </Text>
          </View>

          {/* Quick Helpline Box */}
          <Pressable
            style={({ pressed }) => [styles.helplineBox, pressed && styles.btnPressed]}
            onPress={() => Linking.openURL('tel:108')}
            accessibilityRole="button"
            accessibilityLabel="Call 108 Emergency Ambulance"
          >
            <View style={styles.helplineIconBox}>
              <Text style={styles.helplineIcon}>📞</Text>
            </View>
            <View style={styles.helplineInfo}>
              <Text style={styles.helplineTitle}>
                {language === 'mr' ? 'महाराष्ट्र रुग्णवाहिका हेल्पलाईन' : 'National Ambulance Helpline'}
              </Text>
              <Text style={styles.helplineNumber}>
                {language === 'mr' ? '१०८ / १०२ · कॉल करण्यासाठी स्पर्श करा' : '108 / 102 · Tap to Call'}
              </Text>
            </View>
          </Pressable>

          {/* Established Medical Posts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'जवळचे प्रथमोपचार व मदत केंद्र' : 'Nearest First-Aid & Triage Posts'}
            </Text>

            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>
                  {language === 'mr' ? 'मदत केंद्र १: रामकुंड पवित्र घाट' : 'Post #1: Ramkund Sacred Ghat'}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {language === 'mr' ? '२४/७ सुरू' : 'Open 24/7'}
                  </Text>
                </View>
              </View>
              <Text style={styles.postDesc}>
                {language === 'mr'
                  ? 'ऑक्सिजन सपोर्ट, डिहायड्रेशनसाठी ओआरएस, प्रथमोपचार पट्टी आणि डॉक्टर पथक उपस्थित.'
                  : 'Oxygen support, hydration fluids, wound dressing, and paramedic triage.'}
              </Text>
              <View style={styles.postFooter}>
                <Text style={styles.postMeta}>
                  {language === 'mr' ? 'रामकुंड पश्चिम मार्ग · २०० मी.' : 'Ramkund West Walkway · 200m'}
                </Text>
                <Pressable
                  style={styles.routeLink}
                  onPress={() =>
                    router.push({
                      pathname: '/safe-route',
                      params: { to: 'Sector 1 Medical Aid Post' },
                    } as any)
                  }
                >
                  <Text style={styles.routeLinkText}>
                    {language === 'mr' ? 'सुरक्षित मार्ग पहा →' : 'Get Safe Route →'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>
                  {language === 'mr' ? 'मदत केंद्र २: तपोवन भाविक छावणी रुग्णालय' : 'Post #2: Tapovan Camp Field Hospital'}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {language === 'mr' ? '२४/७ सुरू' : 'Open 24/7'}
                  </Text>
                </View>
              </View>
              <Text style={styles.postDesc}>
                {language === 'mr'
                  ? 'अतिदक्षता विभाग (ICU), कार्डियाक सपोर्ट, औषध वाटप केंद्र आणि सज्ज रुग्णवाहिका कक्ष.'
                  : 'Full-bed clinic, specialized cardiac stabilization, ambulance bay.'}
              </Text>
              <View style={styles.postFooter}>
                <Text style={styles.postMeta}>
                  {language === 'mr' ? 'तपोवन सेक्टर ३ · ८०० मी.' : 'Tapovan Sector 3 · 800m'}
                </Text>
                <Pressable
                  style={styles.routeLink}
                  onPress={() =>
                    router.push({
                      pathname: '/safe-route',
                      params: { to: 'Tapovan Field Hospital' },
                    } as any)
                  }
                >
                  <Text style={styles.routeLinkText}>
                    {language === 'mr' ? 'सुरक्षित मार्ग पहा →' : 'Get Safe Route →'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* SOS Shortcut */}
          <Pressable
            style={({ pressed }) => [styles.sosBtn, pressed && styles.sosBtnPressed]}
            onPress={() => router.push('/emergency')}
          >
            <Text style={styles.sosBtnText}>
              {language === 'mr' ? '🚨 आपत्कालीन मदत व SOS उघडा' : '🚨 Open Emergency Assistance'}
            </Text>
          </Pressable>
        </ScrollView>
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
    paddingVertical: KumbhSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: KumbhColors.border,
    backgroundColor: KumbhColors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: KumbhColors.backgroundCard,
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
    padding: KumbhSpacing.base,
    gap: KumbhSpacing.lg,
  },
  heroCard: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.xl,
    padding: KumbhSpacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
    gap: KumbhSpacing.sm,
    ...KumbhShadow.sm,
  },
  heroIcon: {
    fontSize: 48,
  },
  heroTitle: {
    ...KumbhTypography.h2,
    color: KumbhColors.textPrimary,
    fontSize: 20,
  },
  heroSubtitle: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  helplineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: KumbhSpacing.md,
  },
  helplineIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineIcon: {
    fontSize: 22,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineTitle: {
    ...KumbhTypography.smallMedium,
    color: '#1E40AF',
    fontWeight: '600',
  },
  helplineNumber: {
    ...KumbhTypography.h3,
    color: '#1D4ED8',
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    gap: KumbhSpacing.md,
  },
  sectionTitle: {
    ...KumbhTypography.h4,
    color: KumbhColors.textPrimary,
  },
  postCard: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    gap: KumbhSpacing.xs,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTitle: {
    ...KumbhTypography.h4,
    fontSize: 15,
    color: KumbhColors.textPrimary,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: KumbhRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  postDesc: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  postMeta: {
    ...KumbhTypography.caption,
    color: KumbhColors.textMuted,
    marginTop: 4,
  },
  sosBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: KumbhRadius.xl,
    alignItems: 'center',
    marginTop: KumbhSpacing.xs,
    ...KumbhShadow.md,
  },
  sosBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  sosBtnText: {
    color: KumbhColors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  routeLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  routeLinkText: {
    ...KumbhTypography.caption,
    color: KumbhColors.primary,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
  },
});
