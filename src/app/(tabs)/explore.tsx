import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '@/components/kumbh/BottomTabBar';
import { KumbhMapView } from '@/components/kumbh/KumbhMapView';
import { MapCategoryChip } from '@/components/kumbh/MapCategoryChip';
import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import {
  MOCK_MAP_LOCATIONS,
  MapLocationCategory,
  MapLocationItem,
  INITIAL_MOCK_FAMILY,
} from '@/data/mock-data';
import { useGate1Crowd } from '@/hooks/useGate1Crowd';
import { useSettings } from '@/context/SettingsContext';
import { useUserLocation, calculateDistanceKm } from '@/hooks/useUserLocation';
import { getSavedFamily, SavedFamilyData } from '@/services/familyStorage';
import {
  calculateLiveRoute,
  SafeRouteOption,
  formatNavDistance,
  formatNavDuration,
  calculateDistanceMeters,
} from '@/utils/navigationService';

const getMapCategories = (t: any): { id: 'all' | MapLocationCategory; label: string; icon?: string }[] => [
  { id: 'all', label: t.map.categoryAll },
  { id: 'important', label: t.map.categoryTemples, icon: '🛕' },
  { id: 'safe', label: t.map.categoryLow, icon: '🟢' },
  { id: 'medical', label: t.map.categoryMedicals, icon: '🏥' },
  { id: 'police', label: t.map.categoryPolice, icon: '👮' },
  { id: 'family', label: t.map.categoryFamily, icon: '👨‍👩‍👧' },
];

