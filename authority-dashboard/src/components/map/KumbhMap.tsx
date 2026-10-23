import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Search,
  Layers,
  Compass,
  ZoomIn,
  ZoomOut,
  Navigation,
  MapPin,
  Car,
  Footprints,
  RotateCcw,
  AlertCircle,
  Zap,
  ShieldCheck,
  Check,
  Play,
  Pause,
  FastForward,
  Clock,
  Gauge,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronRight,
  List,
  Activity,
  Radio,
} from 'lucide-react';
import { NASHIK_CENTER, MAP_POIS } from '../../constants/mapData';
import {
  LIVE_TRAFFIC_CORRIDORS,
  getTrafficStatusColor,
  TrafficSegment,
} from '../../constants/trafficData';
import { ZoneCrowdData, EmergencyIncident } from '../../types';
import { MapLegend } from './MapLegend';
import { getDensityColor } from '../../utils/density';
import {
  calculateDistanceKm,
  formatDistance,
  estimateTravelTimes,
  fetchTrafficRoutes,
  RouteOption,
  calculateBearing,
  interpolatePath,
  generateTurnManeuvers,
  calculateRemainingDistanceKm,
  TurnManeuver,
} from '../../utils/geo';

interface KumbhMapProps {
  zones: ZoneCrowdData[];
  selectedZoneId?: string | null;
  onZoneSelect?: (zone: ZoneCrowdData) => void;
  emergencies?: EmergencyIncident[];
  selectedEmergencyId?: string | null;
  onEmergencySelect?: (emergency: EmergencyIncident) => void;
  focusCoordinates?: [number, number] | null;
  focusTitle?: string | null;
}

