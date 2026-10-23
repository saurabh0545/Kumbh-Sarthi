import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CrowdCard } from '@/components/kumbh/CrowdCard';
import {
  KumbhColors,
  KumbhRadius,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { MOCK_GATES, GateData } from '@/data/mock-data';
import { useGate1Crowd } from '@/hooks/useGate1Crowd';

import { useSettings } from '@/context/SettingsContext';

export default function CrowdMonitorScreen() {
  const router = useRouter();
  const { language } = useSettings();
  const { crowdData, isLoading, isError, errorMessage, lastUpdatedLabel, refetch } = useGate1Crowd(3500);

  // Replace ONLY Gate 1 with real FastAPI data; Gates 2, 3, 4 remain DEMO DATA
  const gates: GateData[] = MOCK_GATES.map((gate) => {
    if (gate.id === 'gate-1') {
      return {
        ...gate,
        peopleCount: crowdData ? crowdData.people : undefined,
        status: crowdData ? crowdData.density : 'LOW',
        updatedAt: isError
          ? (language === 'mr' ? 'कॅमेरा ऑफलाइन' : lastUpdatedLabel)
          : crowdData
          ? (language === 'mr' ? 'आत्ताच अद्यतनित (थेट)' : crowdData.updatedAt)
          : 'Updated just now',
      };
    }
    return gate;
  });

  const screenTitle =
    language === 'mr' ? 'गर्दी नियंत्रण' : language === 'hi' ? 'भीड़ नियंत्रण' : 'Crowd Monitor';
  const screenSubtitle =
    language === 'mr'
      ? 'निघण्यापूर्वी गर्दीची स्थिती तपासा.'
      : language === 'hi'
      ? 'निकलने से पहले भीड़ की स्थिति जांचें।'
      : 'Know before you go.';
  const cameraNotice =
    language === 'mr'
      ? 'गेट १ साठी थेट एआय कॅमेरा मॉनिटरिंग सुरू आहे. इतर विभागांसाठी प्रात्यक्षिक माहिती आहे.'
      : language === 'hi'
      ? 'गेट १ के लिए लाइव एआई कैमरा निगरानी सक्रिय है। अन्य क्षेत्रों के लिए डेमो डेटा है।'
      : 'Live camera monitoring is currently available for Gate 1. Other zones use demonstration data.';
  const backText =
    language === 'mr' ? '← मुख्य पानावर परत जा' : language === 'hi' ? '← मुख्य पृष्ठ पर जाएं' : '← Back to Home';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.subtitle}>{screenSubtitle}</Text>
        </View>
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraEmoji}>📹</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gate cards */}
        {gates.map((gate) => {
          const isGate1 = gate.id === 'gate-1';
          return (
            <CrowdCard
              key={gate.id}
              gate={gate}
              isLoading={isGate1 ? isLoading : false}
              isError={isGate1 ? isError : false}
              errorMessage={isGate1 ? errorMessage : undefined}
              onRetry={isGate1 ? refetch : undefined}
            />
          );
        })}

        {/* Info message */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📡</Text>
          <Text style={styles.infoText}>{cameraNotice}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Back button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => router.back()}
          accessibilityLabel="Go back to home"
          accessibilityRole="button"
        >
          <Text style={styles.backBtnText}>{backText}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: KumbhColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: KumbhSpacing.base,
    paddingBottom: KumbhSpacing.base,
    backgroundColor: KumbhColors.background,
    borderBottomWidth: 1,
    borderBottomColor: KumbhColors.borderLight,
  },
  title: {
    ...KumbhTypography.h1,
    color: KumbhColors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    ...KumbhTypography.body,
    color: KumbhColors.textSecondary,
    marginTop: 2,
  },
  cameraIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  cameraEmoji: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: KumbhSpacing.base,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: KumbhRadius.md,
    padding: KumbhSpacing.base,
    gap: KumbhSpacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: KumbhSpacing.xs,
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  infoText: {
    ...KumbhTypography.small,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: KumbhSpacing.xl,
  },
  footer: {
    padding: KumbhSpacing.base,
    borderTopWidth: 1,
    borderTopColor: KumbhColors.borderLight,
    backgroundColor: KumbhColors.backgroundCard,
  },
  backBtn: {
    height: 52,
    borderRadius: KumbhRadius.xl,
    backgroundColor: KumbhColors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KumbhColors.border,
  },
  backBtnPressed: {
    opacity: 0.75,
  },
  backBtnText: {
    ...KumbhTypography.h4,
    color: KumbhColors.textSecondary,
  },
});
