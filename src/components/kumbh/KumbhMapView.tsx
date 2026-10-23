import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import {
  KumbhColors,
  KumbhRadius,
  KumbhShadow,
  KumbhSpacing,
  KumbhTypography,
} from '@/constants/kumbh-theme';
import { MapLocationItem } from '@/data/mock-data';
import { UserLocationCoords } from '@/hooks/useUserLocation';

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface MapLabels {
  standardStreet?: string;
  satellite?: string;
  myLocation?: string;
  kumbhCenter?: string;
  devotees?: string;
  navigateHere?: string;
  activeNav?: string;
  lowCrowdRoute?: string;
  exitNav?: string;
  offlineMapMode?: string;
  onlineMapMode?: string;
  walkSim?: string;
}

interface KumbhMapViewProps {
  locations: MapLocationItem[];
  selectedLocation: MapLocationItem | null;
  onSelectLocation: (loc: MapLocationItem) => void;
  onRecenter?: () => void;
  onMyLocationPress?: () => void;
  userLocation?: UserLocationCoords | null;
  isLoadingLocation?: boolean;
  routeCoordinates?: RoutePoint[];
  routeColor?: string;
  origin?: { latitude: number; longitude: number; name?: string } | null;
  destination?: { latitude: number; longitude: number; name?: string } | null;
  isNavigating?: boolean;
  navTurnText?: string;
  navTurnIcon?: string;
  navNextTurnText?: string;
  navDistanceText?: string;
  navEtaText?: string;
  onStopNavigation?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  height?: number | string;
  style?: any;
  labels?: MapLabels;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: (offline: boolean) => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
}

// Centered on Nashik Godavari Kumbh (Ramkund Ghat)
export const NASHIK_CENTER = {
  latitude: 19.9975,
  longitude: 73.7910,
};

// Safe pedestrian route default coordinates between Ramkund & Tapovan
export const DEFAULT_SAFE_ROUTE: RoutePoint[] = [
  { latitude: 19.9975, longitude: 73.7910 },
  { latitude: 19.9990, longitude: 73.7940 },
  { latitude: 20.0015, longitude: 73.7995 },
  { latitude: 20.0035, longitude: 73.8040 },
];

