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
      // Gate-A is Gate 1 (Live camera feed)
      if (z.gateCode === 'Gate-A' && backendData['Gate-A']) {
        const liveInfo = backendData['Gate-A'];
        return {
          ...z,
          peopleCount: liveInfo.people,
          density: (liveInfo.density as DensityLevel) || 'LOW',
          status: 'ONLINE',
          isLive: true,
          dataSource: 'LIVE_YOLO_CAMERA',
          lastUpdated: 'Live right now',
        };
      }

      // Gate-B is Gate 2 (if present in backend)
      if (backendData[z.gateCode]) {
        const liveInfo = backendData[z.gateCode];
        return {
          ...z,
          peopleCount: liveInfo.people,
          density: (liveInfo.density as DensityLevel) || z.density,
          lastUpdated: 'Just now',
        };
      }

      return z;
    });
  },
};
