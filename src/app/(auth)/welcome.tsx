import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KumbhLogo } from '@/components/kumbh/KumbhLogo';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
} from '@/constants/kumbh-theme';
import { useSettings } from '@/context/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  badge: { en: string; mr: string; hi: string };
  badgeIcon: string;
  badgeColor: string;
  title: { en: string; mr: string; hi: string };
  subtitle: { en: string; mr: string; hi: string };
  description: { en: string; mr: string; hi: string };
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-heritage',
    badge: {
      en: 'SIMHASTHA MAHA KUMBH · NASHIK',
      mr: 'नाशिक सिंहस्थ महाकुंभमेळा २०२७',
      hi: 'नासिक सिंहस्थ महाकुंभ २०२७',
    },
    badgeIcon: '🪔',
    badgeColor: '#F59E0B',
    title: {
      en: 'The Celestial Confluence on Holy Godavari',
      mr: 'पवित्र गोदावरी तीरावरील सिंहस्थ कुंभ',
      hi: 'पवित्र गोदावरी तट पर सिंहस्थ महाकुंभ',
    },
    subtitle: {
      en: 'A 12-Year Spiritual Awakening of Millions',
      mr: '१२ वर्षांतून एकदा येणारा अलौकिक आध्यात्मिक योग',
      hi: '१२ वर्षों में एक बार आने वाला पावन अमृत संगम',
    },
    description: {
      en: 'Experience the holy Snan at sacred Ramkund and divine Trimbakeshwar Jyotirlinga. Kumbh Sarthi accompanies you as your trusted smart digital companion.',
      mr: 'पवित्र रामकुंडावरील अमृत स्नान आणि श्री त्र्यंबकेश्वर ज्योतिर्लिंगाचे पावन दर्शन. कुंभ सारथी या संपूर्ण यात्रेत आपले विश्वासू डिजिटल मार्गदर्शक आहे.',
      hi: 'पवित्र रामकुंड पर अमृत स्नान और श्री त्र्यंबकेश्वर ज्योतिर्लिंग के पावन दर्शन। कुंभ सारथी इस पुण्य यात्रा में आपका विश्वसनीय डिजिटल मार्गदर्शक है।',
    },
  },
  {
    id: 'slide-ai-crowd',
    badge: {
      en: 'SMART AI SURVEILLANCE & SAFETY',
      mr: 'थेट एआय कॅमेरा व गर्दी नियंत्रण',
      hi: 'लाइव एआई कैमरा व भीड़ प्रबंधन',
    },
    badgeIcon: '🛡️',
    badgeColor: '#10B981',
    title: {
      en: 'Real-Time AI Optical Crowd Intelligence',
      mr: 'एआय कॅमेऱ्यांद्वारे थेट गर्दीचे विश्लेषण',
      hi: 'एआई कैमरों द्वारा लाइव भीड़ विश्लेषण',
    },
    subtitle: {
      en: 'Prevent Stampedes & Move Through Safe Corridors',
      mr: 'चेंगराचेंगरी टाळा व सुरक्षित मार्गाने प्रवास करा',
      hi: 'भीड़ व भगदड़ से बचाव हेतु तत्काल सुरक्षा',
    },
    description: {
      en: 'Smart optical computer vision monitors Gates 1 to 4 and sacred ghat corridors in real-time. Check live density (Low · Moderate · High) before walking.',
      mr: 'गेट १ ते ४ आणि गोदावरी घाटांवर अत्याधुनिक एआय कॅमेऱ्यांचे थेट लक्ष. गर्दीची थेट पातळी (कमी · मध्यम · जास्त) तपासूनच सुरक्षितपणे पुढे जा.',
      hi: 'गेट १ से ४ तक अत्याधुनिक एआई कैमरों द्वारा चौबीसों घंटे लाइव निगरानी। भीड़ की स्थिति (कम · मध्यम · भारी) देखकर ही सुरक्षित मार्ग चुनें।',
    },
  },
  {
    id: 'slide-offline-map',
    badge: {
      en: 'OFFLINE VECTOR MAP & SPOKEN TURNS',
      mr: 'ऑफलाइन कुंभ नकाशा व नेव्हिगेशन',
      hi: 'ऑफलाइन कुंभ नक्शा व नेविगेशन',
    },
    badgeIcon: '🧭',
    badgeColor: '#3B82F6',
    title: {
      en: '100% Offline Maps with Spoken Turn Guidance',
      mr: 'इंटरनेटशिवाय १००% ऑफलाइन आवाजी मार्गदर्शक',
      hi: 'बिना इंटरनेट १००% ऑफलाइन बोलता हुआ नेविगेशन',
    },
    subtitle: {
      en: 'Crystal Clear Navigation Even With Zero Mobile Network',
      mr: 'मोबाईल रेंज नसतानाही सर्व घाटांचा स्पष्ट नकाशा',
      hi: 'नेटवर्क न होने पर भी सभी घाटों का स्पष्ट नक्शा',
    },
    description: {
      en: 'Cellular signals often jam in crowds. Kumbh Sarthi provides a dedicated offline vector map with voice navigation ("Turn Right", "Turn Left") to every ghat.',
      mr: 'गर्दीत मोबाईल रेंज नसतानाही नकाशा अखंड सुरू राहतो. "उजवीकडे वळा", "डावीकडे वळा" अशा स्पष्ट आवाजी सूचनांसह सुरक्षित पायी मार्गदर्शन.',
      hi: 'भीड़ में नेटवर्क जाम होने पर भी नक्शा काम करता है। "दाहिने मुड़ें", "बाएं मुड़ें" जैसी स्पष्ट आवाज के साथ सुरक्षित पैदल मार्गदर्शन।',
    },
  },
  {
    id: 'slide-family-protection',
    badge: {
      en: 'FAMILY RADAR & LIVE LOCATION',
      mr: 'कुटुंब कोड व थेट स्थान सामायिकरण',
      hi: 'परिवार कोड व लाइव स्थान साझाकरण',
    },
    badgeIcon: '👨‍👩‍👧',
    badgeColor: '#8B5CF6',
    title: {
      en: 'Connect Your Family by Code & Share Live Location',
      mr: 'कुटुंब कोडद्वारे जोडा व थेट स्थान सामायिक करा',
      hi: 'परिवार कोड से जुड़ें व लाइव लोकेशन साझा करें',
    },
    subtitle: {
      en: 'Stay Together, Track Loved Ones & Send Instant SOS',
      mr: 'एकमेकांचे थेट स्थान पहा आणि आपत्कालीन मदतीसाठी सज्ज रहा',
      hi: 'एक साथ रहें, अपनों की लोकेशन देखें और तत्काल सहायता पाएं',
    },
    description: {
      en: 'Create a unique family code or join with your group code. See all members in real-time, share your live GPS location, and trigger 1-tap SOS whenever needed.',
      mr: 'एक विशेष कुटुंब कोड तयार करा किंवा कोड टाकून सामील व्हा. सर्व सदस्यांचे थेट स्थान पहा, आपले जीपीएस स्थान सामायिक करा आणि सुरक्षित रहा.',
      hi: 'एक विशेष परिवार कोड बनाएं या कोड डालकर जुड़ें। सभी सदस्यों की लाइव लोकेशन देखें, अपना जीपीएस साझा करें और हमेशा सुरक्षित रहें।',
    },
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, setLanguage } = useSettings();

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== activeSlideIndex && slide >= 0 && slide < ONBOARDING_SLIDES.length) {
      setActiveSlideIndex(slide);
    }
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = activeSlideIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setActiveSlideIndex(nextIndex);
    } else {
      // Last slide -> Proceed directly to Login page
      router.push('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#07090E" />

      {/* ── CLEAN TOP HEADER: LOGO & MULTILINGUAL SWITCHER ─────────────────── */}
      <View style={styles.topHeaderBar}>
        <View style={styles.logoRow}>
          <KumbhLogo size="sm" showText={false} variant="dark" />
          <View style={styles.appTitleBlock}>
            <Text style={styles.appTitleKumbh}>
              Kumbh<Text style={styles.appTitleSarthi}>Sarthi</Text>
            </Text>
          </View>
        </View>

        {/* Clean Language Selector */}
        <View style={styles.langSelectorPill}>
          <Pressable
            style={[styles.langChoice, language === 'mr' && styles.langChoiceActive]}
            onPress={() => setLanguage('mr')}
            hitSlop={6}
          >
            <Text style={[styles.langChoiceText, language === 'mr' && styles.langChoiceTextActive]}>
              मराठी
            </Text>
          </Pressable>

          <Pressable
            style={[styles.langChoice, language === 'hi' && styles.langChoiceActive]}
            onPress={() => setLanguage('hi')}
            hitSlop={6}
          >
            <Text style={[styles.langChoiceText, language === 'hi' && styles.langChoiceTextActive]}>
              हिंदी
            </Text>
          </Pressable>

          <Pressable
            style={[styles.langChoice, language === 'en' && styles.langChoiceActive]}
            onPress={() => setLanguage('en')}
            hitSlop={6}
          >
            <Text style={[styles.langChoiceText, language === 'en' && styles.langChoiceTextActive]}>
              EN
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── SPACIOUS ONBOARDING SLIDES CAROUSEL ─────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carouselScroll}
        contentContainerStyle={styles.carouselContainer}
      >
        {ONBOARDING_SLIDES.map((slide) => {
          const badgeText = slide.badge[language] || slide.badge.en;
          const titleText = slide.title[language] || slide.title.en;
          const subtitleText = slide.subtitle[language] || slide.subtitle.en;
          const descText = slide.description[language] || slide.description.en;

          return (
            <View key={slide.id} style={styles.slidePage}>
              <View style={styles.slideCard}>
                {/* Hero Icon with Glowing Circle */}
                <View style={[styles.iconCircleWrapper, { borderColor: `${slide.badgeColor}35` }]}>
                  <View style={[styles.iconGlow, { backgroundColor: `${slide.badgeColor}20` }]} />
                  <Text style={styles.heroSlideIcon}>{slide.badgeIcon}</Text>
                </View>

                {/* Category Pill */}
                <View style={[styles.slideBadge, { borderColor: `${slide.badgeColor}45` }]}>
                  <Text style={[styles.slideBadgeText, { color: slide.badgeColor }]}>
                    {badgeText}
                  </Text>
                </View>

                {/* Main Titles */}
                <Text style={styles.slideTitle}>{titleText}</Text>
                <Text style={styles.slideSubtitle}>{subtitleText}</Text>

                {/* Description Body */}
                <Text style={styles.slideDesc}>{descText}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── PAGINATION DOTS ─────────────────────────────────────────────────── */}
      <View style={styles.paginationRow}>
        {ONBOARDING_SLIDES.map((_, idx) => (
          <Pressable
            key={idx}
            onPress={() => {
              scrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
              setActiveSlideIndex(idx);
            }}
            style={[
              styles.dot,
              idx === activeSlideIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* ── SINGLE ACTION BUTTON UNTIL LOGIN PAGE ───────────────────────────── */}
      <View style={styles.bottomSection}>
        <Pressable
          style={({ pressed }) => [styles.nextBtn, pressed && styles.btnPressed]}
          onPress={handleNextSlide}
        >
          <Text style={styles.nextBtnText}>
            {activeSlideIndex < ONBOARDING_SLIDES.length - 1
              ? language === 'mr'
                ? 'पुढे जा ›'
                : language === 'hi'
                ? 'आगे बढ़ें ›'
                : 'Next ›'
              : language === 'mr'
              ? 'लॉगिन करा (Continue to Login) →'
              : language === 'hi'
              ? 'लॉगिन करें (Continue to Login) →'
              : 'Continue to Login →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitleBlock: {
    flexDirection: 'column',
  },
  appTitleKumbh: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appTitleSarthi: {
    color: KumbhColors.saffron,
    fontWeight: '900',
  },
  langSelectorPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  langChoice: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langChoiceActive: {
    backgroundColor: KumbhColors.saffron,
  },
  langChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  langChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Carousel
  carouselScroll: {
    flex: 1,
  },
  carouselContainer: {
    alignItems: 'center',
  },
  slidePage: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  slideCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...KumbhShadow.md,
  },
  iconCircleWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  heroSlideIcon: {
    fontSize: 44,
  },
  slideBadge: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 14,
  },
  slideBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4B942',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  slideDesc: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 6,
  },

  // Pagination
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: KumbhColors.saffron,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Bottom action button
  bottomSection: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 8,
  },
  nextBtn: {
    backgroundColor: KumbhColors.saffron,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...KumbhShadow.md,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