export function KumbhMapView({
  locations,
  selectedLocation,
  onSelectLocation,
  onRecenter,
  onMyLocationPress,
  userLocation,
  isLoadingLocation = false,
  routeCoordinates = DEFAULT_SAFE_ROUTE,
  routeColor = '#16A34A',
  origin,
  destination,
  isNavigating = false,
  navTurnText,
  navTurnIcon = '⬆️',
  navNextTurnText,
  navDistanceText,
  navEtaText,
  onStopNavigation,
  onNextStep,
  onPrevStep,
  height = '100%',
  style,
  labels,
  isOfflineMode = false,
  onToggleOfflineMode,
  voiceEnabled = true,
  onToggleVoice,
  isSimulating = false,
  onToggleSimulation,
}: KumbhMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'offline'>(
    isOfflineMode ? 'offline' : 'streets'
  );
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [localVoice, setLocalVoice] = useState<boolean>(voiceEnabled);

  useEffect(() => {
    if (isOfflineMode) {
      setMapLayer('offline');
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript('if(window.enableOfflineMap) window.enableOfflineMap(true); true;');
      }
    } else {
      if (mapLayer === 'offline') {
        setMapLayer('streets');
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript('if(window.enableOfflineMap) window.enableOfflineMap(false); true;');
        }
      }
    }
  }, [isOfflineMode]);

  useEffect(() => {
    if (isMapReady && isOfflineMode && webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.enableOfflineMap) window.enableOfflineMap(true); true;');
    }
  }, [isMapReady, isOfflineMode]);

  // Voice announcement injection when turn changes
  useEffect(() => {
    if (isNavigating && navTurnText && localVoice && webViewRef.current) {
      const escaped = JSON.stringify(navTurnText);
      webViewRef.current.injectJavaScript(`
        if (window.speakInstruction) {
          window.speakInstruction(${escaped});
        }
        true;
      `);
    }
  }, [navTurnText, isNavigating, localVoice]);

  const initialLocationsRef = useRef(locations);
  const lastFocusedIdRef = useRef<string | null>(null);

  // Generate HTML bundle with both Online Leaflet and Offline Vector Engine
  const combinedMapHtml = useMemo(() => {
    const locsData = (initialLocationsRef.current || locations).map((l) => ({
      id: l.id,
      name: l.name,
      lat: l.latitude,
      lng: l.longitude,
      category: l.category,
      categoryLabel: l.categoryLabel,
      icon: l.icon,
      status: l.statusBadge,
      people: l.peopleCount,
    }));

    const locsJson = JSON.stringify(locsData);
    const initialRouteJson = JSON.stringify(routeCoordinates || []);
    const devoteeWord = labels?.devotees || 'devotees';
    const navigateWord = labels?.navigateHere || 'Start Directions';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.__leafletFailed=true;"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body, html {
      width: 100%;
      height: 100%;
      background: #E8ECEF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      touch-action: pan-x pan-y pinch-zoom;
    }
    #map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    #offline-map-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: #F8FAFC;
      display: ${isOfflineMode ? 'block' : 'none'};
      z-index: 10;
      overflow: hidden;
      touch-action: none;
    }
    #offline-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .offline-watermark {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(15, 23, 42, 0.88);
      color: #FFFFFF;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .offline-pulse {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: #22C55E;
    }
    
    /* Google Maps style pins */
    .kumbh-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 2.5px solid #CBD5E1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.28);
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .kumbh-pin:active { transform: scale(1.2); }
    .kumbh-pin.high { border-color: #EA4335; background: #FFF5F5; }
    .kumbh-pin.moderate { border-color: #FBBC04; background: #FFFDF0; }
    .kumbh-pin.safe { border-color: #34A853; background: #F0FDF4; }
    .kumbh-pin.medical { border-color: #1A73E8; background: #EEF4FE; }
    .kumbh-pin.police { border-color: #1E3A8A; background: #EEF2FF; }
    .kumbh-pin.family { border-color: #9333EA; background: #FAF5FF; }

    /* Google Maps live blue pulse beacon */
    .user-gps-dot {
      width: 22px;
      height: 22px;
      background: #1A73E8;
      border: 3.5px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(26, 115, 232, 0.4);
      animation: pulseDot 2s infinite;
    }

    .dest-pin-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .dest-pin-head {
      width: 34px;
      height: 34px;
      background: #EA4335;
      border: 2.5px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(234, 67, 53, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dest-pin-icon {
      transform: rotate(45deg);
      font-size: 16px;
      color: #FFFFFF;
    }

    @keyframes pulseDot {
      0% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.6); }
      70% { box-shadow: 0 0 0 14px rgba(26, 115, 232, 0); }
      100% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0); }
    }

    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.25);
      padding: 6px 8px;
    }
    .popup-title { font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 3px; }
    .popup-sub { font-size: 12px; color: #64748B; margin-bottom: 6px; }
    .popup-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 6px; }
    .popup-badge.safe { background: #DCFCE7; color: #15803D; }
    .popup-badge.moderate { background: #FEF3C7; color: #B45309; }
    .popup-badge.high { background: #FEE2E2; color: #B91C1C; }
    .popup-btn {
      display: block;
      width: 100%;
      background: #1A73E8;
      color: #FFFFFF;
      text-align: center;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <!-- Dedicated Offline Kumbh Vector Engine Container -->
  <div id="offline-map-container">
    <canvas id="offline-canvas"></canvas>
    <div class="offline-watermark">
      <div class="offline-pulse"></div>
      <span>📴 OFFLINE KUMBH MAP · GPS ACTIVE</span>
    </div>
  </div>

  <script>
    var locations = ${locsJson};
    var currentRouteCoords = ${initialRouteJson};
    var currentRouteColor = '#16A34A';
    var isOfflineModeActive = ${isOfflineMode ? 'true' : 'false'};
    var userPos = { lat: 19.9975, lng: 73.7910 };
    var destPos = null;

    // ── Speech Synthesis Voice Guidance ─────────────────────────
    window.speakInstruction = function(text) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          var cleanText = String(text).replace(/[•*#]/g, '').trim();
          var utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {}
    };

    // ── Online Leaflet Setup ────────────────────────────────────
    var map = null;
    var streetLayer = null;
    var satLayer = null;
    var routeGroup = null;
    var markerMap = {};
    var destMarker = null;
    var userMarker = null;

    function initLeafletMap() {
      if (typeof L === 'undefined' || window.__leafletFailed) {
        enableOfflineMap(true);
        return;
      }
      try {
        map = L.map('map', {
          center: [${NASHIK_CENTER.latitude}, ${NASHIK_CENTER.longitude}],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
          tap: false,
          touchZoom: true,
          dragging: true,
          bounceAtZoomLimits: true
        });

        streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        });

        // If tiles fail to load (offline or CDN blocked), seamlessly switch to offline vector map
        var tileFailures = 0;
        streetLayer.on('tileerror', function() {
          tileFailures++;
          if (tileFailures >= 2) {
            enableOfflineMap(true);
          }
        });

        routeGroup = L.featureGroup().addTo(map);

        function createOrUpdateMarker(loc) {
          var pinClass = 'kumbh-pin ' + (loc.category || '');
          var icon = L.divIcon({
            className: '',
            html: '<div class="' + pinClass + '">' + (loc.icon || '📍') + '</div>',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -19]
          });

          var badgeClass = String(loc.status).includes('HIGH') ? 'high' : String(loc.status).includes('MODERATE') ? 'moderate' : 'safe';
          var popupContent = '<div class="custom-popup">' +
            '<div class="popup-title">' + (loc.icon || '') + ' ' + loc.name + '</div>' +
            '<div class="popup-sub">' + loc.categoryLabel + '</div>' +
            '<span class="popup-badge ' + badgeClass + '">' + loc.status + '</span>' +
            (loc.people !== undefined && loc.people !== null ? '<div style="font-size:11px;color:#475569;margin-bottom:4px;">👥 ' + loc.people + ' ' + "${devoteeWord}" + '</div>' : '') +
            '<button class="popup-btn" onclick="selectAndNotify(' + "'" + loc.id + "'" + ')">🧭 ' + "${navigateWord}" + '</button>' +
          '</div>';

          if (markerMap[loc.id]) {
            markerMap[loc.id].setLatLng([loc.lat, loc.lng]);
            markerMap[loc.id].setIcon(icon);
            markerMap[loc.id].setPopupContent(popupContent);
          } else {
            var marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map);
            markerMap[loc.id] = marker;
            marker.bindPopup(popupContent);
            marker.on('click', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_LOCATION', id: loc.id }));
              }
            });
          }
        }

        window.updateLocationsData = function(newLocs) {
          if (!newLocs) return;
          locations = newLocs;
          if (isOfflineModeActive) {
            renderOfflineCanvas();
            return;
          }
          if (!map) return;
          var newIds = {};
          locations.forEach(function(loc) {
            newIds[loc.id] = true;
            createOrUpdateMarker(loc);
          });
          for (var id in markerMap) {
            if (!newIds[id] && markerMap[id]) {
              map.removeLayer(markerMap[id]);
              delete markerMap[id];
            }
          }
        };

        locations.forEach(function(loc) {
          createOrUpdateMarker(loc);
        });

        if (currentRouteCoords && currentRouteCoords.length > 1) {
          window.drawRoute(currentRouteCoords, '${routeColor}', false);
        }
      } catch (e) {
        enableOfflineMap(true);
      }
    }

    window.selectAndNotify = function(id) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_LOCATION_AND_NAVIGATE', id: id }));
      }
    };

    window.switchMapLayer = function(layerType) {
      if (layerType === 'offline') {
        enableOfflineMap(true);
        return;
      }
      enableOfflineMap(false);
      if (!map) return;
      if (layerType === 'satellite') {
        map.removeLayer(streetLayer);
        satLayer.addTo(map);
      } else {
        map.removeLayer(satLayer);
        streetLayer.addTo(map);
      }
    };

    window.drawRoute = function(coords, color, shouldFit) {
      currentRouteCoords = coords || [];
      currentRouteColor = color || '#16A34A';

      if (isOfflineModeActive) {
        renderOfflineCanvas();
        return;
      }

      if (!map || !routeGroup) return;
      routeGroup.clearLayers();
      if (coords && coords.length > 1) {
        var latLngs = coords.map(function(c) { return [c.latitude, c.longitude]; });
        var casing = L.polyline(latLngs, {
          color: '#0B4A26',
          weight: 9,
          opacity: 0.5,
          lineCap: 'round',
          lineJoin: 'round'
        });
        var route = L.polyline(latLngs, {
          color: color || '#16A34A',
          weight: 6,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round'
        });
        routeGroup.addLayer(casing);
        routeGroup.addLayer(route);
        if (shouldFit) {
          map.fitBounds(routeGroup.getBounds(), { padding: [55, 55], maxZoom: 17 });
        }
      }
    };

    window.setDestinationPin = function(lat, lng, name) {
      destPos = (lat && lng) ? { lat: lat, lng: lng, name: name } : null;
      if (isOfflineModeActive) {
        renderOfflineCanvas();
        return;
      }
      if (!map) return;
      if (destMarker) {
        map.removeLayer(destMarker);
        destMarker = null;
      }
      if (lat && lng) {
        var destIcon = L.divIcon({
          className: '',
          html: '<div class="dest-pin-wrapper"><div class="dest-pin-head"><span class="dest-pin-icon">🏁</span></div></div>',
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34]
        });
        destMarker = L.marker([lat, lng], { icon: destIcon }).addTo(map);
      }
    };

    window.updateUserLocation = function(lat, lng) {
      userPos = { lat: lat, lng: lng };
      if (isOfflineModeActive) {
        renderOfflineCanvas();
        return;
      }
      if (!map) return;
      if (!userMarker) {
        var userIcon = L.divIcon({
          className: '',
          html: '<div class="user-gps-dot"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
      }
    };

    window.flyToUser = function(lat, lng) {
      window.updateUserLocation(lat, lng);
      if (isOfflineModeActive) {
        offlinePan = { x: 0, y: 0 };
        renderOfflineCanvas();
      } else if (map) {
        map.flyTo([lat, lng], 17, { duration: 0.7 });
      }
    };

    window.selectAndFocusLocation = function(id, lat, lng) {
      if (isOfflineModeActive) {
        renderOfflineCanvas();
      } else if (map) {
        map.flyTo([lat, lng], 17, { duration: 0.7 });
        if (markerMap[id]) markerMap[id].openPopup();
      }
    };

    window.flyToNashikCenter = function() {
      if (isOfflineModeActive) {
        offlinePan = { x: 0, y: 0 };
        offlineZoom = 1.0;
        renderOfflineCanvas();
      } else if (map) {
        map.flyTo([${NASHIK_CENTER.latitude}, ${NASHIK_CENTER.longitude}], 15, { duration: 0.7 });
      }
    };

    window.zoomIn = function() {
      if (isOfflineModeActive) {
        offlineZoom = Math.min(3.0, offlineZoom + 0.3);
        renderOfflineCanvas();
      } else if (map) map.zoomIn();
    };

    window.zoomOut = function() {
      if (isOfflineModeActive) {
        offlineZoom = Math.max(0.6, offlineZoom - 0.3);
        renderOfflineCanvas();
      } else if (map) map.zoomOut();
    };

    // ── Dedicated Offline Vector Cartographic Map Engine ───────
    var offlineContainer = document.getElementById('offline-map-container');
    var canvas = document.getElementById('offline-canvas');
    var ctx = canvas.getContext('2d');

    var offlineZoom = 1.0;
    var offlinePan = { x: 0, y: 0 };
    var isDragging = false;
    var dragStart = { x: 0, y: 0 };
    var lastTouchDist = 0;

    // Bounds covering core Nashik Kumbh Mela
    var BBOX = {
      minLat: 19.9920,
      maxLat: 20.0070,
      minLng: 73.7860,
      maxLng: 73.8080
    };

    function geoToCanvas(lat, lng, w, h) {
      var xNorm = (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng);
      var yNorm = (BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat);
      var cx = w * (0.05 + xNorm * 0.90);
      var cy = h * (0.05 + yNorm * 0.90);
      // Apply pan & zoom relative to center
      var midX = w / 2;
      var midY = h / 2;
      return {
        x: midX + (cx - midX) * offlineZoom + offlinePan.x,
        y: midY + (cy - midY) * offlineZoom + offlinePan.y
      };
    }

    function renderOfflineCanvas() {
      if (!isOfflineModeActive) return;
      var w = offlineContainer.clientWidth || window.innerWidth || 360;
      var h = offlineContainer.clientHeight || window.innerHeight || 640;
      canvas.width = w;
      canvas.height = h;

      // 1. Background ground
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, w, h);

      // Subtle sector grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (var x = 0; x < w; x += 60 * offlineZoom) {
        ctx.beginPath(); ctx.moveTo(x + (offlinePan.x % 60), 0); ctx.lineTo(x + (offlinePan.x % 60), h); ctx.stroke();
      }
      for (var y = 0; y < h; y += 60 * offlineZoom) {
        ctx.beginPath(); ctx.moveTo(0, y + (offlinePan.y % 60)); ctx.lineTo(w, y + (offlinePan.y % 60)); ctx.stroke();
      }

      // 2. Godavari River (Flowing through Nashik West to East)
      var riverCoords = [
        { lat: 19.9940, lng: 73.7860 },
        { lat: 19.9960, lng: 73.7890 },
        { lat: 19.9975, lng: 73.7915 }, // Ramkund
        { lat: 19.9995, lng: 73.7960 },
        { lat: 20.0010, lng: 73.8010 },
        { lat: 20.0025, lng: 73.8060 },
        { lat: 20.0035, lng: 73.8080 }
      ];

      ctx.beginPath();
      var r0 = geoToCanvas(riverCoords[0].lat, riverCoords[0].lng, w, h);
      ctx.moveTo(r0.x, r0.y);
      for (var i = 1; i < riverCoords.length; i++) {
        var pt = geoToCanvas(riverCoords[i].lat, riverCoords[i].lng, w, h);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 36 * offlineZoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Inner deep river current
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 18 * offlineZoom;
      ctx.stroke();

      // Sacred Ramkund Snan Ghat Platform
      var rkPos = geoToCanvas(19.9975, 73.7910, w, h);
      ctx.fillStyle = '#FEF08A';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(rkPos.x - 22 * offlineZoom, rkPos.y - 14 * offlineZoom, 44 * offlineZoom, 28 * offlineZoom);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#854D0E';
      ctx.font = 'bold ' + Math.max(10, Math.round(11 * offlineZoom)) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🪔 RAMKUND GHAT', rkPos.x, rkPos.y + 4);

      // Bridges across Godavari
      var bridge1A = geoToCanvas(19.9970, 73.7905, w, h);
      var bridge1B = geoToCanvas(19.9980, 73.7912, w, h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 6 * offlineZoom;
      ctx.beginPath(); ctx.moveTo(bridge1A.x, bridge1A.y); ctx.lineTo(bridge1B.x, bridge1B.y); ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Ram Setu Bridge', (bridge1A.x + bridge1B.x)/2, (bridge1A.y + bridge1B.y)/2 - 8);

      // Tapovan Pilgrim Camps Area (Right/East side)
      var tapovanPos = geoToCanvas(20.0035, 73.8040, w, h);
      ctx.fillStyle = '#DCFCE7';
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tapovanPos.x - 45 * offlineZoom, tapovanPos.y - 25 * offlineZoom, 90 * offlineZoom, 50 * offlineZoom, 10)
                    : ctx.rect(tapovanPos.x - 45 * offlineZoom, tapovanPos.y - 25 * offlineZoom, 90 * offlineZoom, 50 * offlineZoom);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#14532D';
      ctx.font = 'bold ' + Math.max(9, Math.round(10 * offlineZoom)) + 'px sans-serif';
      ctx.fillText('⛺ TAPOVAN SADHU GRAM', tapovanPos.x, tapovanPos.y + 4);

      // 3. Draw Active Navigation Route Line (if exists)
      if (currentRouteCoords && currentRouteCoords.length > 1) {
        ctx.beginPath();
        var p0 = geoToCanvas(currentRouteCoords[0].latitude, currentRouteCoords[0].longitude, w, h);
        ctx.moveTo(p0.x, p0.y);
        for (var k = 1; k < currentRouteCoords.length; k++) {
          var pk = geoToCanvas(currentRouteCoords[k].latitude, currentRouteCoords[k].longitude, w, h);
          ctx.lineTo(pk.x, pk.y);
        }
        // Contrast casing
        ctx.strokeStyle = '#0B4A26';
        ctx.lineWidth = 10 * offlineZoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        // Inner vibrant green route
        ctx.strokeStyle = currentRouteColor || '#16A34A';
        ctx.lineWidth = 6 * offlineZoom;
        ctx.stroke();
      }

      // 4. Draw Markers (Gates, Temples, Medical, Police)
      locations.forEach(function(loc) {
        var mPos = geoToCanvas(loc.lat, loc.lng, w, h);
        var r = 18 * Math.min(1.4, offlineZoom);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(mPos.x, mPos.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = loc.category === 'safe' ? '#16A34A' :
                          loc.category === 'high' ? '#DC2626' :
                          loc.category === 'medical' ? '#2563EB' :
                          loc.category === 'police' ? '#1E3A8A' : '#D97706';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = (16 * Math.min(1.4, offlineZoom)) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(loc.icon || '📍', mPos.x, mPos.y);

        // Name badge below
        ctx.font = 'bold ' + Math.max(9, Math.round(10 * offlineZoom)) + 'px sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(loc.name, mPos.x, mPos.y + r + 10);
      });

      // 5. Draw Destination Pin
      if (destPos) {
        var dPos = geoToCanvas(destPos.lat, destPos.lng, w, h);
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏁', dPos.x, dPos.y - 12);
      }

      // 6. Draw User GPS Blue Beacon
      if (userPos) {
        var uPos = geoToCanvas(userPos.lat, userPos.lng, w, h);
        ctx.fillStyle = 'rgba(26, 115, 232, 0.25)';
        ctx.beginPath();
        ctx.arc(uPos.x, uPos.y, 22 * offlineZoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1A73E8';
        ctx.beginPath();
        ctx.arc(uPos.x, uPos.y, 9 * offlineZoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#1E3A8A';
        ctx.fillText('YOU', uPos.x, uPos.y - 14 * offlineZoom);
      }
    }

    function enableOfflineMap(enable) {
      isOfflineModeActive = enable;
      if (enable) {
        offlineContainer.style.display = 'block';
        if (map) {
          try {
            map.remove();
            map = null;
          } catch (_) {}
        }
        var doRender = function() {
          renderOfflineCanvas();
        };
        doRender();
        setTimeout(doRender, 40);
        setTimeout(doRender, 150);
        setTimeout(doRender, 400);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OFFLINE_MODE_ACTIVE' }));
        }
      } else {
        offlineContainer.style.display = 'none';
        if (!map) {
          initLeafletMap();
        } else {
          map.invalidateSize();
        }
      }
    }
    window.enableOfflineMap = enableOfflineMap;

    // Offline Canvas Touch Navigation (Pan & Zoom)
    offlineContainer.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStart = { x: e.touches[0].clientX - offlinePan.x, y: e.touches[0].clientY - offlinePan.y };
      } else if (e.touches.length === 2) {
        isDragging = false;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    });

    offlineContainer.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches.length === 1) {
        offlinePan.x = e.touches[0].clientX - dragStart.x;
        offlinePan.y = e.touches[0].clientY - dragStart.y;
        renderOfflineCanvas();
      } else if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.hypot(dx, dy);
        if (lastTouchDist > 0) {
          var factor = dist / lastTouchDist;
          offlineZoom = Math.min(3.5, Math.max(0.6, offlineZoom * factor));
          renderOfflineCanvas();
        }
        lastTouchDist = dist;
      }
    });

    offlineContainer.addEventListener('touchend', function() {
      isDragging = false;
      lastTouchDist = 0;
    });

    // Offline Canvas Tap detection for locations
    offlineContainer.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      var clickY = e.clientY - rect.top;
      var w = canvas.width;
      var h = canvas.height;

      locations.forEach(function(loc) {
        var pos = geoToCanvas(loc.lat, loc.lng, w, h);
        var dist = Math.hypot(pos.x - clickX, pos.y - clickY);
        if (dist < 28 * offlineZoom) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_LOCATION', id: loc.id }));
          }
        }
      });
    });

    window.addEventListener('resize', function() {
      if (isOfflineModeActive) renderOfflineCanvas();
    });

    // Try initializing online Leaflet or fallback to offline
    if (isOfflineModeActive || navigator.onLine === false || typeof L === 'undefined' || window.__leafletFailed) {
      enableOfflineMap(true);
    } else {
      initLeafletMap();
    }

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
    }
  </script>
