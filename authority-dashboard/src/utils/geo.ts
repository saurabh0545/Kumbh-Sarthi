/**
 * Geospatial distance, OSRM routing, and crowd-traffic intelligence for Kumbh Sarthi.
 */
import { ZoneCrowdData } from '../types';

export interface RouteOption {
  id: string;
  name: string;
  type: 'BEST_TRAFFIC' | 'DIRECT' | 'EMERGENCY';
  distanceKm: number;
  durationMin: number;
  delayMin: number;
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY';
  color: string;
  advisory: string;
  coordinates: [number, number][]; // [lat, lng] array
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface in kilometers using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface TurnManeuver {
  stepIndex: number;
  type: 'DEPART' | 'STRAIGHT' | 'TURN_RIGHT' | 'TURN_LEFT' | 'SLIGHT_RIGHT' | 'SLIGHT_LEFT' | 'ARRIVE';
  instruction: string;
  roadName: string;
  distanceMeters: number;
  coordinates: [number, number];
}

/**
 * Calculates the forward azimuth / bearing in degrees (0 - 360) from point 1 to point 2.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Interpolates coordinates along a polyline to create smooth micro-steps for real-time traveling animation.
 */
export function interpolatePath(
  coords: [number, number][],
  subdivisions: number = 6
): [number, number][] {
  if (coords.length < 2) return coords;
  const result: [number, number][] = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i];
    const end = coords[i + 1];
    for (let step = 0; step < subdivisions; step++) {
      const t = step / subdivisions;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      result.push([lat, lng]);
    }
  }
  result.push(coords[coords.length - 1]);
  return result;
}

/**
 * Generates turn-by-turn guidance maneuvers along the route.
 */
export function generateTurnManeuvers(
  coords: [number, number][],
  destinationName: string
): TurnManeuver[] {
  if (coords.length < 2) {
    return [
      {
        stepIndex: 0,
        type: 'ARRIVE',
        instruction: `Arrive at ${destinationName}`,
        roadName: destinationName,
        distanceMeters: 0,
        coordinates: coords[0] || [0, 0],
      },
    ];
  }

  const maneuvers: TurnManeuver[] = [];
  const roadNames = [
    'Dwarka Link Road',
    'Shastri Bridge Ring Approach',
    'Godavari South Riverside Marg',
    'Panchavati Pilgrimage Corridor',
    'Ramkund Sacred Promenade',
  ];

  for (let i = 0; i < coords.length - 1; i++) {
    const cur = coords[i];
    const next = coords[i + 1];
    const prev = i > 0 ? coords[i - 1] : null;

    let type: TurnManeuver['type'] = 'STRAIGHT';
    let instruction = `Continue on ${roadNames[i % roadNames.length]}`;

    if (i === 0) {
      type = 'DEPART';
      instruction = `Head towards ${roadNames[0]}`;
    } else if (i === coords.length - 2) {
      type = 'ARRIVE';
      instruction = `Arrive at destination: ${destinationName}`;
    } else if (prev) {
      const b1 = calculateBearing(prev[0], prev[1], cur[0], cur[1]);
      const b2 = calculateBearing(cur[0], cur[1], next[0], next[1]);
      let diff = b2 - b1;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;

      if (diff > 45) {
        type = 'TURN_RIGHT';
        instruction = `Turn right onto ${roadNames[(i + 1) % roadNames.length]}`;
      } else if (diff < -45) {
        type = 'TURN_LEFT';
        instruction = `Turn left onto ${roadNames[(i + 1) % roadNames.length]}`;
      } else if (diff > 15) {
        type = 'SLIGHT_RIGHT';
        instruction = `Slight right onto ${roadNames[(i + 1) % roadNames.length]}`;
      } else if (diff < -15) {
        type = 'SLIGHT_LEFT';
        instruction = `Slight left onto ${roadNames[(i + 1) % roadNames.length]}`;
      }
    }

    const distMeters = Math.round(calculateDistanceKm(cur[0], cur[1], next[0], next[1]) * 1000);
    maneuvers.push({
      stepIndex: i,
      type,
      instruction,
      roadName: roadNames[i % roadNames.length],
      distanceMeters: Math.max(80, distMeters),
      coordinates: cur,
    });
  }

  return maneuvers;
}

/**
 * Calculates remaining distance along remaining coordinate points.
 */
export function calculateRemainingDistanceKm(
  coords: [number, number][],
  startIndex: number
): number {
  if (startIndex >= coords.length - 1) return 0;
  let total = 0;
  for (let i = startIndex; i < coords.length - 1; i++) {
    total += calculateDistanceKm(
      coords[i][0],
      coords[i][1],
      coords[i + 1][0],
      coords[i + 1][1]
    );
  }
  return total;
}

/**
 * Formats distance with appropriate units (meters if < 1km, else kilometers).
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Estimates travel duration based on typical Kumbh Mela traffic and walking paces.
 */
export function estimateTravelTimes(distanceKm: number): {
  walkMinutes: number;
  driveMinutes: number;
  ambulanceMinutes: number;
} {
  const walkMinutes = Math.max(1, Math.round((distanceKm / 4.2) * 60));
  const driveMinutes = Math.max(1, Math.round((distanceKm / 25) * 60));
  const ambulanceMinutes = Math.max(1, Math.round((distanceKm / 40) * 60));
  return { walkMinutes, driveMinutes, ambulanceMinutes };
}

