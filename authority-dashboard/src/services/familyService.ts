import { apiFetch, ApiResponse } from './api';
import { FamilySosItem } from '../types';

export interface AuthoritySosResponse {
  sos_requests: FamilySosItem[];
  count: number;
}

export const familyService = {
  /**
   * Fetches all Family SOS emergency requests from MySQL database:
   * GET /api/authority/sos
   */
  async getAllSos(status?: 'ACTIVE' | 'RESOLVED'): Promise<ApiResponse<AuthoritySosResponse>> {
    const query = status ? `?status=${status}` : '';
    return apiFetch<AuthoritySosResponse>(`/api/authority/sos${query}`);
  },

  /**
   * Resolves a family SOS incident:
   * POST /api/authority/sos/{id}/resolve
   */
  async resolveSos(sosId: number): Promise<ApiResponse<any>> {
    return apiFetch(`/api/authority/sos/${sosId}/resolve`, {
      method: 'POST',
    });
  },

  /**
   * Mask name for privacy protection on public boards
   */
  maskPilgrimName(name: string): string {
    if (!name || name.length <= 2) return name;
    return `${name[0]}*** ${name.slice(-1)}`;
  },
};