</body>
</html>
    `;
  }, [labels]);

  // Handle dynamic location marker updates in-place WITHOUT reloading WebView
  useEffect(() => {
    if (isMapReady && webViewRef.current && locations && locations.length > 0) {
      const locsData = locations.map((l) => ({
        id: l.id,
        name: l.name,
        lat: l.latitude,
        lng: l.longitude,
        category: l.category,
        categoryLabel: l.categoryLabel,
        icon: l.icon,
        status: l.statusBadge,
        people: l.peopleCount,
      }));
      webViewRef.current.injectJavaScript(`
        if (window.updateLocationsData) {
          window.updateLocationsData(${JSON.stringify(locsData)});
        }
        true;
      `);
    }
  }, [locations, isMapReady]);

  // Handle route updates dynamically without reloading WebView
  useEffect(() => {
    if (isMapReady && webViewRef.current && routeCoordinates && routeCoordinates.length > 1) {
      const coordsJson = JSON.stringify(routeCoordinates);
      webViewRef.current.injectJavaScript(`
        if (window.drawRoute) {
          window.drawRoute(${coordsJson}, '${routeColor}', true);
        }
        true;
      `);
    }
  }, [routeCoordinates, routeColor, isMapReady]);

  // Handle user GPS updates
  useEffect(() => {
    if (isMapReady && webViewRef.current && userLocation?.latitude && userLocation?.longitude) {
      webViewRef.current.injectJavaScript(`
        if (window.updateUserLocation) {
          window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude});
        }
        true;
      `);
    }
  }, [userLocation, isMapReady]);

  // Handle destination pin
  useEffect(() => {
    if (isMapReady && webViewRef.current && destination) {
      webViewRef.current.injectJavaScript(`
        if (window.setDestinationPin) {
          window.setDestinationPin(${destination.latitude}, ${destination.longitude}, ${JSON.stringify(destination.name || '')});
        }
        true;
      `);
    }
  }, [destination, isMapReady]);

  // Handle focused location (only fly if ID changed to prevent jerky movement)
  useEffect(() => {
    if (isMapReady && webViewRef.current && selectedLocation) {
      if (lastFocusedIdRef.current !== selectedLocation.id) {
        lastFocusedIdRef.current = selectedLocation.id;
        webViewRef.current.injectJavaScript(`
          if (window.selectAndFocusLocation) {
            window.selectAndFocusLocation('${selectedLocation.id}', ${selectedLocation.latitude}, ${selectedLocation.longitude});
          }
          true;
        `);
      }
    }
  }, [selectedLocation, isMapReady]);

  const handleToggleLayer = () => {
    const next = mapLayer === 'streets' ? 'satellite' : 'streets';
    setMapLayer(next);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if(window.switchMapLayer) window.switchMapLayer('${next}'); true;`);
    }
  };

  const handleToggleOffline = () => {
    const nextOffline = !isOfflineMode;
    if (onToggleOfflineMode) {
      onToggleOfflineMode(nextOffline);
    }
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if(window.enableOfflineMap) window.enableOfflineMap(${nextOffline}); true;`);
    }
  };

  const handleZoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.zoomIn) window.zoomIn(); true;');
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.zoomOut) window.zoomOut(); true;');
    }
  };

  const handleCenterKumbh = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.flyToNashikCenter) window.flyToNashikCenter(); true;');
    }
  };

  const handleFlyUser = () => {
    if (userLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.flyToUser) {
          window.flyToUser(${userLocation.latitude}, ${userLocation.longitude});
        }
        true;
      `);
    } else if (onMyLocationPress) {
      onMyLocationPress();
    }
  };

  const handleToggleVoiceBtn = () => {
    const next = !localVoice;
    setLocalVoice(next);
    if (onToggleVoice) onToggleVoice();
  };

  return (
    <View style={[styles.container, style]}>
      {/* ── GOOGLE MAPS NAVIGATION TURN BANNER (TOP) ────────────────────────── */}
      {isNavigating && (
        <View style={styles.googleNavBanner}>
          <View style={styles.googleNavTopRow}>
            {/* Maneuver Big Arrow Circle */}
            <View style={styles.googleTurnManeuverCircle}>
              <Text style={styles.googleTurnManeuverIcon}>{navTurnIcon}</Text>
            </View>

            {/* Turn instruction & Distance */}
            <View style={styles.googleTurnTextCol}>
              <Text style={styles.googleTurnDistance}>{navDistanceText || '120 m'}</Text>
              <Text style={styles.googleTurnInstruction} numberOfLines={2}>
                {navTurnText || 'Continue along safe pilgrim corridor'}
              </Text>
            </View>

            {/* Quick Actions (Voice & Steps) */}
            <View style={styles.bannerActionsCol}>
              <Pressable
                style={({ pressed }) => [styles.bannerActionBtn, pressed && styles.btnPressed]}
                onPress={handleToggleVoiceBtn}
                accessibilityLabel="Toggle voice directions"
              >
                <Text style={styles.bannerActionIcon}>{localVoice ? '🔊' : '🔇'}</Text>
              </Pressable>

              {onNextStep && (
                <Pressable
                  style={({ pressed }) => [styles.bannerActionBtn, pressed && styles.btnPressed]}
                  onPress={onNextStep}
                  accessibilityLabel="Next turn"
                >
                  <Text style={styles.bannerActionIcon}>›</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Next upcoming maneuver preview row */}
          {navNextTurnText && (
            <View style={styles.googleNavNextRow}>
              <Text style={styles.googleNavNextLabel}>THEN:</Text>
              <Text style={styles.googleNavNextText} numberOfLines={1}>
                {navNextTurnText}
              </Text>
            </View>
          )}

          {/* Simulation / Live Auto-Guide Pill */}
          {onToggleSimulation && (
            <View style={styles.simRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.simBtn,
                  isSimulating && styles.simBtnActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={onToggleSimulation}
              >
                <Text style={styles.simBtnText}>
                  {isSimulating ? '⏸️ Pause Walk Sim' : '▶️ Live Walk Simulation (Voice Guidance)'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Embedded Map WebView with full touch drag support */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: combinedMapHtml }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={true}
        nestedScrollEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_READY') {
              setIsMapReady(true);
            } else if (data.type === 'OFFLINE_MODE_ACTIVE') {
              if (onToggleOfflineMode) {
                onToggleOfflineMode(true);
              }
            } else if (data.type === 'SELECT_LOCATION' || data.type === 'SELECT_LOCATION_AND_NAVIGATE') {
              const matched = locations.find((l) => l.id === data.id);
              if (matched) {
                onSelectLocation(matched);
              }
            }
          } catch (_) {}
        }}
      />

      {/* ── GOOGLE MAPS STYLE FLOATING MAP TOOLS (RIGHT) ───────────────────── */}
      <View style={[styles.floatingControls, isNavigating && { bottom: 100 }]}>
        {/* Offline / Online Cartographic Map Switcher */}
        <Pressable
          style={({ pressed }) => [
            styles.mapToolBtn,
            isOfflineMode && styles.offlineToolBtnActive,
            pressed && styles.btnPressed,
          ]}
          onPress={handleToggleOffline}
          accessibilityLabel="Toggle offline Kumbh map"
        >
          <Text style={styles.mapToolIcon}>{isOfflineMode ? '📴' : '🌐'}</Text>
        </Pressable>

        {/* Satellite / Street Switcher (when online) */}
        {!isOfflineMode && (
          <Pressable
            style={({ pressed }) => [styles.mapToolBtn, pressed && styles.btnPressed]}
            onPress={handleToggleLayer}
            accessibilityLabel="Switch map style"
          >
            <Text style={styles.mapToolIcon}>{mapLayer === 'streets' ? '🛰️' : '🗺️'}</Text>
          </Pressable>
        )}

        {/* Recenter Kumbh Mela (Ramkund) */}
        <Pressable
          style={({ pressed }) => [styles.mapToolBtn, pressed && styles.btnPressed]}
          onPress={handleCenterKumbh}
          accessibilityLabel="Center on Kumbh Mela"
        >
          <Text style={styles.mapToolIcon}>🪔</Text>
        </Pressable>

        {/* Fly to User GPS */}
        <Pressable
          style={({ pressed }) => [styles.mapToolBtn, styles.gpsBtnActive, pressed && styles.btnPressed]}
          onPress={handleFlyUser}
          accessibilityLabel="Fly to my GPS position"
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#1A73E8" />
          ) : (
            <Text style={styles.mapToolIcon}>📍</Text>
          )}
        </Pressable>

        {/* Zoom In (+) */}
        <Pressable
          style={({ pressed }) => [styles.mapToolBtn, pressed && styles.btnPressed]}
          onPress={handleZoomIn}
          accessibilityLabel="Zoom in"
        >
          <Text style={styles.mapToolIcon}>➕</Text>
        </Pressable>

        {/* Zoom Out (-) */}
        <Pressable
          style={({ pressed }) => [styles.mapToolBtn, pressed && styles.btnPressed]}
          onPress={handleZoomOut}
          accessibilityLabel="Zoom out"
        >
          <Text style={styles.mapToolIcon}>➖</Text>
        </Pressable>
      </View>

      {/* ── GOOGLE MAPS NAVIGATION BOTTOM HUD ──────────────────────────────── */}
      {isNavigating && (
        <View style={styles.googleNavBottomHud}>
          <View style={styles.navBottomInfoCol}>
            <View style={styles.navEtaRow}>
              <Text style={styles.navEtaBig}>{navEtaText || '7 min'}</Text>
              <Text style={styles.navEtaDot}>·</Text>
              <Text style={styles.navDistSmall}>{navDistanceText || '520 m'}</Text>
            </View>
            <Text style={styles.navRouteBadge}>
              {labels?.lowCrowdRoute || '🟢 Low Crowd Pilgrim Corridor'}
            </Text>
          </View>
          {onStopNavigation && (
            <Pressable
              style={({ pressed }) => [styles.exitNavBtn, pressed && styles.btnPressed]}
              onPress={onStopNavigation}
              accessibilityLabel="Exit live navigation"
            >
              <Text style={styles.exitNavText}>{labels?.exitNav || '✕ Exit'}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E8ECEF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#E8ECEF',
  },

  // Google Maps Deep Green Turn Navigation Banner
  googleNavBanner: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 999,
    backgroundColor: '#0F9D58', // Iconic Google Maps Forest Green
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...KumbhShadow.lg,
    borderWidth: 1,
    borderColor: '#0B7A42',
  },
  googleNavTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleTurnManeuverCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleTurnManeuverIcon: {
    fontSize: 26,
  },
  googleTurnTextCol: {
    flex: 1,
  },
  googleTurnDistance: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  googleTurnInstruction: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 18,
  },
  bannerActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerActionIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  googleNavNextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  googleNavNextLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  googleNavNextText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  simRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  simBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  simBtnActive: {
    backgroundColor: '#F59E0B',
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Floating controls like Google Maps on bottom right
  floatingControls: {
    position: 'absolute',
    bottom: 24,
    right: 14,
    zIndex: 998,
    gap: 10,
  },
  mapToolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...KumbhShadow.md,
  },
  offlineToolBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  gpsBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  mapToolIcon: {
    fontSize: 18,
  },

  // Google Maps Bottom Navigation HUD
  googleNavBottomHud: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...KumbhShadow.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navBottomInfoCol: {
    gap: 2,
  },
  navEtaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  navEtaBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#15803D', // Emerald Green ETA
  },
  navEtaDot: {
    fontSize: 18,
    color: '#94A3B8',
  },
  navDistSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  navRouteBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  exitNavBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  exitNavText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  btnPressed: {
    opacity: 0.75,
  },
});