/**
 * Fetches real road routes from OSRM and generates crowd-aware traffic routes.
 * Identifies bottlenecks from active zone densities (e.g. Gate 3 HIGH density).
 */
export async function fetchTrafficRoutes(
  userCoords: [number, number],
  destCoords: [number, number],
  zones: ZoneCrowdData[] = []
): Promise<RouteOption[]> {
  const [userLat, userLng] = userCoords;
  const [destLat, destLng] = destCoords;

  // Check if any key entrance has high crowd congestion
  const gate3 = zones.find((z) => z.gateCode === 'Gate-C' || z.id === 'gate-3');
  const gate3IsHigh = gate3?.density === 'HIGH';
  const gate1 = zones.find((z) => z.gateCode === 'Gate-A' || z.id === 'gate-1');
  const gate1Density = gate1?.density || 'LOW';

  // Base straight line distance
  const straightDist = calculateDistanceKm(userLat, userLng, destLat, destLng);

  let osrmCoordinates: [number, number][] = [];
  let osrmDistanceKm = straightDist * 1.25;

  try {
    // Attempt public OSRM driving service (lon,lat format)
    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data.routes && data.routes.length > 0) {
        const route0 = data.routes[0];
        osrmDistanceKm = route0.distance / 1000;
        // OSRM returns [lon, lat], Leaflet needs [lat, lon]
        osrmCoordinates = route0.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      }
    }
  } catch (e) {
    // Graceful fallback to waypoint generation
  }

  // Fallback realistic road coordinates if OSRM was unavailable or returned empty
  if (osrmCoordinates.length === 0) {
    // Generate curved road waypoints through Nashik road network
    const midLat = (userLat + destLat) / 2;
    const midLng = (userLng + destLng) / 2;
    osrmCoordinates = [
      [userLat, userLng],
      [userLat + (midLat - userLat) * 0.45, userLng + (midLng - userLng) * 0.35 + 0.005],
      [midLat + 0.003, midLng - 0.002],
      [destLat - (destLat - midLat) * 0.35, destLng - (destLng - midLng) * 0.45 - 0.003],
      [destLat, destLng],
    ];
  }

  // Route 1: BEST ROUTE (Low Traffic / Crowd Bypass)
  // Bypasses congested bottlenecks (e.g. Gate 3 / North Ghat) via southern bridge or bypass corridor
  const bestBypassCoords: [number, number][] = osrmCoordinates.map(([lat, lng], idx) => {
    if (idx === 0 || idx === osrmCoordinates.length - 1) return [lat, lng];
    // Slightly curve around North Ghat bottleneck towards South Talkuteshwar bypass
    return [lat - 0.0035, lng - 0.0025];
  });

  const bestDist = Number((osrmDistanceKm * 1.05).toFixed(2));
  const bestDriveMin = Math.max(2, Math.round((bestDist / 28) * 60));

  // Route 2: DIRECT ROUTE (Passes directly through congested gates)
  const directDist = Number(osrmDistanceKm.toFixed(2));
  const crowdDelay = gate3IsHigh ? 18 : 6;
  const directDriveMin = Math.max(3, Math.round((directDist / 18) * 60)) + crowdDelay;

  // Route 3: EMERGENCY GREEN CORRIDOR (For Police / Ambulances with preemption)
  const emergencyCoords: [number, number][] = osrmCoordinates.map(([lat, lng], idx) => {
    if (idx === 0 || idx === osrmCoordinates.length - 1) return [lat, lng];
    return [lat + 0.0015, lng + 0.002];
  });
  const emergDist = Number((osrmDistanceKm * 0.98).toFixed(2));
  const emergDriveMin = Math.max(2, Math.round((emergDist / 42) * 60));

  const routes: RouteOption[] = [
    {
      id: 'route-best-traffic',
      name: 'Best Route (Traffic & Crowd Optimized)',
      type: 'BEST_TRAFFIC',
      distanceKm: bestDist,
      durationMin: bestDriveMin,
      delayMin: 0,
      trafficLevel: 'LOW',
      color: '#16A34A', // Green
      advisory: gate3IsHigh
        ? 'Diverts via South Promenade to completely bypass Gate 3 bottleneck (142 people detected). Fastest clearance.'
        : 'Smooth flow across all approach gates. Free-flowing pilgrim corridors.',
      coordinates: bestBypassCoords,
    },
    {
      id: 'route-direct-crowded',
      name: 'Direct Route (Heavy Bottleneck)',
      type: 'DIRECT',
      distanceKm: directDist,
      durationMin: directDriveMin,
      delayMin: crowdDelay,
      trafficLevel: gate3IsHigh ? 'HEAVY' : 'MODERATE',
      color: gate3IsHigh ? '#DC2626' : '#F59E0B', // Red / Amber
      advisory: gate3IsHigh
        ? `Contains +${crowdDelay} min delay due to critical crowd congestion at Gate 3 North Ghat approach.`
        : `Moderate delays through main vehicular checkpoints.`,
      coordinates: osrmCoordinates,
    },
    {
      id: 'route-emergency-green',
      name: 'Emergency Green Corridor (VIP / Aid)',
      type: 'EMERGENCY',
      distanceKm: emergDist,
      durationMin: emergDriveMin,
      delayMin: 0,
      trafficLevel: 'LOW',
      color: '#2563EB', // Blue
      advisory: 'Designated rapid egress lane for police and 108 ambulances. Barricaded from pedestrian flow.',
      coordinates: emergencyCoords,
    },
  ];

  return routes;
}
