import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export interface UserLocationCoords {
  latitude: number;
  longitude: number;
  address?: string;
  isSimulated?: boolean;
}

// Nashik Kumbh Ramkund entrance default for fallback only
export const NASHIK_RAMKUND_COORDS: UserLocationCoords = {
  latitude: 19.9972,
  longitude: 73.7905,
  address: 'Ramkund Sacred Ghat, Nashik',
  isSimulated: true,
};

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Opens real Google Maps turn-by-turn navigation from user's current GPS position to Kumbh Mela
 */
export async function openGoogleMapsNavigation(
  destLat: number = 19.9972,
  destLng: number = 73.7905,
  destName: string = 'Ramkund Kumbh Mela Nashik',
  userLat?: number | null,
  userLng?: number | null
): Promise<void> {
  const dist = userLat && userLng ? calculateDistanceKm(userLat, userLng, destLat, destLng) : 5;
  const isWalking = dist <= 2.5;
  const mode = isWalking ? 'w' : 'd';
  const travelMode = isWalking ? 'walking' : 'driving';

  const originPart = userLat && userLng ? `&origin=${userLat},${userLng}` : '';
  const webUrl = `https://www.google.com/maps/dir/?api=1${originPart}&destination=${destLat},${destLng}&travelmode=${travelMode}`;

  if (Platform.OS === 'android') {
    // google.navigation:q=lat,lng opens live Google Maps turn-by-turn guidance
    const navAppUrl = `google.navigation:q=${destLat},${destLng}&mode=${mode}`;
    try {
      const canOpen = await Linking.canOpenURL(navAppUrl);
      if (canOpen) {
        await Linking.openURL(navAppUrl);
        return;
      }
    } catch (_) {}
  } else if (Platform.OS === 'ios') {
    const appleUrl = `maps://app?daddr=${destLat},${destLng}&dirflg=${mode}`;
    try {
      const canOpen = await Linking.canOpenURL(appleUrl);
      if (canOpen) {
        await Linking.openURL(appleUrl);
        return;
      }
    } catch (_) {}
  }

  // Universal browser fallback (opens Google Maps)
  try {
    await Linking.openURL(webUrl);
  } catch (e) {
    Alert.alert('Navigation Error', 'Could not open Google Maps. Please check your browser or map settings.');
  }
}


export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocationCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  const requestLocation = async (silent: boolean = false): Promise<UserLocationCoords | null> => {
    setIsLoadingLocation(true);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (!silent) {
          Alert.alert(
            'Location Services Disabled',
            'Please turn on Location / GPS services on your device to view your live position on the map.'
          );
        }
        setIsLoadingLocation(false);
        return null;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      let finalStatus = status;

      if (status !== 'granted') {
        const { status: askedStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = askedStatus;
      }

      if (finalStatus === 'granted') {
        setPermissionStatus('granted');

        let pos: Location.LocationObject | null = null;
        try {
          pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch {
          pos = await Location.getLastKnownPositionAsync();
        }

        if (pos && pos.coords) {
          const rawLat = pos.coords.latitude;
          const rawLng = pos.coords.longitude;

          // Check if coordinate is the classic Android emulator default (Googleplex, CA)
          const isEmulatorDefault =
            Math.abs(rawLat - 37.42) < 0.2 && Math.abs(rawLng - (-122.08)) < 0.2;

          let targetCoords: UserLocationCoords;

          if (isEmulatorDefault) {
            targetCoords = NASHIK_RAMKUND_COORDS;
          } else {
            targetCoords = {
              latitude: Number(rawLat.toFixed(5)),
              longitude: Number(rawLng.toFixed(5)),
              address: 'Current Live GPS Location',
            };
          }

          // Try reverse geocoding to get friendly street/city name
          try {
            const geocoded = await Location.reverseGeocodeAsync({
              latitude: targetCoords.latitude,
              longitude: targetCoords.longitude,
            });
            if (geocoded && geocoded.length > 0) {
              const place = geocoded[0];
              const parts = [place.name, place.street, place.subregion || place.city, place.region].filter(Boolean);
              if (parts.length > 0) {
                targetCoords.address = parts.slice(0, 2).join(', ');
              }
            }
          } catch (_) {}

          setUserLocation(targetCoords);
          return targetCoords;
        }
        return null;
      } else {
        setPermissionStatus('denied');
        if (!silent) {
          Alert.alert(
            'Location Permission Optional',
            'Location permission is required to pinpoint your live position and guide you to Kumbh Mela.'
          );
        }
        return null;
      }
    } catch (err) {
      setPermissionStatus('denied');
      if (!silent) {
        Alert.alert(
          'Location Unavailable',
          'Current device location could not be determined. Please ensure GPS is active.'
        );
      }
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Automatically request real GPS location on mount!
  useEffect(() => {
    requestLocation(true);
  }, []);

  return {
    userLocation,
    permissionStatus,
    isLoadingLocation,
    requestLocation,
    openGoogleMapsNavigation,
  };
}