function calculateDistanceText(
  userLat?: number | null,
  userLng?: number | null,
  locLat?: number,
  locLng?: number
): string | null {
  if (!userLat || !userLng || !locLat || !locLng) return null;
  const dist = calculateDistanceKm(userLat, userLng, locLat, locLng);
  return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist} km`;
}

function calculateWalkTimeText(
  userLat?: number | null,
  userLng?: number | null,
  locLat?: number,
  locLng?: number
): string | null {
  if (!userLat || !userLng || !locLat || !locLng) return null;
  const distMeters = calculateDistanceMeters(userLat, userLng, locLat, locLng);
  const seconds = Math.round(distMeters / 1.1); // approx 4 km/h walking speed
  return formatNavDuration(seconds);
}

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    highlightId?: string;
    destination?: string;
    lat?: string;
    lng?: string;
    name?: string;
  }>();
  const { t, highContrast, language } = useSettings();
  const { crowdData, isError: isCrowdError } = useGate1Crowd(3500);
  const { userLocation, isLoadingLocation, requestLocation } = useUserLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | MapLocationCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocationItem | null>(null);

  // In-Map Live Navigation States (Google Maps Style)
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navRoute, setNavRoute] = useState<SafeRouteOption | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simTimerRef = useRef<any>(null);

  // Offline Kumbh Map State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [savedFamily, setSavedFamily] = useState<SavedFamilyData | null>(null);
  const handledParamKeyRef = useRef<string | null>(null);

  useEffect(() => {
    getSavedFamily().then((sf) => {
      if (sf) setSavedFamily(sf);
    });
  }, []);

  // Merge family members as map locations
  const allLocations: MapLocationItem[] = useMemo(() => {
    const activeMembers = savedFamily?.members && savedFamily.members.length > 0
      ? savedFamily.members
      : INITIAL_MOCK_FAMILY.members;
    const activeGroupName = savedFamily?.groupName || INITIAL_MOCK_FAMILY.groupName;

    const familyLocations: MapLocationItem[] = activeMembers.map((m) => {
      let relName = m.relation;
      if (language === 'mr') {
        if (relName === 'Father') relName = 'वडील';
        else if (relName === 'Mother') relName = 'आई';
        else if (relName === 'Wife') relName = 'पत्नी';
        else if (relName === 'Son') relName = 'मुलगा';
        else if (relName === 'Daughter') relName = 'मुलगी';
        else if (relName === 'Grandmother') relName = 'आजी';
        else if (relName === 'Grandfather') relName = 'आजोबा';
      }
      return {
        id: m.id,
        name: `${m.name} (${relName})`,
        category: 'family',
        categoryLabel: language === 'mr' ? 'कुटुंबातील सदस्य' : 'Family Member',
        icon: '👤',
        latitude: m.latitude || 19.997,
        longitude: m.longitude || 73.79,
        statusBadge:
          m.status === 'SAFE'
            ? language === 'mr'
              ? '🟢 सुरक्षित'
              : '🟢 Safe'
            : language === 'mr'
            ? '🟡 शेवटचे पाहिले'
            : '🟡 Last Seen',
        badgeType: m.status === 'SAFE' ? 'safe' : 'caution',
        source: 'OFFICIAL',
        description:
          language === 'mr'
            ? `जोडलेले कुटुंब: ${activeGroupName}. शेवटचे स्थान: ${m.lastSeenLocation || 'गेट १'}`
            : `Connected in ${activeGroupName}. Last seen near ${m.lastSeenLocation || 'Gate 1'}`,
      };
    });

    if (params.lat && params.lng && params.name) {
      const pLat = parseFloat(params.lat);
      const pLng = parseFloat(params.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        familyLocations.push({
          id: params.highlightId || 'dyn-family-member',
          name: params.name,
          category: 'family',
          categoryLabel: language === 'mr' ? 'कुटुंबातील सदस्य' : 'Family Member',
          icon: '👤',
          latitude: pLat,
          longitude: pLng,
          statusBadge: language === 'mr' ? '🟢 थेट स्थान' : '🟢 Live GPS',
          badgeType: 'safe',
          source: 'OFFICIAL',
          description: language === 'mr' ? 'कुटुंबातील सदस्याचे थेट सामायिक स्थान' : 'Live shared location of family member',
        });
      }
    }

    const MARATHI_OVERRIDES: Record<string, { name: string; categoryLabel: string; statusBadge?: string; description: string }> = {
      'loc-gate-1': {
        name: 'गेट १ (रामकुंड पश्चिम)',
        categoryLabel: 'प्रवेशद्वार',
        statusBadge: '🟢 कमी गर्दी',
        description: 'पवित्र रामकुंड स्नानासाठी थेट प्रवेश. एआय कॅमेऱ्याद्वारे २४ तास निरीक्षण.',
      },
      'loc-gate-2': {
        name: 'गेट २ (तपोवन उत्तर)',
        categoryLabel: 'प्रवेशद्वार',
        statusBadge: '🟡 मध्यम गर्दी',
        description: 'तपोवन भाविक छावणीला जोडणारे उत्तर प्रवेशद्वार.',
      },
      'loc-gate-3': {
        name: 'गेट ३ (पंचवटी पूर्व)',
        categoryLabel: 'प्रवेशद्वार',
        statusBadge: '🟢 कमी गर्दी',
        description: 'पंचवटी प्रवेश मार्ग. सुरळीत पायी हालचाल व कमी प्रतीक्षा.',
      },
      'loc-gate-4': {
        name: 'गेट ४ (गोदावरी दक्षिण)',
        categoryLabel: 'प्रवेशद्वार',
        statusBadge: '🔴 जास्त गर्दी',
        description: 'दक्षिण पार्किंग आगमन केंद्र. पोलीस व स्वयंसेवकांद्वारे गर्दीचे नियमन.',
      },
      'loc-ramkund': {
        name: 'रामकुंड पवित्र घाट',
        categoryLabel: 'पवित्र तीर्थक्षेत्र',
        statusBadge: '🟡 जास्त गर्दी',
        description: 'कुंभमेळ्यातील मुख्य पवित्र स्नान कुंड. स्वयंसेवकांच्या सूचनांचे पालन करा.',
      },
      'loc-tapovan': {
        name: 'तपोवन भाविक छावणी',
        categoryLabel: 'भाविक छावणी',
        statusBadge: '🟢 मोकळी जागा',
        description: 'विश्रांती मंडप, मोफत अन्नछत्र (लंगर) व मोबाइल चार्जिंग सुविधा.',
      },
      'loc-kalaram': {
        name: 'श्री काळाराम मंदिर',
        categoryLabel: 'ऐतिहासिक मंदिर',
        statusBadge: '🟢 सुलभ दर्शन',
        description: 'पंचवटीतील ऐतिहासिक प्रभू श्रीराम मंदिर. ज्येष्ठ नागरिकांसाठी स्वतंत्र रांग.',
      },
      'loc-trimbakeshwar': {
        name: 'त्र्यंबकेश्वर ज्योतिर्लिंग मंदिर',
        categoryLabel: 'पवित्र तीर्थक्षेत्र',
        statusBadge: '🟢 सुलभ दर्शन',
        description: 'भगवान शिवाच्या १२ ज्योतिर्लिंगांपैकी एक. लाखो भाविकांचे श्रद्धास्थान.',
      },
      'loc-med-1': {
        name: 'सेक्टर १ वैद्यकीय मदत केंद्र',
        categoryLabel: 'वैद्यकीय केंद्र',
        statusBadge: '🟢 २४ तास सुरू',
        description: 'ऑक्सिजन, तज्ज्ञ डॉक्टर, तात्काळ बेड व मोफत औषधे उपलब्ध.',
      },
      'loc-med-2': {
        name: 'तपोवन फिल्ड रुग्णालय',
        categoryLabel: 'रुग्णालय',
        statusBadge: '🟢 २४ तास सुरू',
        description: 'रेड क्रॉस आपत्कालीन रुग्णालय व रुग्णवाहिका (ॲम्ब्युलन्स) सज्ज.',
      },
      'loc-pol-1': {
        name: 'मध्यवर्ती पोलीस नियंत्रण कक्ष',
        categoryLabel: 'पोलीस कक्ष',
        statusBadge: '🟢 २४ तास तत्पर',
        description: 'नाशिक पोलीस आपत्कालीन मदत केंद्र व नियंत्रण कक्ष.',
      },
      'loc-water-1': {
        name: 'छत्रपती शिवाजी चौक जल केंद्र',
        categoryLabel: 'पिण्याचे पाणी',
        statusBadge: '🟢 मोफत सेवा',
        description: 'शुद्ध पिण्याचे पाणी व मोफत ओआरएस (ORS) पाकीट वितरण.',
      },
      'loc-toilet-1': {
        name: 'सेक्टर २ स्वच्छतागृह व विश्रांती',
        categoryLabel: 'स्वच्छतागृह',
        statusBadge: '🟢 स्वच्छ व सुसज्ज',
        description: 'स्वच्छ बायो-शौचालये, ज्येष्ठ नागरिक व दिव्यांगांसाठी विशेष सोय.',
      },
    };

    const baseLocations = MOCK_MAP_LOCATIONS.map((loc) => {
      let finalLoc = { ...loc };
      if (language === 'mr' && MARATHI_OVERRIDES[loc.id]) {
        const mr = MARATHI_OVERRIDES[loc.id];
        finalLoc.name = mr.name;
        finalLoc.categoryLabel = mr.categoryLabel;
        if (mr.statusBadge) finalLoc.statusBadge = mr.statusBadge;
        finalLoc.description = mr.description;
      }

      if (loc.id === 'loc-gate-1') {
        if (isCrowdError) {
          return {
            ...finalLoc,
            peopleCount: undefined,
            statusBadge: language === 'mr' ? 'कॅमेरा ऑफलाइन' : 'CAMERA OFFLINE',
            badgeType: 'caution' as any,
          };
        }
        if (crowdData) {
          const badgeText =
            crowdData.density === 'HIGH'
              ? language === 'mr'
                ? '🔴 जास्त गर्दी'
                : '🔴 HIGH CROWD'
              : crowdData.density === 'MODERATE'
              ? language === 'mr'
                ? '🟡 मध्यम गर्दी'
                : '🟡 MODERATE'
              : language === 'mr'
              ? '🟢 कमी गर्दी'
              : '🟢 LOW CROWD';

          return {
            ...finalLoc,
            peopleCount: crowdData.people,
            statusBadge: badgeText,
            badgeType: (crowdData.density === 'HIGH'
              ? 'alert'
              : crowdData.density === 'MODERATE'
              ? 'caution'
              : 'safe') as any,
          };
        }
      }
      return finalLoc;
    });

    return [...baseLocations, ...familyLocations];
  }, [crowdData, isCrowdError, language, params.lat, params.lng, params.name, params.highlightId, savedFamily]);

  // Handle URL deep params (stabilized: only focuses ONCE per navigation)
  useEffect(() => {
    const currentParamKey = `${params.highlightId || ''}_${params.destination || ''}_${params.lat || ''}_${params.lng || ''}`;
    if (!currentParamKey.replace(/_/g, '')) return;
    if (handledParamKeyRef.current === currentParamKey) return;

    if (params.lat && params.lng && params.name) {
      const targetId = params.highlightId || 'dyn-family-member';
      const match = allLocations.find((l) => l.id === targetId);
      if (match) {
        handledParamKeyRef.current = currentParamKey;
        setSelectedLocation(match);
        return;
      }
    }
    if (params.highlightId) {
      const match = allLocations.find((l) => l.id === params.highlightId);
      if (match) {
        handledParamKeyRef.current = currentParamKey;
        setSelectedLocation(match);
      }
    } else if (params.destination) {
      const match = allLocations.find((l) => l.name.toLowerCase().includes(params.destination!.toLowerCase()));
      if (match) {
        handledParamKeyRef.current = currentParamKey;
        setSelectedLocation(match);
      }
    }
  }, [params.highlightId, params.destination, params.lat, params.lng, params.name, allLocations]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'all' || loc.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allLocations, selectedCategory, searchQuery]);

  // Search Results for Google Maps Dropdown Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return allLocations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.description.toLowerCase().includes(query) ||
          loc.categoryLabel.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [allLocations, searchQuery]);

  // Start Google Maps Live Navigation directly on this map
  const handleStartNavigation = async (targetLoc: MapLocationItem) => {
    setSelectedLocation(targetLoc);
    setIsSearchFocused(false);
    setSearchQuery('');

    const originCoords = userLocation
      ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
      : { latitude: 19.9975, longitude: 73.7910 };

    const destCoords = {
      latitude: targetLoc.latitude,
      longitude: targetLoc.longitude,
    };

    try {
      const calculated = await calculateLiveRoute(originCoords, destCoords, 'walking', true);
      const chosen = calculated.primary || calculated.alternative;
      if (chosen) {
        setNavRoute(chosen);
        setCurrentStepIndex(0);
        setIsNavigating(true);
      }
    } catch {
      // Fallback direct route
      const totalDist = calculateDistanceMeters(originCoords.latitude, originCoords.longitude, destCoords.latitude, destCoords.longitude);
      setNavRoute({
        id: 'direct-safe',
        title: language === 'mr' ? `${targetLoc.name} कडे सुरक्षित मार्ग` : `Safe Route to ${targetLoc.name}`,
        subtitle: language === 'mr' ? 'सुरक्षित पायी मार्ग' : 'Pedestrian Safe Corridor',
        isRecommended: true,
        crowdLevel: 'LOW',
        distanceMeters: totalDist,
        durationSeconds: Math.round(totalDist / 1.1),
        distanceDisplay: formatNavDistance(totalDist),
        durationDisplay: formatNavDuration(Math.round(totalDist / 1.1)),
        advisory:
          language === 'mr'
            ? 'गोदावरी मार्गावरील मार्गदर्शक फलकांचे पालन करा'
            : 'Follow marked Godavari pilgrim markings',
        features:
          language === 'mr'
            ? ['कमी गर्दी', 'पाण्याचे केंद्र उपलब्ध']
            : ['Low crowd', 'Water points available'],
        coordinates: [
          originCoords,
          {
            latitude: (originCoords.latitude + destCoords.latitude) / 2,
            longitude: (originCoords.longitude + destCoords.longitude) / 2 + 0.0006,
          },
          destCoords,
        ],
        steps: [
          {
            stepIndex: 0,
            icon: '🚶',
            maneuver: 'depart',
            instruction:
              language === 'mr'
                ? `${targetLoc.name} च्या दिशेने सरळ पुढे चला`
                : `Head straight towards ${targetLoc.name}`,
            voiceInstruction: `Head straight towards ${targetLoc.name}`,
            roadName: language === 'mr' ? 'गोदावरी सुरक्षित पायी मार्ग' : 'Godavari Safe Walkway',
            distanceMeters: Math.round(totalDist * 0.4),
            durationSeconds: Math.round(totalDist * 0.4 / 1.1),
            coordinate: originCoords,
          },
          {
            stepIndex: 1,
            icon: '↱',
            maneuver: 'turn-right',
            instruction:
              language === 'mr'
                ? 'उजवीकडे वळून पवित्र घाट पदपथावर चला'
                : 'Turn right onto Sacred Ghat Walkway',
            voiceInstruction: 'In 50 meters, turn right onto Sacred Ghat Walkway',
            roadName: language === 'mr' ? 'घाट पदपथ' : 'Ghat Walkway',
            distanceMeters: Math.round(totalDist * 0.4),
            durationSeconds: Math.round(totalDist * 0.4 / 1.1),
            coordinate: {
              latitude: (originCoords.latitude + destCoords.latitude) / 2,
              longitude: (originCoords.longitude + destCoords.longitude) / 2,
            },
          },
          {
            stepIndex: 2,
            icon: '🏁',
            maneuver: 'arrive',
            instruction:
              language === 'mr'
                ? 'आपण आपल्या गंतव्य स्थळी पोहोचला आहात'
                : `You have arrived at ${targetLoc.name}`,
            voiceInstruction: `You have arrived safely at ${targetLoc.name}`,
            roadName: targetLoc.name,
            distanceMeters: 0,
            durationSeconds: 0,
            coordinate: destCoords,
          },
        ],
        color: '#16A34A',
      });
      setCurrentStepIndex(0);
      setIsNavigating(true);
    }
  };

  const handleSelectSearchResult = (loc: MapLocationItem) => {
    setSelectedLocation(loc);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setNavRoute(null);
    setCurrentStepIndex(0);
    setIsSimulating(false);
    if (simTimerRef.current) clearInterval(simTimerRef.current);
  };

  const currentStep = navRoute?.steps?.[currentStepIndex];
  const nextStep = navRoute?.steps?.[currentStepIndex + 1];

  const handleNextStep = () => {
    if (navRoute?.steps && currentStepIndex < navRoute.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Live Walk Simulation: Advances turn steps every 5 seconds with speech
  const handleToggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    } else {
      setIsSimulating(true);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      simTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (navRoute?.steps && prev < navRoute.steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(simTimerRef.current);
            setIsSimulating(false);
            return prev;
          }
        });
      }, 5500);
    }
  };

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const distanceToSelected = useMemo(() => {
    if (!selectedLocation) return null;
    return calculateDistanceText(
      userLocation?.latitude,
      userLocation?.longitude,
      selectedLocation.latitude,
      selectedLocation.longitude
    );
  }, [selectedLocation, userLocation]);

  const walkTimeToSelected = useMemo(() => {
    if (!selectedLocation) return null;
    return calculateWalkTimeText(
      userLocation?.latitude,
      userLocation?.longitude,
      selectedLocation.latitude,
      selectedLocation.longitude
    );
  }, [selectedLocation, userLocation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* ── FULL-SCREEN GOOGLE MAPS & OFFLINE LEAFLET VIEW ─────────────── */}
        <View style={styles.mapFullscreenWrapper}>
          <KumbhMapView
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setIsSearchFocused(false);
            }}
            destination={
              selectedLocation
                ? {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    name: selectedLocation.name,
                  }
                : null
            }
            routeCoordinates={
              isNavigating && navRoute?.coordinates
                ? navRoute.coordinates
                : selectedLocation && userLocation
                ? [
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    {
                      latitude: (userLocation.latitude + selectedLocation.latitude) / 2,
                      longitude: (userLocation.longitude + selectedLocation.longitude) / 2 + 0.0005,
                    },
                    { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude },
                  ]
                : undefined
            }
            routeColor={isNavigating ? navRoute?.color || '#16A34A' : '#1A73E8'}
            userLocation={userLocation}
            isLoadingLocation={isLoadingLocation}
            onMyLocationPress={() => requestLocation(false)}
            isNavigating={isNavigating}
            navTurnText={currentStep?.instruction}
            navTurnIcon={currentStep?.icon}
            navNextTurnText={nextStep ? nextStep.instruction : undefined}
            navDistanceText={currentStep ? formatNavDistance(currentStep.distanceMeters) : undefined}
            navEtaText={navRoute?.durationDisplay}
            onStopNavigation={handleStopNavigation}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={(offline) => setIsOfflineMode(offline)}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            labels={{
              standardStreet: t.map.standardStreet,
              satellite: t.map.satellite,
              myLocation: t.map.myLocation,
              kumbhCenter: t.map.kumbhCenter,
              devotees: t.map.devotees,
              navigateHere: t.map.navigateHere,
              activeNav: t.map.activeNav,
              lowCrowdRoute: t.map.lowCrowdRoute,
              exitNav: t.map.exitNav,
            }}
          />
        </View>

        {/* ── FLOATING TOP GOOGLE MAPS SEARCH & DROPDOWN SUGGESTIONS ─────────── */}
        {!isNavigating && (
          <View style={styles.floatingTopOverlay} pointerEvents="box-none">
            {/* Search Pill */}
            <View style={[styles.googleSearchPill, highContrast && styles.highContrastBox]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  language === 'mr'
                    ? 'घाट, मंदिरे, दवाखाने, पोलीस शोधा...'
                    : language === 'hi'
                    ? 'घाट, मंदिर, अस्पताल, पुलिस खोजें...'
                    : 'Search ghats, temples, medical, police...'
                }
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                accessibilityLabel="Search map"
              />
              {searchQuery ? (
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  hitSlop={8}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearSearchText}>✕</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.offlineStatusChip, isOfflineMode && styles.offlineStatusChipActive]}
                  onPress={() => setIsOfflineMode((prev) => !prev)}
                >
                  <Text style={styles.offlineStatusChipText}>
                    {isOfflineMode ? '📴 Offline' : '🌐 Online'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Google Maps Live Search Suggestions Dropdown List */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <View style={styles.searchDropdownCard}>
                <ScrollView
                  style={styles.searchDropdownScroll}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {searchSuggestions.map((item) => {
                    const dist = calculateDistanceText(
                      userLocation?.latitude,
                      userLocation?.longitude,
                      item.latitude,
                      item.longitude
                    );
                    const walkTime = calculateWalkTimeText(
                      userLocation?.latitude,
                      userLocation?.longitude,
                      item.latitude,
                      item.longitude
                    );

                    return (
                      <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemPressed,
                        ]}
                        onPress={() => handleSelectSearchResult(item)}
                      >
                        <View style={styles.dropdownItemIconCircle}>
                          <Text style={styles.dropdownItemIcon}>{item.icon || '📍'}</Text>
                        </View>

                        <View style={styles.dropdownItemTextCol}>
                          <Text style={styles.dropdownItemTitle} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View style={styles.dropdownItemMetaRow}>
                            <Text style={styles.dropdownItemCategory}>{item.categoryLabel}</Text>
                            {dist && (
                              <Text style={styles.dropdownItemDist}>
                                · 📍 {dist} {walkTime ? `(${walkTime})` : ''}
                              </Text>
                            )}
                          </View>
                        </View>

                        <Pressable
                          style={styles.dropdownNavigateBtn}
                          onPress={() => handleStartNavigation(item)}
                        >
                          <Text style={styles.dropdownNavigateIcon}>🧭</Text>
                        </Pressable>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Category Chips Scroll (Horizontal Floating) */}
            {!isSearchFocused && (
              <View style={styles.floatingChipsRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {getMapCategories(t).map((cat) => (
                    <MapCategoryChip
                      key={cat.id}
                      label={cat.label}
                      icon={cat.icon}
                      isActive={selectedCategory === cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      highContrast={highContrast}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* ── OFFLINE MAP NOTICE BANNER (WHEN OFFLINE ACTIVE) ─────────────── */}
        {isOfflineMode && !isNavigating && (
          <View style={styles.offlineNoticeBanner}>
            <Text style={styles.offlineNoticeIcon}>📴</Text>
            <Text style={styles.offlineNoticeText}>
              {language === 'mr'
                ? 'ऑफलाइन कुंभमेळा नकाशा सुरू आहे · जीपीएस व सुरक्षित नेव्हिगेशन इंटरनेटशिवाय कार्यरत'
                : language === 'hi'
                ? 'ऑफलाइन कुंभ मेला नक्शा सक्रिय · जीपीएस और सुरक्षित नेविगेशन बिना इंटरनेट के चालू'
                : 'Offline Kumbh Map Active · Full GPS navigation, gates & ghats work without internet'}
            </Text>
          </View>
        )}

        {/* ── GOOGLE MAPS STYLE BOTTOM LOCATION CARD (On Destination Select) ─ */}
        {selectedLocation && !isNavigating && !isSearchFocused && (
          <View style={styles.googleBottomCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardPlaceIcon}>{selectedLocation.icon || '📍'}</Text>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {selectedLocation.name}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {selectedLocation.categoryLabel}
                    {distanceToSelected ? ` · 📍 ${distanceToSelected}` : ''}
                    {walkTimeToSelected ? ` (${walkTimeToSelected} walk)` : ''}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.cardCloseBtn}
                onPress={() => setSelectedLocation(null)}
                hitSlop={10}
              >
                <Text style={styles.cardCloseText}>✕</Text>
              </Pressable>
            </View>

            {/* Distance, ETA and Crowd Status Pill Row */}
            <View style={styles.statusPillRow}>
              {distanceToSelected && (
                <View style={styles.etaPill}>
                  <Text style={styles.etaPillText}>
                    ⚡ {walkTimeToSelected || '6 min'} · {distanceToSelected}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.statusBadge,
                  String(selectedLocation.statusBadge).includes('HIGH')
                    ? styles.statusHigh
                    : String(selectedLocation.statusBadge).includes('MODERATE')
                    ? styles.statusModerate
                    : styles.statusLow,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    String(selectedLocation.statusBadge).includes('HIGH')
                      ? styles.statusHighText
                      : String(selectedLocation.statusBadge).includes('MODERATE')
                      ? styles.statusModerateText
                      : styles.statusLowText,
                  ]}
                >
                  {selectedLocation.statusBadge || (language === 'mr' ? '🟢 सुरळीत हालचाल' : '🟢 Safe Flow')}
                </Text>
              </View>
            </View>

            {/* Primary Action Button: GOOGLE MAPS STYLE "START NAVIGATION" */}
            <View style={styles.cardActionRow}>
              <Pressable
                style={({ pressed }) => [styles.startNavBtn, pressed && styles.btnPressed]}
                onPress={() => handleStartNavigation(selectedLocation)}
                accessibilityRole="button"
                accessibilityLabel="Start navigation to this place"
              >
                <Text style={styles.startNavBtnIcon}>▶️</Text>
                <Text style={styles.startNavBtnText}>
                  {language === 'mr'
                    ? 'थेट नेव्हिगेशन सुरू करा'
                    : language === 'hi'
                    ? 'लाइव नेविगेशन शुरू करें'
                    : 'Start Live Navigation'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.safeRouteSecondaryBtn, pressed && styles.btnPressed]}
                onPress={() =>
                  router.push({
                    pathname: '/safe-route',
                    params: { to: selectedLocation.name },
                  } as any)
                }
              >
                <Text style={styles.safeRouteSecondaryText}>
                  {language === 'mr'
                    ? 'पर्यायी मार्ग'
                    : language === 'hi'
                    ? 'वैकल्पिक मार्ग'
                    : 'Route Options'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Tab Bar (tucks away when navigating) */}
        {!isNavigating && <BottomTabBar unreadAlertsCount={3} />}
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
    position: 'relative',
    backgroundColor: '#FAF7F0',
  },
  mapFullscreenWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Floating Top Search & Category Overlay (Google Maps Style)
  floatingTopOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 990,
  },
  googleSearchPill: {
    marginHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.md,
  },
  highContrastBox: {
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  clearBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  offlineStatusChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  offlineStatusChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  offlineStatusChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  floatingChipsRow: {
    marginTop: 8,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },

  // Google Maps Style Live Suggestions Dropdown
  searchDropdownCard: {
    marginHorizontal: 14,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.lg,
    overflow: 'hidden',
  },
  searchDropdownScroll: {
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  dropdownItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  dropdownItemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemIcon: {
    fontSize: 18,
  },
  dropdownItemTextCol: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  dropdownItemCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dropdownItemDist: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  dropdownNavigateBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dropdownNavigateIcon: {
    fontSize: 16,
  },

  // Offline Notice Banner
  offlineNoticeBanner: {
    position: 'absolute',
    top: 110,
    left: 14,
    right: 14,
    zIndex: 980,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...KumbhShadow.md,
  },
  offlineNoticeIcon: {
    fontSize: 16,
  },
  offlineNoticeText: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },

  // Google Maps Style Bottom Location Card
  googleBottomCard: {
    position: 'absolute',
    bottom: 74, // sits right above bottom tab bar
    left: 12,
    right: 12,
    zIndex: 995,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardPlaceIcon: {
    fontSize: 24,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  cardCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  etaPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  etaPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusLow: {
    backgroundColor: '#DCFCE7',
  },
  statusModerate: {
    backgroundColor: '#FEF3C7',
  },
  statusHigh: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusLowText: {
    color: '#15803D',
  },
  statusModerateText: {
    color: '#B45309',
  },
  statusHighText: {
    color: '#B91C1C',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  startNavBtn: {
    flex: 1.4,
    backgroundColor: '#16A34A', // Google Maps vibrant green start button
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...KumbhShadow.sm,
  },
  startNavBtnIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  startNavBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  safeRouteSecondaryBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safeRouteSecondaryText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
