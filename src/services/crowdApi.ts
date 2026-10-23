import { apiClient } from './api';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { doc, getDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';

export type BackendDensity = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Exact response payload from FastAPI: GET /api/crowd/{zone}
 */
export interface CrowdApiResponse {
  zone?: string;
  people?: number;
  density?: BackendDensity | string;
  error?: string;
}

export interface GateCrowdData {
  zone: string;
  people: number;
  density: 'LOW' | 'MODERATE' | 'HIGH';
  rawDensity: string;
  updatedAt: string;
}

/**
 * Gate 1 represents the real laptop webcam + YOLO crowd detection system.
 * In the FastAPI backend and Firestore, Gate 1 corresponds to "Gate-A".
 */
export const GATE1_ZONE = 'Gate-A';

/**
 * Map backend density (LOW, MEDIUM, HIGH) to frontend status (LOW, MODERATE, HIGH)
 */
export function mapBackendDensityToStatus(density?: string): 'LOW' | 'MODERATE' | 'HIGH' {
  if (!density) return 'LOW';
  const upper = density.toUpperCase();
  if (upper === 'HIGH') return 'HIGH';
  if (upper === 'MEDIUM' || upper === 'MODERATE') return 'MODERATE';
  return 'LOW';
}

/**
 * Real-time listener for live crowd count from Firebase Cloud Firestore.
 * Triggers instantly via onSnapshot whenever camera detection updates Firestore.
 */
export function subscribeToGateCrowd(
  zone: string = GATE1_ZONE,
  onUpdate: (data: GateCrowdData) => void,
  onError?: (error: Error) => void
): (() => void) | null {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const unsub = onSnapshot(
      doc(db, 'crowd_zones', zone),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const peopleNum = typeof d.people === 'number' ? d.people : parseInt(String(d.people ?? '0'), 10);
          onUpdate({
            zone: d.zone || zone,
            people: isNaN(peopleNum) ? 0 : peopleNum,
            density: mapBackendDensityToStatus(d.density),
            rawDensity: String(d.density ?? 'LOW'),
            updatedAt: 'Live from Cloud Webcam',
          });
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (err) {
    if (onError) onError(err as Error);
    return null;
  }
}

/**
 * Fetch current crowd count and density for a specific zone.
 * Priority 1: Reads live synced count from Firebase Cloud Firestore (works globally over 4G/5G).
 * Uses getDocFromServer to strictly bypass client-side cache and get the latest count.
 * Priority 2: Falls back to local FastAPI endpoint.
 */
export async function getCrowd(zone: string = GATE1_ZONE): Promise<GateCrowdData> {
  // 1. Try Firebase Cloud Firestore first (works on 4G mobile data without laptop network)
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'crowd_zones', zone);
      // Strictly bypass cache to get real-time server count
      let snap;
      try {
        snap = await getDocFromServer(docRef);
      } catch {
        snap = await getDoc(docRef);
      }

      if (snap.exists()) {
        const d = snap.data();
        const peopleNum = typeof d.people === 'number' ? d.people : parseInt(String(d.people ?? '0'), 10);
        return {
          zone: d.zone || zone,
          people: isNaN(peopleNum) ? 0 : peopleNum,
          density: mapBackendDensityToStatus(d.density),
          rawDensity: String(d.density ?? 'LOW'),
          updatedAt: 'Live from Cloud Webcam',
        };
      }
    } catch (e) {
      // Continue to local API fallback
    }
  }

  // 2. Fallback to local FastAPI if reachable
  const response = await apiClient.get<CrowdApiResponse>(`/api/crowd/${encodeURIComponent(zone)}`);
  const data = response.data;

  if (data.error || typeof data.people !== 'number') {
    throw new Error(data.error || 'Invalid crowd response received from server');
  }

  return {
    zone: data.zone || zone,
    people: data.people,
    density: mapBackendDensityToStatus(data.density),
    rawDensity: String(data.density ?? 'LOW'),
    updatedAt: 'Updated just now',
  };
}
