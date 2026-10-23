import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KumbhMapView, RoutePoint } from '@/components/kumbh/KumbhMapView';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { MOCK_MAP_LOCATIONS } from '@/data/mock-data';
import { useSettings } from '@/context/SettingsContext';
import { useGate1Crowd } from '@/hooks/useGate1Crowd';
import {
  useUserLocation,
  calculateDistanceKm,
  openGoogleMapsNavigation,
} from '@/hooks/useUserLocation';
import {
  Coordinate,
  NavLocation,
  PRESET_ORIGINS,
  PRESET_DESTINATIONS,
  SafeRouteOption,
  TurnStep,
  calculateLiveRoute,
  formatNavDistance,
  formatNavDuration,
} from '@/utils/navigationService';

export default function SafeRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ to?: string; from?: string }>();
  const { t, highContrast, language } = useSettings();
  const { crowdData } = useGate1Crowd(4000);
  const { userLocation, isLoadingLocation, requestLocation } = useUserLocation();

  const getLocalizedName = (id: string, def: string) => {
    if (language !== 'mr') return def;
    const map: Record<string, string> = {
      'orig-gps': 'माझे थेट स्थान',
      'orig-railway': 'नाशिक रोड रेल्वे स्थानक',
      'orig-cbs': 'सीबीएस मध्यवर्ती बस स्थानक',
      'orig-dwarka': 'द्वारका सर्कल',
      'orig-mumbai-naka': 'मुंबई नाका इंटरचेंज',
      'orig-trimbak': 'त्र्यंबकेश्वर मंदिर मार्ग',
      'orig-panchavati': 'पंचवटी बाजार',
      'dest-ramkund': 'रामकुंड पवित्र घाट',
      'dest-tapovan': 'तपोवन भाविक छावणी',
      'dest-gate1': 'गेट १ (रामकुंड पश्चिम)',
      'dest-gate2': 'गेट २ (तपोवन उत्तर)',
      'dest-kalaram': 'श्री काळाराम मंदिर',
      'dest-medical': 'सेक्टर १ वैद्यकीय केंद्र',
      'dest-police': 'मध्यवर्ती पोलीस नियंत्रण कक्ष',
    };
    return map[id] || def;
  };

  const isGate1High = crowdData?.density === 'HIGH';

  // Mode: Walking or Vehicle
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');

  // Selected Origin & Destination
  const [selectedOriginId, setSelectedOriginId] = useState<string>('orig-gps');
  const [selectedDestId, setSelectedDestId] = useState<string>(() => {
    if (params.to) {
      const match = PRESET_DESTINATIONS.find((d) =>
        d.name.toLowerCase().includes(params.to!.toLowerCase()) ||
        params.to!.toLowerCase().includes(d.name.toLowerCase())
      );
      if (match) return match.id;
    }
    return PRESET_DESTINATIONS[0].id;
  });

  // Selected corridor route (A or B)
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    isGate1High ? 'corridor-b' : 'corridor-a'
  );

  // Live Navigation State
  const [isLiveNavActive, setIsLiveNavActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Routes calculated from navigationService
  const [routes, setRoutes] = useState<{
    primary: SafeRouteOption | null;
    alternative: SafeRouteOption | null;
  }>({ primary: null, alternative: null });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(true);

  // Resolved Coordinates
  const currentOriginLocation: NavLocation = useMemo(() => {
    if (selectedOriginId === 'orig-gps' && userLocation) {
      return {
        id: 'orig-gps',
        name: userLocation.address || t.route.currentLocation,
        category: 'HUB',
        coordinate: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        description: t.route.currentLocation,
      };
    }
    const found = PRESET_ORIGINS.find((o) => o.id === selectedOriginId);
    return found || PRESET_ORIGINS[0];
  }, [selectedOriginId, userLocation, t.route.currentLocation]);

  const currentDestLocation: NavLocation = useMemo(() => {
    const found = PRESET_DESTINATIONS.find((d) => d.id === selectedDestId);
    return found || PRESET_DESTINATIONS[0];
  }, [selectedDestId]);

  // Recalculate routes whenever origin, destination, travelMode, or crowd congestion changes
  useEffect(() => {
    let isCancelled = false;

    async function loadRoutes() {
      setIsCalculatingRoute(true);
      try {
        const startCoord = currentOriginLocation.coordinate;
        const endCoord = currentDestLocation.coordinate;

        // Auto switch to vehicle mode if distance is large (> 2.5 km)
        const distKm = calculateDistanceKm(
          startCoord.latitude,
          startCoord.longitude,
          endCoord.latitude,
          endCoord.longitude
        );
        const resolvedMode = distKm > 2.5 ? 'driving' : travelMode;
        if (distKm > 2.5 && travelMode !== 'driving') {
          setTravelMode('driving');
        }

        const calculated = await calculateLiveRoute(
          startCoord,
          endCoord,
          resolvedMode,
          isGate1High
        );

        if (!isCancelled) {
          setRoutes({
            primary: calculated.primary,
            alternative: calculated.alternative,
          });
          setCurrentStepIndex(0);
        }
      } catch (err) {
        console.warn('Route calculation error:', err);
      } finally {
        if (!isCancelled) {
          setIsCalculatingRoute(false);
        }
      }
    }

    loadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [currentOriginLocation, currentDestLocation, travelMode, isGate1High]);

  // Active Selected Route
  const activeRoute = useMemo(() => {
    if (selectedRouteId === 'corridor-b' && routes.alternative) {
      return routes.alternative;
    }
    return routes.primary;
  }, [selectedRouteId, routes]);

  const activeSteps: TurnStep[] = activeRoute?.steps || [];
  const currentStep = activeSteps[Math.min(currentStepIndex, activeSteps.length - 1)];

  // Swap Origin and Destination
  const handleSwapEndpoints = () => {
    const prevOrigin = selectedOriginId;
    // Map to a reasonable destination or default
    const matchingDest = PRESET_DESTINATIONS.find((d) => d.id === prevOrigin);
    if (matchingDest) {
      setSelectedDestId(matchingDest.id);
    }
    const matchingOrig = PRESET_ORIGINS.find((o) => o.id === selectedDestId);
    if (matchingOrig) {
      setSelectedOriginId(matchingOrig.id);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleOpenGoogleMaps = () => {
    openGoogleMapsNavigation(
      currentDestLocation.coordinate.latitude,
      currentDestLocation.coordinate.longitude,
      currentDestLocation.name,
      currentOriginLocation.coordinate.latitude,
      currentOriginLocation.coordinate.longitude
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            onPress={() => router.back()}
            accessibilityLabel={t.common.back}
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>{t.route.title}</Text>
            <Text style={styles.headerSubtitle}>{t.route.subtitle}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.myGpsTopBtn, pressed && styles.btnPressed]}
            onPress={() => {
              setSelectedOriginId('orig-gps');
              requestLocation(false);
            }}
            accessibilityLabel={t.map.myLocation}
          >
            <Text style={styles.myGpsTopIcon}>📍</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Advisory Alert Banner */}
          <View style={styles.advisoryBanner}>
            <Text style={styles.advisoryIcon}>🛡️</Text>
            <Text style={styles.advisoryText}>{t.route.advisoryText}</Text>
          </View>

          {/* Gate 1 Congestion Warning Banner if Active */}
          {isGate1High && (
            <View style={styles.congestionAlertBanner}>
              <Text style={styles.congestionAlertIcon}>🔴</Text>
              <Text style={styles.congestionAlertText}>
                {t.route.congestedWarning}
              </Text>
            </View>
          )}

          {/* Professional Interactive Leaflet Map */}
          <View style={styles.mapCard}>
            <View style={styles.mapHeaderRow}>
              <View style={styles.mapBadgeRow}>
                <Text style={styles.mapHeaderIcon}>🧭</Text>
                <Text style={styles.mapHeaderTitle}>
                  {activeRoute?.title || t.route.title}
                </Text>
              </View>
              {activeRoute && (
                <View style={styles.mapDistBadge}>
                  <Text style={styles.mapDistBadgeText}>
                    📏 {activeRoute.distanceDisplay} · ⏱️ {activeRoute.durationDisplay}
                  </Text>
                </View>
              )}
            </View>

            <KumbhMapView
              locations={MOCK_MAP_LOCATIONS}
              selectedLocation={null}
              onSelectLocation={(loc) => {
                const matchDest = PRESET_DESTINATIONS.find((d) => d.name.includes(loc.name));
                if (matchDest) setSelectedDestId(matchDest.id);
              }}
              userLocation={userLocation}
              isLoadingLocation={isLoadingLocation}
              routeCoordinates={activeRoute?.coordinates || []}
              routeColor={activeRoute?.color || '#16A34A'}
              origin={currentOriginLocation.coordinate}
              destination={currentDestLocation.coordinate}
              isNavigating={isLiveNavActive}
              navTurnText={currentStep?.instruction}
              navTurnIcon={currentStep?.icon}
              navDistanceText={
                currentStep ? formatNavDistance(currentStep.distanceMeters) : undefined
              }
              navEtaText={activeRoute?.durationDisplay}
              onStopNavigation={() => setIsLiveNavActive(false)}
              onMyLocationPress={() => {
                setSelectedOriginId('orig-gps');
                requestLocation(false);
              }}
              height={330}
              labels={{
                standardStreet: t.map.standardStreet,
                satellite: t.map.satellite,
                myLocation: t.map.myLocation,
                kumbhCenter: t.map.kumbhCenter,
                devotees: t.map.devotees,
                navigateHere: t.map.navigateHere,
              }}
            />
          </View>

          {/* Route Planning Card (Origin <-> Destination) */}
          <View style={[styles.plannerCard, highContrast && styles.highContrastCard]}>
            {/* Travel Mode Toggle (Walking / Vehicle) */}
            <View style={styles.modeToggleRow}>
              <Text style={styles.modeLabel}>{t.route.travelMode}:</Text>
              <View style={styles.modeTabs}>
                <Pressable
                  style={[
                    styles.modeTab,
                    travelMode === 'walking' && styles.modeTabActive,
                  ]}
                  onPress={() => setTravelMode('walking')}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      travelMode === 'walking' && styles.modeTabTextActive,
                    ]}
                  >
                    {t.route.modeWalk}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modeTab,
                    travelMode === 'driving' && styles.modeTabActive,
                  ]}
                  onPress={() => setTravelMode('driving')}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      travelMode === 'driving' && styles.modeTabTextActive,
                    ]}
                  >
                    {t.route.modeDrive}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Origin (From) */}
            <View style={styles.planRow}>
              <View style={styles.planPinBoxFrom}>
                <Text style={styles.planPin}>🟢</Text>
              </View>
              <View style={styles.planTextCol}>
                <Text style={styles.planLabel}>{t.route.from}</Text>
                <Text style={styles.planValue}>
                  {getLocalizedName(currentOriginLocation.id, currentOriginLocation.name)}
                </Text>
                <Text style={styles.planSubvalue}>{currentOriginLocation.description}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.swapBtn, pressed && styles.btnPressed]}
                onPress={handleSwapEndpoints}
                accessibilityLabel="Swap points"
              >
                <Text style={styles.swapIcon}>⇅</Text>
              </Pressable>
            </View>

            {/* Quick Origin Selectors Scroll */}
            <View style={styles.chipsRow}>
              <Text style={styles.chipsSectionLabel}>{t.route.originSelection}:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESET_ORIGINS.map((orig) => {
                  const isSelected = selectedOriginId === orig.id;
                  return (
                    <Pressable
                      key={orig.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedOriginId(orig.id)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {getLocalizedName(orig.id, orig.name)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.planDividerLine} />

            {/* Destination (To) */}
            <View style={styles.planRow}>
              <View style={styles.planPinBoxTo}>
                <Text style={styles.planPin}>🏁</Text>
              </View>
              <View style={styles.planTextCol}>
                <Text style={styles.planLabel}>{t.route.to}</Text>
                <Text style={styles.planValueDestination}>
                  {getLocalizedName(currentDestLocation.id, currentDestLocation.name)}
                </Text>
                <Text style={styles.planSubvalue}>{currentDestLocation.description}</Text>
              </View>
            </View>

            {/* Quick Destination Selectors Scroll */}
            <View style={styles.chipsRow}>
              <Text style={styles.chipsSectionLabel}>{t.route.destSelection}:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESET_DESTINATIONS.map((dest) => {
                  const isSelected = selectedDestId === dest.id;
                  return (
                    <Pressable
                      key={dest.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedDestId(dest.id)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {getLocalizedName(dest.id, dest.name)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Calculating Route Loader */}
          {isCalculatingRoute && (
            <View style={styles.calculatingCard}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={styles.calculatingText}>{t.route.calculatingRoute}</Text>
            </View>
          )}

          {/* Corridor Selection Cards */}
          {routes.primary && routes.alternative && (
            <View style={styles.routesList}>
              {/* Corridor A Card */}
              <Pressable
                style={[
                  styles.routeCard,
                  selectedRouteId === 'corridor-a' && styles.routeCardSelected,
                ]}
                onPress={() => {
                  setSelectedRouteId('corridor-a');
                  setCurrentStepIndex(0);
                }}
              >
                <View style={styles.routeCardTop}>
                  <View style={styles.routeCardBadgeRow}>
                    <View
                      style={[
                        styles.corridorBadge,
                        {
                          backgroundColor:
                            routes.primary.crowdLevel === 'HIGH' ? '#FEF2F2' : '#DCFCE7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.corridorBadgeText,
                          {
                            color:
                              routes.primary.crowdLevel === 'HIGH' ? '#DC2626' : '#15803D',
                          },
                        ]}
                      >
                        {routes.primary.crowdLevel === 'HIGH'
                          ? t.status.high
                          : t.route.lowCrowdWalk}
                      </Text>
                    </View>
                    {routes.primary.isRecommended && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>★ {t.route.recommended}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.routeDistanceText}>
                    {routes.primary.distanceDisplay} · {routes.primary.durationDisplay}
                  </Text>
                </View>

                <Text style={styles.routeTitle}>
                  {language === 'mr'
                    ? (routes.primary.crowdLevel === 'HIGH'
                        ? 'कॉरिडोर A: गेट १ थेट मार्ग (जास्त गर्दी)'
                        : 'कॉरिडोर A: कमी गर्दीचा अधिकृत सुरक्षित मार्ग')
                    : routes.primary.title}
                </Text>
                <Text style={styles.routeAdvisory}>
                  {language === 'mr'
                    ? (routes.primary.crowdLevel === 'HIGH'
                        ? '⚠️ गेट १ वर जास्त गर्दी आढळली आहे. कृपया पर्यायी कॉरिडोर B बायपासचा वापर करा.'
                        : 'अधिकृत सुरक्षित पायी मार्ग. येथे स्वयंसेवक, प्रथमोपचार केंद्र आणि मोफत पाण्याची सोय आहे.')
                    : routes.primary.advisory}
                </Text>

                <View style={styles.featuresRow}>
                  {(language === 'mr'
                    ? (routes.primary.crowdLevel === 'HIGH'
                        ? ['🔴 गेट १ जास्त गर्दी', '⏳ विलंबाची शक्यता', '👮 पोलीस नियमन']
                        : ['🟢 कमी गर्दी', '💧 मोफत पिण्याचे पाणी', '🚑 रुग्णवाहिका मार्ग', '☂️ सावलीचे छत'])
                    : routes.primary.features
                  ).map((f, i) => (
                    <Text key={i} style={styles.featureItem}>
                      {f}
                    </Text>
                  ))}
                </View>
              </Pressable>

              {/* Corridor B Card */}
              <Pressable
                style={[
                  styles.routeCard,
                  selectedRouteId === 'corridor-b' && styles.routeCardSelected,
                ]}
                onPress={() => {
                  setSelectedRouteId('corridor-b');
                  setCurrentStepIndex(0);
                }}
              >
                <View style={styles.routeCardTop}>
                  <View style={styles.routeCardBadgeRow}>
                    <View
                      style={[
                        styles.corridorBadge,
                        { backgroundColor: '#FEF3C7' },
                      ]}
                    >
                      <Text style={[styles.corridorBadgeText, { color: '#B45309' }]}>
                        {t.route.moderateCrowdWalk}
                      </Text>
                    </View>
                    {routes.alternative.isRecommended && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>★ {t.route.alternative}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.routeDistanceText}>
                    {routes.alternative.distanceDisplay} · {routes.alternative.durationDisplay}
                  </Text>
                </View>

                <Text style={styles.routeTitle}>
                  {language === 'mr'
                    ? 'कॉरिडोर B: पंचवटी बायपास मार्ग (शिफारस केलेला पर्याय)'
                    : routes.alternative.title}
                </Text>
                <Text style={styles.routeAdvisory}>
                  {language === 'mr'
                    ? 'गेट १ ची गर्दी टाळून जाणारा सुरक्षित व प्रशस्त मार्ग. पोलीस व स्वयंसेवक उपस्थित.'
                    : routes.alternative.advisory}
                </Text>

                <View style={styles.featuresRow}>
                  {(language === 'mr'
                    ? ['🟡 सुरळीत हालचाल', '⚡ गेट १ गर्दी टाळतो', '🚻 स्वच्छतागृह सुविधा', '👮 भाविक सहाय्यक']
                    : routes.alternative.features
                  ).map((f, i) => (
                    <Text key={i} style={styles.featureItem}>
                      {f}
                    </Text>
                  ))}
                </View>
              </Pressable>
            </View>
          )}

          {/* Live Navigation Guidance Player */}
          {activeSteps.length > 0 && (
            <View style={styles.navControlCard}>
              <View style={styles.navControlTop}>
                <Text style={styles.navSectionTitle}>{t.route.turnGuidance}</Text>
                <Pressable
                  style={[
                    styles.startNavBtn,
                    isLiveNavActive && styles.stopNavActiveBtn,
                  ]}
                  onPress={() => setIsLiveNavActive(!isLiveNavActive)}
                >
                  <Text style={styles.startNavBtnText}>
                    {isLiveNavActive ? `✕ ${t.route.stopNav}` : `▶ ${t.route.startNav}`}
                  </Text>
                </Pressable>
              </View>

              {/* Step Player */}
              <View style={styles.currentStepBox}>
                <View style={styles.currentStepIconCircle}>
                  <Text style={styles.currentStepIcon}>{currentStep?.icon || '⬆️'}</Text>
                </View>
                <View style={styles.currentStepTextCol}>
                  <Text style={styles.stepCountLabel}>
                    {t.route.stepOf} {currentStepIndex + 1} / {activeSteps.length}
                  </Text>
                  <Text style={styles.currentStepInstruction}>
                    {language === 'mr' && currentStep?.instruction
                      ? currentStep.instruction
                          .replace('Head towards destination along', 'च्या दिशेने पुढे जा:')
                          .replace('Turn left onto', 'येथे डावीकडे वळा:')
                          .replace('Turn right onto', 'येथे उजवीकडे वळा:')
                          .replace('Continue along', 'सुरक्षित मार्गाने पुढे जा:')
                      : currentStep?.instruction}
                  </Text>
                  {currentStep && (
                    <Text style={styles.stepDistRoad}>
                      🛣️ {currentStep.roadName} · 📏 {formatNavDistance(currentStep.distanceMeters)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Step Navigation Buttons */}
              <View style={styles.stepButtonsRow}>
                <Pressable
                  style={[
                    styles.stepNavBtn,
                    currentStepIndex === 0 && styles.stepNavBtnDisabled,
                  ]}
                  onPress={handlePrevStep}
                  disabled={currentStepIndex === 0}
                >
                  <Text style={styles.stepNavBtnText}>‹ {t.route.prevTurn}</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.stepNavBtnPrimary,
                    currentStepIndex === activeSteps.length - 1 && styles.stepNavBtnDisabled,
                  ]}
                  onPress={handleNextStep}
                  disabled={currentStepIndex === activeSteps.length - 1}
                >
                  <Text style={styles.stepNavBtnPrimaryText}>
                    {currentStepIndex === activeSteps.length - 1
                      ? t.route.arrivedText
                      : `${t.route.nextTurn} ›`}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* External Google Maps Button */}
          <Pressable
            style={({ pressed }) => [styles.googleMapsBtn, pressed && styles.btnPressed]}
            onPress={handleOpenGoogleMaps}
            accessibilityRole="button"
          >
            <Text style={styles.googleMapsIcon}>🌐</Text>
            <Text style={styles.googleMapsBtnText}>{t.route.openGoogleMaps}</Text>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: KumbhSpacing.base,
    paddingVertical: 12,
    backgroundColor: '#FAF7F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  myGpsTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  myGpsTopIcon: {
    fontSize: 16,
  },
  btnPressed: {
    opacity: 0.75,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KumbhSpacing.base,
    paddingTop: 8,
  },
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 8,
  },
  advisoryIcon: {
    fontSize: 18,
  },
  advisoryText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  congestionAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  congestionAlertIcon: {
    fontSize: 18,
  },
  congestionAlertText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.md,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  mapHeaderIcon: {
    fontSize: 16,
  },
  mapHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  mapDistBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapDistBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  plannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  highContrastCard: {
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    ...KumbhShadow.sm,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  planPinBoxFrom: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPinBoxTo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPin: {
    fontSize: 14,
  },
  planTextCol: {
    flex: 1,
  },
  planLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  planValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  planValueDestination: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  planSubvalue: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  chipsRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  chipsSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  calculatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calculatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  routesList: {
    gap: 10,
    marginBottom: 14,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...KumbhShadow.sm,
  },
  routeCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#FAFCFA',
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  corridorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  corridorBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  routeDistanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  routeAdvisory: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureItem: {
    fontSize: 11,
    backgroundColor: '#F1F5F9',
    color: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
  },
  navControlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.md,
  },
  navControlTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  startNavBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stopNavActiveBtn: {
    backgroundColor: '#DC2626',
  },
  startNavBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  currentStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  currentStepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStepIcon: {
    fontSize: 22,
  },
  currentStepTextCol: {
    flex: 1,
  },
  stepCountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  currentStepInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginTop: 2,
  },
  stepDistRoad: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  stepButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepNavBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNavBtnPrimary: {
    flex: 1.5,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNavBtnDisabled: {
    opacity: 0.45,
  },
  stepNavBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  stepNavBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    gap: 8,
    marginBottom: 16,
  },
  googleMapsIcon: {
    fontSize: 16,
  },
  googleMapsBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
