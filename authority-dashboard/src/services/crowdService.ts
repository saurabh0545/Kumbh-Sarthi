import { apiFetch, ApiResponse } from './api';
import { DensityLevel, ZoneCrowdData } from '../types';
import { INITIAL_ZONES } from '../constants/zones';

export interface CrowdZoneResponse {
  zone: string;
  people: number;
  density: string;
}

export interface AllCrowdResponse {
  status: string;
  zones: Record<string, { people: number; density: string }>;
  timestamp?: string;
}

export const crowdService = {
  /**
   * Fetches single zone crowd data from existing FastAPI endpoint:
   * GET /api/crowd/{zone}
   */
  async getZoneCrowd(zone: string): Promise<ApiResponse<CrowdZoneResponse>> {
    return apiFetch<CrowdZoneResponse>(`/api/crowd/${encodeURIComponent(zone)}`);
  },

  /**
   * Fetches all crowd zones from FastAPI backend:
   * GET /api/crowd
   */
  async getAllCrowd(): Promise<ApiResponse<AllCrowdResponse>> {
    return apiFetch<AllCrowdResponse>('/api/crowd');
  },

  /**
   * Updates crowd data (for manual override or testing):
   * POST /api/crowd/update
   */
  async updateCrowd(zone: string, people: number, density: DensityLevel): Promise<ApiResponse<any>> {
    return apiFetch('/api/crowd/update', {
      method: 'POST',
      body: JSON.stringify({ zone, people, density }),
    });
  },

  /**
   * Merges live FastAPI backend response into the full 12-zone operations matrix.
   * Gate-A maps directly to Gate 1 (Ramkund Main Entrance) — LIVE CAMERA.
   * Other zones use telemetry / demo calibration as requested.
   */
  mergeWithLiveBackend(
    zonesList: ZoneCrowdData[],
    backendData: Record<string, { people: number; density: string }> | null
  ): ZoneCrowdData[] {
    if (!backendData) return zonesList;

    return zonesList.map((z) => {
      // Find matching live info across possible keys (e.g. 'Gate-A', 'gate-1', case-insensitive)
      const matchKey = Object.keys(backendData).find(
        (k) =>
          k.toLowerCase() === z.gateCode.toLowerCase() ||
          k.toLowerCase() === z.id.toLowerCase() ||
          (z.gateCode === 'Gate-A' && (k.toLowerCase() === 'gate-a' || k.toLowerCase() === 'gate-1' || k.toLowerCase() === 'gate1'))
      );

      const liveInfo = matchKey ? backendData[matchKey] : null;

      if (liveInfo) {
        const isGate1 = z.gateCode === 'Gate-A';
        return {
          ...z,
          peopleCount: liveInfo.people,
          density: (liveInfo.density as DensityLevel) || (isGate1 ? 'LOW' : z.density),
          status: 'ONLINE',
          isLive: isGate1 ? true : z.isLive,
          dataSource: isGate1 ? 'LIVE_YOLO_CAMERA' : z.dataSource,
          lastUpdated: 'Live right now',
        };
      }

      return z;
    });
  },
};
