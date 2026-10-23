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

export default function PoliceHelpScreen() {
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
            {language === 'mr' ? 'पोलीस मदत व सुरक्षा' : language === 'hi' ? 'पुलिस सहायता' : 'Police Help'}
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
            <Text style={styles.heroIcon}>👮</Text>
            <Text style={styles.heroTitle}>
              {language === 'mr' ? 'पोलीस सहाय्य व मदत कक्ष' : 'Police Assistance'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'mr'
                ? 'कुंभ सुरक्षेसाठी पोलीस मदत केंद्रे येथे उपलब्ध आहेत. तात्काळ संकटात किंवा हरवलेल्या मुलांसाठी ११२ वर कॉल करा किंवा नियंत्रण कक्षाशी संपर्क साधा.'
                : 'Police assistance locations will appear here. For immediate danger or lost children, connect directly to control room.'}
            </Text>
          </View>

          {/* Quick Helpline Box */}
          <Pressable
            style={({ pressed }) => [styles.helplineBox, pressed && styles.btnPressed]}
            onPress={() => Linking.openURL('tel:112')}
            accessibilityRole="button"
            accessibilityLabel="Call 112 Police Emergency"
          >
            <View style={styles.helplineIconBox}>
              <Text style={styles.helplineIcon}>📞</Text>
            </View>
            <View style={styles.helplineInfo}>
              <Text style={styles.helplineTitle}>
                {language === 'mr' ? 'पोलीस आपत्कालीन हेल्पलाईन' : 'Police Emergency Helpline'}
              </Text>
              <Text style={styles.helplineNumber}>
                {language === 'mr' ? '११२ / १०० · कॉल करण्यासाठी स्पर्श करा' : '112 / 100 · Tap to Call'}
              </Text>
            </View>
          </Pressable>

          {/* Police Booths */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'प्रमुख पोलीस ठाणी व मदत चौक' : 'Key Police & Security Booths'}
            </Text>

            <View style={styles.boothCard}>
              <View style={styles.boothHeader}>
                <Text style={styles.boothTitle}>
                  {language === 'mr' ? 'कुंभ मध्यवर्ती पोलीस नियंत्रण कक्ष' : 'Central Police Control Room'}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {language === 'mr' ? '२४/७ सज्ज' : 'Active'}
                  </Text>
                </View>
              </View>
              <Text style={styles.boothDesc}>
                {language === 'mr'
                  ? 'नाशिक शहर पोलीस, आरएएफ बटालियन, सीसीटीव्ही आणि ड्रोन निगराणीचे मध्यवर्ती समन्वय केंद्र.'
                  : 'Main coordination center for Nashik Police, RAF battalions, and aerial drone surveillance.'}
              </Text>
              <View style={styles.boothFooter}>
                <Text style={styles.boothMeta}>
                  {language === 'mr' ? 'प्रशासकीय परिसर · ४०० मी.' : 'Administrative Zone · 400m'}
                </Text>
                <Pressable
                  style={styles.routeLink}
                  onPress={() =>
                    router.push({
                      pathname: '/safe-route',
                      params: { to: 'Central Police Control Room' },
                    } as any)
                  }
                >
                  <Text style={styles.routeLinkText}>
                    {language === 'mr' ? 'सुरक्षित मार्ग पहा →' : 'Get Safe Route →'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.boothCard}>
              <View style={styles.boothHeader}>
                <Text style={styles.boothTitle}>
                  {language === 'mr' ? 'हरवलेल्या व्यक्ती व मुले शोध कक्ष' : 'Lost Person & Child Helpdesk'}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {language === 'mr' ? 'सक्रिय मदत' : 'Active'}
                  </Text>
                </View>
              </View>
              <Text style={styles.boothDesc}>
                {language === 'mr'
                  ? 'सार्वजनिक ध्वनिक्षेपक यंत्रणा (लाउडस्पीकर), डिजिटल शोध नोंदवही आणि भाविक मदतनीस पथक.'
                  : 'Equipped with public address systems, digital missing registry, and volunteer escorts.'}
              </Text>
              <View style={styles.boothFooter}>
                <Text style={styles.boothMeta}>
                  {language === 'mr' ? 'सेक्टर १ मुख्य प्रवेशद्वार · १५० मी.' : 'Sector 1 Entrance · 150m'}
                </Text>
                <Pressable
                  style={styles.routeLink}
                  onPress={() =>
                    router.push({
                      pathname: '/safe-route',
                      params: { to: 'Gate 1 (Ramkund West)' },
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
  boothCard: {
    backgroundColor: KumbhColors.backgroundCard,
    borderRadius: KumbhRadius.lg,
    padding: KumbhSpacing.base,
    borderWidth: 1,
    borderColor: KumbhColors.border,
    gap: KumbhSpacing.xs,
  },
  boothHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boothTitle: {
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
  boothDesc: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  boothMeta: {
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
  boothFooter: {
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