export const KumbhMap: React.FC<KumbhMapProps> = ({
  zones,
  selectedZoneId,
  onZoneSelect,
  emergencies = [],
  selectedEmergencyId,
  onEmergencySelect,
  focusCoordinates,
  focusTitle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const emergencyLayerRef = useRef<L.LayerGroup | null>(null);
  const pulseCircleLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const navLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const navTravelingMarkerRef = useRef<L.Marker | null>(null);

  // Search & POI filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GATES' | 'EMERGENCY' | 'POLICE' | 'MEDICAL' | 'FACILITIES'>('ALL');
  const [showLegend, setShowLegend] = useState(false);

  // Real-time Traffic Layer toggle
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [selectedTrafficSegment, setSelectedTrafficSegment] = useState<TrafficSegment | null>(null);

  // Live Location & Distance state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [targetDestination, setTargetDestination] = useState<{
    name: string;
    coordinates: [number, number];
  }>({
    name: 'Ramkund Sacred Ghat (Central Mela)',
    coordinates: NASHIK_CENTER,
  });

  // Traffic routes state
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-best-traffic');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // ==========================================
  // "TRAVELING LIKE MAP" GPS NAVIGATION MODE
  // ==========================================
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNavPaused, setIsNavPaused] = useState(false);
  const [navSpeedMultiplier, setNavSpeedMultiplier] = useState<number>(1);
  const [followCamera, setFollowCamera] = useState(true);
  const [showStepsList, setShowStepsList] = useState(false);
  const [navCurrentIndex, setNavCurrentIndex] = useState(0);
  const [denseNavPath, setDenseNavPath] = useState<[number, number][]>([]);
  const [turnManeuvers, setTurnManeuvers] = useState<TurnManeuver[]>([]);
  const [currentManeuverIndex, setCurrentManeuverIndex] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const navIntervalRef = useRef<any>(null);

  // Selected route object
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: NASHIK_CENTER,
      zoom: 14,
      zoomControl: false,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Kumbh Sarthi SafeMap',
      maxZoom: 19,
    }).addTo(map);

    trafficLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    navLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    emergencyLayerRef.current = L.layerGroup().addTo(map);
    pulseCircleLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (navIntervalRef.current) {
        clearInterval(navIntervalRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync target destination when selectedZoneId changes
  useEffect(() => {
    if (selectedZoneId) {
      const target = zones.find((z) => z.id === selectedZoneId);
      if (target) {
        setTargetDestination({
          name: target.name,
          coordinates: target.coordinates,
        });
      }
    }
  }, [selectedZoneId, zones]);

  // Recalculate traffic routes whenever user location or destination changes
  useEffect(() => {
    if (!userLocation) {
      setRoutes([]);
      return;
    }

    let isMounted = true;
    setIsLoadingRoutes(true);

    fetchTrafficRoutes(userLocation, targetDestination.coordinates, zones)
      .then((computedRoutes) => {
        if (!isMounted) return;
        setRoutes(computedRoutes);
        setSelectedRouteId('route-best-traffic'); // Default to Best Traffic Route
        setIsLoadingRoutes(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoadingRoutes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userLocation, targetDestination, zones]);

  // ==========================================
  // RENDER LIVE TRAFFIC LAYER (CORRIDORS & SPEEDS)
  // ==========================================
  useEffect(() => {
    const trafficLayer = trafficLayerRef.current;
    if (!trafficLayer) return;

    trafficLayer.clearLayers();
    if (!showTrafficLayer) return;

    LIVE_TRAFFIC_CORRIDORS.forEach((corridor) => {
      const color = getTrafficStatusColor(corridor.status);

      // 1. Wide traffic background glow
      const glowPoly = L.polyline(corridor.coordinates, {
        color,
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
      });
      trafficLayer.addLayer(glowPoly);

      // 2. Core traffic line
      const corePoly = L.polyline(corridor.coordinates, {
        color,
        weight: 4.5,
        opacity: 0.9,
        lineCap: 'round',
        dashArray: corridor.status === 'CONGESTED' ? '6, 6' : undefined,
      });

      // Interactive popup with real-time speed & congestion information
      corePoly.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #123B5D; font-size: 13px;">${corridor.name}</strong>
            <span style="background: ${color}20; color: ${color}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ${corridor.status}
            </span>
          </div>
          <div style="font-size: 12px; color: #475569; margin: 4px 0;">
            🚦 Live Flow Speed: <strong style="color: #0F172A;">${corridor.speedKmh} km/h</strong> (Normal: ${corridor.freeFlowSpeedKmh} km/h)
          </div>
          ${corridor.delayMin > 0 ? `
            <div style="font-size: 11px; color: #DC2626; font-weight: 700; margin-bottom: 4px;">
              ⚠️ Delay: +${corridor.delayMin} min bottleneck
            </div>
          ` : `
            <div style="font-size: 11px; color: #16A34A; font-weight: 700; margin-bottom: 4px;">
              ✓ Free flowing transit
            </div>
          `}
          <div style="font-size: 11px; color: #64748B;">
            ${corridor.description}
          </div>
          ${corridor.incident ? `
            <div style="margin-top: 5px; font-size: 10.5px; background: #FEF2F2; color: #991B1B; padding: 4px 6px; border-radius: 4px;">
              🚨 ${corridor.incident}
            </div>
          ` : ''}
        </div>
      `);

      corePoly.on('click', () => setSelectedTrafficSegment(corridor));
      trafficLayer.addLayer(corePoly);

      // 3. Traffic Speed Badge pinned at corridor midpoint
      const midIdx = Math.floor(corridor.coordinates.length / 2);
      const midCoord = corridor.coordinates[midIdx];

      const speedBadgeHtml = `
        <div style="
          background: #0F172A;
          color: #FFFFFF;
          border: 1.5px solid ${color};
          border-radius: 12px;
          padding: 2px 6px;
          font-size: 9.5px;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
          pointer-events: none;
        ">
          <span style="color: ${color}; font-size: 8px;">●</span>
          <span>${corridor.speedKmh} km/h</span>
        </div>
      `;

      const speedIcon = L.divIcon({
        html: speedBadgeHtml,
        className: 'traffic-speed-badge',
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });

      const badgeMarker = L.marker(midCoord, { icon: speedIcon });
      trafficLayer.addLayer(badgeMarker);
    });
  }, [showTrafficLayer]);

  // Request & Track User Location
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords: [number, number] = [lat, lng];

        setUserLocation(coords);
        setUserAccuracy(Math.round(position.coords.accuracy));

        const map = mapInstanceRef.current;
        if (map) {
          const bounds = L.latLngBounds([coords, targetDestination.coordinates]);
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
        }

        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
              setUserLocation(newCoords);
              setUserAccuracy(Math.round(pos.coords.accuracy));
            },
            (err) => {
              console.warn('Geolocation watch notice:', err.message);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Click "Simulate Location" to test traffic routing.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable. Check GPS/Wi-Fi connection.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [targetDestination.coordinates]);

  // Simulate nearby location (Nashik Road Railway Station)
  const handleSimulateNearbyLocation = useCallback(() => {
    const simulatedCoords: [number, number] = [19.9535, 73.8402];
    setUserLocation(simulatedCoords);
    setUserAccuracy(12);
    setLocationError(null);

    const map = mapInstanceRef.current;
    if (map) {
      const bounds = L.latLngBounds([simulatedCoords, targetDestination.coordinates]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
  }, [targetDestination.coordinates]);

  // Active emergencies filter
  const activeEmergencies = emergencies.filter((e) => e.status !== 'RESOLVED');

  // Route directly to an emergency sender from the nearest rescue team
  const handleRouteToEmergency = useCallback((emergency: EmergencyIncident) => {
    if (!emergency.coordinates) return;

    // Find nearest Police or Medical POI to this emergency
    const rescuePois = MAP_POIS.filter((p) =>
      ['POLICE', 'MEDICAL', 'AMBULANCE', 'EMERGENCY_POINT'].includes(p.category)
    );

    let nearestPoi = rescuePois[0] || null;
    let minDistance = Infinity;

    rescuePois.forEach((poi) => {
      const d = calculateDistanceKm(
        poi.coordinates[0],
        poi.coordinates[1],
        emergency.coordinates![0],
        emergency.coordinates![1]
      );
      if (d < minDistance) {
        minDistance = d;
        nearestPoi = poi;
      }
    });

    if (nearestPoi) {
      // Set rescue unit as origin
      setUserLocation(nearestPoi.coordinates);
      // Set emergency sender as destination
      setTargetDestination({
        name: `🚨 Emergency: ${emergency.type} (${emergency.senderName || emergency.location})`,
        coordinates: emergency.coordinates,
      });

      // Fly to view the rescue route corridor
      if (mapInstanceRef.current) {
        const bounds = L.latLngBounds([nearestPoi.coordinates, emergency.coordinates]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [70, 70] });
      }
    }
  }, []);

  // Handle focus coordinates (when locating a sender from URL or click)
  useEffect(() => {
    if (!focusCoordinates || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo(focusCoordinates, 17, { duration: 1.5 });

    const pulseLayer = pulseCircleLayerRef.current;
    if (pulseLayer) {
      pulseLayer.clearLayers();
      const circle = L.circle(focusCoordinates, {
        radius: 35,
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.35,
        weight: 3,
      });
      pulseLayer.addLayer(circle);
    }
  }, [focusCoordinates]);

  // ==========================================
  // "START TRAVELING" LIVE NAVIGATION ENGINE
  // ==========================================
  const handleStartTraveling = useCallback(() => {
    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    // 1. Create dense interpolated path for smooth realistic travel
    const densePath = interpolatePath(activeRoute.coordinates, 10);
    setDenseNavPath(densePath);

    // 2. Generate turn-by-turn guidance maneuvers
    const maneuvers = generateTurnManeuvers(activeRoute.coordinates, targetDestination.name);
    setTurnManeuvers(maneuvers);

    setNavCurrentIndex(0);
    setCurrentManeuverIndex(0);
    setHasArrived(false);
    setIsNavigating(true);
    setIsNavPaused(false);

    // Focus camera on departure point with navigation zoom
    const map = mapInstanceRef.current;
    if (map && densePath.length > 0) {
      map.flyTo(densePath[0], 16, { animate: true, duration: 1.2 });
    }
  }, [activeRoute, targetDestination.name]);

  const handleStopTraveling = useCallback(() => {
    setIsNavigating(false);
    setIsNavPaused(false);
    setHasArrived(false);
    if (navIntervalRef.current) {
      clearInterval(navIntervalRef.current);
      navIntervalRef.current = null;
    }

    // Reset view to entire route overview
    const map = mapInstanceRef.current;
    if (map && activeRoute) {
      const bounds = L.latLngBounds(activeRoute.coordinates);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [activeRoute]);

  // Driving Animation Tick Loop
  useEffect(() => {
    if (!isNavigating || isNavPaused || denseNavPath.length === 0) {
      if (navIntervalRef.current) {
        clearInterval(navIntervalRef.current);
        navIntervalRef.current = null;
      }
      return;
    }

    // Set interval based on speed multiplier (normal: ~180ms per tick)
    const intervalMs = Math.max(50, Math.round(180 / navSpeedMultiplier));

    navIntervalRef.current = setInterval(() => {
      setNavCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= denseNavPath.length) {
          // Destination Reached!
          setHasArrived(true);
          setIsNavPaused(true);
          return denseNavPath.length - 1;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (navIntervalRef.current) {
        clearInterval(navIntervalRef.current);
      }
    };
  }, [isNavigating, isNavPaused, navSpeedMultiplier, denseNavPath]);

  // Update Traveling Marker, Dynamic Traveled Path & Follow Camera
  useEffect(() => {
    const navLayer = navLayerRef.current;
    const map = mapInstanceRef.current;
    if (!navLayer || !map) return;

    navLayer.clearLayers();

    if (!isNavigating || denseNavPath.length === 0) return;

    const currentCoord = denseNavPath[navCurrentIndex] || denseNavPath[0];
    const prevCoord = navCurrentIndex > 0 ? denseNavPath[navCurrentIndex - 1] : denseNavPath[0];
    const bearing = calculateBearing(prevCoord[0], prevCoord[1], currentCoord[0], currentCoord[1]);

    // 1. Draw Traveled Path (dimmed/subtle silver line)
    if (navCurrentIndex > 0) {
      const traveledCoords = denseNavPath.slice(0, navCurrentIndex + 1);
      const traveledLine = L.polyline(traveledCoords, {
        color: '#94A3B8',
        weight: 5,
        opacity: 0.6,
        lineCap: 'round',
      });
      navLayer.addLayer(traveledLine);
    }

    // 2. Draw Remaining Path (vibrant active route color with traffic glow)
    const remainingCoords = denseNavPath.slice(navCurrentIndex);
    if (remainingCoords.length > 1) {
      const remainingGlow = L.polyline(remainingCoords, {
        color: activeRoute?.color || '#16A34A',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
      });
      navLayer.addLayer(remainingGlow);

      const remainingLine = L.polyline(remainingCoords, {
        color: activeRoute?.color || '#16A34A',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
      });
      navLayer.addLayer(remainingLine);
    }

    // 3. Render 3D Directional Vehicle / Navigation Cursor
    const vehicleIconHtml = `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        transform: rotate(${Math.round(bearing)}deg);
        transition: transform 0.15s ease-out;
      ">
        <!-- Pulsing radar wave -->
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.3);
          animation: pulseGlow 1.2s infinite ease-out;
        "></div>
        <!-- Modern Navigation 3D Chevron Arrow -->
        <div style="
          position: absolute;
          inset: 0;
          background: #1E3A8A;
          border: 3px solid #60A5FA;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#60A5FA" stroke-width="1.5">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `;

    const vehicleIcon = L.divIcon({
      html: vehicleIconHtml,
      className: 'nav-vehicle-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const vehicleMarker = L.marker(currentCoord, { icon: vehicleIcon });
    navLayer.addLayer(vehicleMarker);
    navTravelingMarkerRef.current = vehicleMarker;

    // 4. Smooth Camera Follow (Navigation Mode)
    if (followCamera && map) {
      map.panTo(currentCoord, { animate: true, duration: 0.2 });
    }

    // 5. Update Active Turn Maneuver based on nearest distance
    if (turnManeuvers.length > 0) {
      let closestIdx = 0;
      let minDistance = Infinity;
      turnManeuvers.forEach((m, idx) => {
        const d = calculateDistanceKm(currentCoord[0], currentCoord[1], m.coordinates[0], m.coordinates[1]);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = idx;
        }
      });
      // Pick next forward maneuver
      if (closestIdx < turnManeuvers.length - 1 && minDistance < 0.1) {
        setCurrentManeuverIndex(Math.min(turnManeuvers.length - 1, closestIdx + 1));
      } else {
        setCurrentManeuverIndex(closestIdx);
      }
    }
  }, [isNavigating, denseNavPath, navCurrentIndex, followCamera, activeRoute, turnManeuvers]);

  // Compute live navigation progress metrics
  const remainingDistKm = denseNavPath.length > 0
    ? calculateRemainingDistanceKm(denseNavPath, navCurrentIndex)
    : (activeRoute?.distanceKm || 0);

  const currentSegmentSpeed = 36; // Live speed in km/h
  const remainingMinutes = Math.max(1, Math.round((remainingDistKm / currentSegmentSpeed) * 60));
  const progressPercent = denseNavPath.length > 0
    ? Math.min(100, Math.round((navCurrentIndex / (denseNavPath.length - 1)) * 100))
    : 0;

  const currentManeuver = turnManeuvers[currentManeuverIndex] || {
    instruction: `Proceed along route to ${targetDestination.name}`,
    roadName: 'Kumbh Pilgrim Corridor',
    type: 'STRAIGHT',
    distanceMeters: Math.round(remainingDistKm * 1000),
  };

  // Helper icon for maneuver
  const renderManeuverIcon = (type: TurnManeuver['type']) => {
    switch (type) {
      case 'TURN_RIGHT':
        return <ArrowRight size={28} color="#FFFFFF" />;
      case 'TURN_LEFT':
        return <ArrowLeft size={28} color="#FFFFFF" />;
      case 'SLIGHT_RIGHT':
        return <ArrowUpRight size={28} color="#FFFFFF" />;
      case 'SLIGHT_LEFT':
        return <ArrowUpLeft size={28} color="#FFFFFF" />;
      case 'ARRIVE':
        return <MapPin size={28} color="#22C55E" />;
      default:
        return <ArrowUp size={28} color="#FFFFFF" />;
    }
  };

  // Static Routes Drawing (When NOT in active travel simulation)
  useEffect(() => {
    const routeLayer = routeLayerRef.current;
    if (!routeLayer) return;

    routeLayer.clearLayers();

    // If navigating, hide static route lines to avoid clutter
    if (isNavigating) return;

    if (userLocation) {
      // 1. User Location Pulsing Beacon Marker
      const userIconHtml = `
        <div style="position: relative; width: 34px; height: 34px;">
          <div style="
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.25);
            animation: pulseGlow 1.6s infinite ease-out;
          "></div>
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background-color: #2563EB;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: 'custom-user-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #1D4ED8; margin-bottom: 2px;">
            📍 You Are Here (Live GPS)
          </div>
          <div style="font-size: 11.5px; color: #475569;">
            GPS Coordinates: ${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}
          </div>
          ${userAccuracy ? `<div style="font-size: 11px; color: #16A34A; margin-top: 2px;">Accuracy: ±${userAccuracy}m</div>` : ''}
          ${activeRoute ? `
            <div style="font-weight: 700; color: #16A34A; margin-top: 4px; font-size: 12px;">
              Best Route: ~${activeRoute.durationMin} mins (${formatDistance(activeRoute.distanceKm)})
            </div>
          ` : ''}
        </div>
      `);
      routeLayer.addLayer(userMarker);
      userMarkerRef.current = userMarker;

      // 2. Draw Inactive Routes
      routes.forEach((rt) => {
        if (rt.id === selectedRouteId) return;

        const inactiveLine = L.polyline(rt.coordinates, {
          color: rt.color,
          weight: 4,
          opacity: 0.35,
          dashArray: '5, 8',
          lineCap: 'round',
        });
        inactiveLine.on('click', () => setSelectedRouteId(rt.id));
        routeLayer.addLayer(inactiveLine);
      });

      // 3. Draw Active Selected Route
      if (activeRoute) {
        const glowLine = L.polyline(activeRoute.coordinates, {
          color: activeRoute.color,
          weight: 9,
          opacity: 0.35,
          lineCap: 'round',
        });
        routeLayer.addLayer(glowLine);

        const coreLine = L.polyline(activeRoute.coordinates, {
          color: activeRoute.color,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
        });
        routeLayer.addLayer(coreLine);

        // Midpoint Route Badge
        const midIdx = Math.floor(activeRoute.coordinates.length / 2);
        const midPoint = activeRoute.coordinates[midIdx] || activeRoute.coordinates[0];

        const trafficBadgeHtml = `
          <div style="
            background: #123B5D;
            color: #FFFFFF;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            border: 2px solid ${activeRoute.color};
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
          ">
            <span style="color: ${activeRoute.color};">●</span>
            <span>${formatDistance(activeRoute.distanceKm)} (~${activeRoute.durationMin}m)</span>
          </div>
        `;

        const badgeIcon = L.divIcon({
          html: trafficBadgeHtml,
          className: 'route-midpoint-badge',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const badgeMarker = L.marker(midPoint, { icon: badgeIcon });
        routeLayer.addLayer(badgeMarker);
      }
    }
  }, [userLocation, userAccuracy, routes, selectedRouteId, activeRoute, isNavigating]);

  // Update POI & Gate Markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    // 1. Render Gates / Crowd Zones
    if (activeFilter === 'ALL' || activeFilter === 'GATES') {
      zones.forEach((zone) => {
        if (
          searchQuery &&
          !zone.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !zone.gateCode.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return;
        }

        const { color } = getDensityColor(zone.density);
        const isCurrentDestination =
          targetDestination.coordinates[0] === zone.coordinates[0] &&
          targetDestination.coordinates[1] === zone.coordinates[1];

        const iconHtml = `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: ${color};
            border: ${isCurrentDestination ? '3.5px solid #F47C20' : '3px solid #ffffff'};
            box-shadow: ${isCurrentDestination ? '0 0 0 4px rgba(244, 124, 32, 0.4), 0 4px 10px rgba(0,0,0,0.3)' : '0 3px 8px rgba(0,0,0,0.3)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            cursor: pointer;
          ">
            ${zone.isLive ? '<span class="live-indicator" style="position: absolute; top: -3px; right: -3px;"></span>' : ''}
            <span>${zone.gateCode.replace('Gate-', 'G')}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-gate-icon',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker(zone.coordinates, { icon });
        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 13px; color: #123B5D;">${zone.name}</span>
              ${zone.isLive ? '<span style="font-size: 10px; font-weight: 700; color: #16A34A; background: #DCFCE7; padding: 1px 5px; border-radius: 4px;">LIVE YOLO</span>' : '<span style="font-size: 10px; color: #64748B;">DEMO</span>'}
            </div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
              People count: <strong style="color: #0F172A;">${zone.peopleCount}</strong> | Density: <strong style="color: ${color};">${zone.density}</strong>
            </div>
            <button
              id="set-dest-${zone.id}"
              style="
                width: 100%;
                background-color: #123B5D;
                color: #FFFFFF;
                border: none;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
              "
            >
              Route & Travel Here →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`set-dest-${zone.id}`);
          if (btn) {
            btn.onclick = () => {
              setTargetDestination({
                name: zone.name,
                coordinates: zone.coordinates,
              });
              if (!userLocation) {
                handleRequestLocation();
              }
            };
          }
        });

        marker.on('click', () => {
          onZoneSelect && onZoneSelect(zone);
        });

        markersLayer.addLayer(marker);
      });
    }

    // 2. Render POIs (Police, Medical, Ambulances, Ghats, Water, Toilets)
    if (activeFilter !== 'GATES') {
      MAP_POIS.forEach((poi) => {
        if (
          searchQuery &&
          !poi.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !poi.category.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return;
        }

        if (activeFilter === 'POLICE' && poi.category !== 'POLICE' && poi.category !== 'EMERGENCY_POINT') return;
        if (activeFilter === 'MEDICAL' && poi.category !== 'MEDICAL' && poi.category !== 'AMBULANCE') return;
        if (activeFilter === 'FACILITIES' && !['WATER', 'TOILET', 'PARKING', 'TEMPLE', 'GHAT'].includes(poi.category)) return;

        const categoryIcons: Record<string, { icon: string; bg: string }> = {
          POLICE: { icon: '👮', bg: '#1E3A8A' },
          MEDICAL: { icon: '🏥', bg: '#DC2626' },
          AMBULANCE: { icon: '🚑', bg: '#EA580C' },
          TEMPLE: { icon: '🛕', bg: '#D97706' },
          GHAT: { icon: '🌊', bg: '#0284C7' },
          PARKING: { icon: '🅿️', bg: '#475569' },
          WATER: { icon: '💧', bg: '#06B6D4' },
          TOILET: { icon: '🚻', bg: '#059669' },
          EMERGENCY_POINT: { icon: '🚨', bg: '#E11D48' },
        };

        const currentStyle = categoryIcons[poi.category] || { icon: '📍', bg: '#475569' };

        const poiHtml = `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${currentStyle.bg};
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
          ">
            ${currentStyle.icon}
          </div>
        `;

        const poiIcon = L.divIcon({
          html: poiHtml,
          className: 'custom-poi-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker(poi.coordinates, { icon: poiIcon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 160px;">
            <div style="font-weight: 700; font-size: 12.5px; color: #123B5D; margin-bottom: 2px;">${poi.name}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">${poi.description}</div>
            ${poi.contact ? `<div style="font-size: 11px; color: #16A34A; font-weight: 600;">Contact: ${poi.contact}</div>` : ''}
          </div>
        `);
        markersLayer.addLayer(marker);
      });
    }

    // 3. Render Emergency Distresses & Pilgrim SOS Markers
    const emergencyLayer = emergencyLayerRef.current;
    if (emergencyLayer) {
      emergencyLayer.clearLayers();

      if (activeFilter === 'ALL' || activeFilter === 'EMERGENCY') {
        emergencies.forEach((emergency) => {
          if (!emergency.coordinates) return;
          if (emergency.status === 'RESOLVED' && activeFilter !== 'EMERGENCY') return;

          if (
            searchQuery &&
            !emergency.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !emergency.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !(emergency.senderName && emergency.senderName.toLowerCase().includes(searchQuery.toLowerCase())) &&
            !(emergency.callerContact && emergency.callerContact.toLowerCase().includes(searchQuery.toLowerCase()))
          ) {
            return;
          }

          const isSelected =
            selectedEmergencyId === emergency.id ||
            (focusCoordinates &&
              Math.abs(focusCoordinates[0] - emergency.coordinates[0]) < 0.0003 &&
              Math.abs(focusCoordinates[1] - emergency.coordinates[1]) < 0.0003);

          const emergencyHtml = `
            <div class="emergency-marker-beacon" style="cursor: pointer;">
              <div style="
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
                border: ${isSelected ? '3.5px solid #F47C20' : '3px solid #ffffff'};
                box-shadow: ${isSelected ? '0 0 0 4px rgba(244, 124, 32, 0.5), 0 4px 12px rgba(220,38,38,0.6)' : '0 0 14px rgba(220, 38, 38, 0.7), 0 4px 10px rgba(0,0,0,0.3)'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 18px;
                font-weight: 800;
              ">
                🚨
              </div>
              <div style="
                position: absolute;
                bottom: -15px;
                background: #991B1B;
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                padding: 1px 6px;
                border-radius: 4px;
                white-space: nowrap;
                border: 1px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                text-transform: uppercase;
              ">
                ${emergency.type.replace('_', ' ')}
              </div>
            </div>
          `;

          const emergencyIcon = L.divIcon({
            html: emergencyHtml,
            className: 'custom-emergency-icon',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          const marker = L.marker(emergency.coordinates, { icon: emergencyIcon, zIndexOffset: 1000 });
          const [lat, lng] = emergency.coordinates;

          const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 260px; max-width: 300px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 2px solid #FEE2E2; padding-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="font-size: 16px;">🚨</span>
                  <strong style="color: #991B1B; font-size: 13px; text-transform: uppercase;">${emergency.type.replace('_', ' ')} SOS</strong>
                </div>
                <span style="background: #FEE2E2; color: #DC2626; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                  ${emergency.status}
                </span>
              </div>

              <div style="background: #F8FAFC; border-radius: 8px; padding: 8px; margin-bottom: 8px; border: 1px solid #E2E8F0;">
                <div style="font-size: 12px; color: #0F172A; font-weight: 700; margin-bottom: 3px;">
                  👤 Sender: <span style="color: #123B5D;">${emergency.senderName || emergency.callerContact || 'Pilgrim'}</span>
                </div>
                ${emergency.callerContact ? `
                  <div style="font-size: 11.5px; color: #475569; margin-bottom: 3px;">
                    📞 Contact: <strong>${emergency.callerContact}</strong>
                  </div>
                ` : ''}
                <div style="font-size: 11.5px; color: #475569; margin-bottom: 3px;">
                  📍 Sector: <strong>${emergency.location}</strong>
                </div>
                <div style="font-size: 11px; color: #059669; font-weight: 700; margin-bottom: 2px;">
                  🌐 GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E
                </div>
                <div style="font-size: 10.5px; color: #64748B;">
                  ⏱ Reported: ${emergency.reportedAt}
                </div>
              </div>

              ${emergency.notes ? `
                <div style="font-size: 11.5px; color: #64748B; margin-bottom: 8px; line-height: 1.35; font-style: italic;">
                  "${emergency.notes}"
                </div>
              ` : ''}

              <button
                id="route-rescue-${emergency.id}"
                style="
                  width: 100%;
                  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
                  color: #FFFFFF;
                  border: none;
                  border-radius: 6px;
                  padding: 7px 10px;
                  font-size: 12px;
                  font-weight: 700;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  box-shadow: 0 2px 4px rgba(220,38,38,0.3);
                "
              >
                🚑 Route Nearest Rescue Team Here →
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('popupopen', () => {
            const btn = document.getElementById(`route-rescue-${emergency.id}`);
            if (btn) {
              btn.onclick = () => {
                handleRouteToEmergency(emergency);
              };
            }
          });

          marker.on('click', () => {
            onEmergencySelect && onEmergencySelect(emergency);
          });

          emergencyLayer.addLayer(marker);

          if (isSelected) {
            setTimeout(() => {
              marker.openPopup();
            }, 300);
          }
        });
      }
    }
  }, [zones, emergencies, selectedEmergencyId, focusCoordinates, searchQuery, activeFilter, targetDestination, userLocation, onZoneSelect, handleRequestLocation, handleRouteToEmergency, onEmergencySelect]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => mapInstanceRef.current?.flyTo(NASHIK_CENTER, 14);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '620px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #CBD5E1',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP TURN-BY-TURN TRAVELING NAVIGATION HUD (Active when isNavigating)   */}
      {/* ========================================================================= */}
      {isNavigating && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 600,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          {/* Main Turn Card */}
          <div
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '14px 20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
              border: '1.5px solid #1E3A8A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              maxWidth: '820px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* Turn Icon with glowing blue circle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(37,99,235,0.5)',
                  flexShrink: 0,
                }}
              >
                {renderManeuverIcon(currentManeuver.type)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#38BDF8' }}>
                    In {currentManeuver.distanceMeters} m
                  </span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>
                    {currentManeuver.roadName}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>
                  {currentManeuver.instruction}
                </div>
              </div>
            </div>

            {/* Quick Navigation Control buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setFollowCamera((prev) => !prev)}
                style={{
                  backgroundColor: followCamera ? '#1E3A8A' : '#1E293B',
                  border: followCamera ? '1.5px solid #3B82F6' : '1px solid #334155',
                  color: followCamera ? '#60A5FA' : '#94A3B8',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Lock camera to follow moving vehicle"
              >
                <Compass size={14} />
                <span>{followCamera ? 'Tracking 3D' : 'Free View'}</span>
              </button>

              <button
                onClick={() => setShowStepsList((prev) => !prev)}
                style={{
                  backgroundColor: showStepsList ? '#F47C20' : '#1E293B',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <List size={14} />
                <span>Steps</span>
              </button>

              <button
                onClick={handleStopTraveling}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={14} />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Collapsible Steps list sheet */}
          {showStepsList && (
            <div
              style={{
                pointerEvents: 'auto',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                border: '1px solid #334155',
                padding: '12px 16px',
                maxWidth: '600px',
                margin: '0 auto',
                width: '100%',
                maxHeight: '220px',
                overflowY: 'auto',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Turn-by-Turn Route Guidance
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {turnManeuvers.map((m, idx) => {
                  const isCurrent = idx === currentManeuverIndex;
                  return (
                    <div
                      key={m.stepIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        border: isCurrent ? '1px solid #38BDF8' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>#{idx + 1}</span>
                        <span style={{ fontSize: '13px', color: isCurrent ? '#FFFFFF' : '#CBD5E1', fontWeight: isCurrent ? 700 : 500 }}>
                          {m.instruction}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                        {m.distanceMeters}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STANDARD SEARCH & FILTERS (When NOT Navigating)                        */}
      {/* ========================================================================= */}
      {!isNavigating && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '70px',
            zIndex: 500,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            pointerEvents: 'none',
          }}
        >
          {/* Search input */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid #CBD5E1',
              width: '260px',
            }}
          >
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search gates, ghats, police..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#0F172A',
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '4px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid #CBD5E1',
            }}
          >
            {[
              { id: 'ALL', label: 'All Layers' },
              {
                id: 'EMERGENCY',
                label: `🚨 Emergencies (${activeEmergencies.length})`,
              },
              { id: 'GATES', label: 'Gates & Crowd' },
              { id: 'POLICE', label: 'Police' },
              { id: 'MEDICAL', label: 'Medical' },
              { id: 'FACILITIES', label: 'Facilities' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                style={{
                  border: 'none',
                  background:
                    activeFilter === f.id
                      ? f.id === 'EMERGENCY'
                        ? '#DC2626'
                        : '#123B5D'
                      : 'transparent',
                  color:
                    activeFilter === f.id
                      ? '#FFFFFF'
                      : f.id === 'EMERGENCY' && activeEmergencies.length > 0
                      ? '#DC2626'
                      : '#475569',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: f.id === 'EMERGENCY' && activeEmergencies.length > 0 ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Live Traffic Flow Toggle Button */}
          <button
            onClick={() => setShowTrafficLayer((prev) => !prev)}
            style={{
              pointerEvents: 'auto',
              backgroundColor: showTrafficLayer ? '#0F172A' : '#FFFFFF',
              color: showTrafficLayer ? '#34D399' : '#475569',
              border: showTrafficLayer ? '1.5px solid #10B981' : '1px solid #CBD5E1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity size={15} />
            <span>{showTrafficLayer ? '🚦 Live Traffic Flow ON' : '🚦 Show Traffic Flow'}</span>
          </button>
        </div>
      )}

      {/* Floating Map Zoom, Recenter & Live Location Controls (Right Side) */}
      <div
        style={{
          position: 'absolute',
          top: isNavigating ? '100px' : '16px',
          right: '16px',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Primary MY LOCATION GPS Button */}
        <button
          onClick={handleRequestLocation}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: userLocation ? '#2563EB' : '#FFFFFF',
            border: userLocation ? '2px solid #1D4ED8' : '1px solid #CBD5E1',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: userLocation ? '#FFFFFF' : '#2563EB',
            transition: 'all 0.15s ease',
            position: 'relative',
          }}
          title="Access My Current Location (Live GPS)"
        >
          <Navigation size={20} />
          {userLocation && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                border: '1.5px solid #FFFFFF',
              }}
            />
          )}
        </button>

        <button
          onClick={handleResetCenter}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F47C20',
          }}
          title="Reset to Ramkund Kumbh Center"
        >
          <Compass size={20} />
        </button>

        <button
          onClick={handleZoomIn}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123B5D',
          }}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={handleZoomOut}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123B5D',
          }}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM TRAVELING SPEEDOMETER & TRIP DASHBOARD (When Navigating)       */}
      {/* ========================================================================= */}
      {isNavigating && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 600,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
            border: '2px solid #1E3A8A',
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '92%',
            maxWidth: '820px',
          }}
        >
          {/* Top Row: Speedometer + ETA + Distance + Destination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* Speedometer Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '3px solid #38BDF8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, #1E293B 0%, #0F172A 100%)',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                  {hasArrived ? '0' : currentSegmentSpeed}
                </span>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700 }}>
                  KM/H
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                    {hasArrived ? 'Arrived!' : `~${remainingMinutes} min`}
                  </span>
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>
                    ({formatDistance(remainingDistKm)})
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                  Destination: {targetDestination.name}
                </div>
              </div>
            </div>

            {/* Travel Simulation Controls (Play/Pause, Speed 1x/2x/4x) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsNavPaused((prev) => !prev)}
                style={{
                  backgroundColor: isNavPaused ? '#16A34A' : '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isNavPaused ? <Play size={15} /> : <Pause size={15} />}
                <span>{isNavPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Speed Multiplier Pill */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#1E293B',
                  borderRadius: '8px',
                  padding: '2px',
                  border: '1px solid #334155',
                }}
              >
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setNavSpeedMultiplier(spd)}
                    style={{
                      border: 'none',
                      background: navSpeedMultiplier === spd ? '#2563EB' : 'transparent',
                      color: navSpeedMultiplier === spd ? '#FFFFFF' : '#94A3B8',
                      padding: '5px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setNavCurrentIndex(0);
                  setHasArrived(false);
                  setIsNavPaused(false);
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                title="Restart Simulation"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: hasArrived ? '#22C55E' : '#38BDF8',
                transition: 'width 0.2s ease',
              }}
            />
          </div>

          {/* Arrival Banner */}
          {hasArrived && (
            <div
              style={{
                backgroundColor: '#064E3B',
                border: '1px solid #059669',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#A7F3D0' }}>
                🎉 You have reached {targetDestination.name}! Have a blessed Snan.
              </span>
              <button
                onClick={handleStopTraveling}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Finish Journey
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STATIC ROUTE DRAWER (When NOT Navigating)                              */}
      {/* ========================================================================= */}
      {!isNavigating && userLocation && routes.length > 0 && activeRoute && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 550,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 32px -4px rgba(18, 59, 93, 0.28)',
            border: '2px solid #123B5D',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '94%',
            maxWidth: '920px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header Bar with Start Travel Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#123B5D', lineHeight: 1.2 }}>
                  Live Traffic & Route Intelligence
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B' }}>
                  Target: <strong>{targetDestination.name}</strong> • Real-time traffic flow active
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* PRIMARY START TRAVEL / NAVIGATION BUTTON */}
              <button
                onClick={handleStartTraveling}
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                }}
              >
                <Play size={16} fill="#FFFFFF" />
                <span>Start Live Navigation</span>
              </button>

              <button
                onClick={() => setUserLocation(null)}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                title="Clear route"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Traffic Route Option Selection Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '10px',
            }}
          >
            {routes.map((rt) => {
              const isSelected = rt.id === selectedRouteId;
              const isBest = rt.type === 'BEST_TRAFFIC';

              return (
                <div
                  key={rt.id}
                  onClick={() => setSelectedRouteId(rt.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? `2.5px solid ${rt.color}` : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? `${rt.color}0D` : '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: rt.color,
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {rt.name}
                      </span>
                    </div>
                    {isBest && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        RECOMMENDED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0 6px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#123B5D' }}>
                      ~{rt.durationMin} min
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                      ({formatDistance(rt.distanceKm)})
                    </span>
                    {rt.delayMin > 0 ? (
                      <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>
                        +{rt.delayMin}m delay
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                        Free flow
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.35 }}>
                    {rt.advisory}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Geolocation Notice Banner */}
      {locationError && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 550,
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '90%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <AlertCircle size={20} color="#DC2626" />
          <div style={{ fontSize: '13px', color: '#991B1B' }}>
            <strong>Location Notice:</strong> {locationError}
          </div>
          <button
            onClick={handleSimulateNearbyLocation}
            style={{
              backgroundColor: '#123B5D',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Simulate Location (Nashik Road Station)
          </button>
          <button
            onClick={() => setLocationError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner when location is not yet clicked */}
      {!userLocation && !locationError && !isNavigating && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '16px',
            zIndex: 480,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: '10px',
            padding: '8px 14px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
            Traffic Tracking & GPS Travel:
          </span>
          <button
            onClick={handleRequestLocation}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Navigation size={13} />
            <span>Enable My Location (GPS)</span>
          </button>
          <button
            onClick={handleSimulateNearbyLocation}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#123B5D',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Simulate Nearby Location
          </button>
        </div>
      )}

      {/* Toggle Legend Button */}
      {!isNavigating && (
        <button
          onClick={() => setShowLegend((prev) => !prev)}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 500,
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#123B5D',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Layers size={14} />
          <span>{showLegend ? 'Hide Legend' : 'Show Legend'}</span>
        </button>
      )}

      {/* Legend Overlay */}
      {showLegend && !isNavigating && <MapLegend />}

      {/* The Leaflet Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
