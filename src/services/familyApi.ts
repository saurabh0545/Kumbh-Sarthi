import { apiClient } from './api';

export interface BackendFamilyMember {
  id: number;
  user_id: number;
  name: string;
  relation: string;
  role: string;
  status: 'SAFE' | 'LAST_SEEN' | 'SOS';
  is_location_shared: boolean;
  last_seen_location: string;
  latitude?: number | null;
  longitude?: number | null;
  last_updated: string;
}

export interface BackendFamilyGroup {
  id: number;
  name: string;
  code: string;
  owner_id: number;
}

export interface ActiveSosAlert {
  id: number;
  user_id: number;
  user_name: string;
  location_name: string;
  created_at: string;
}

export interface FamilyResponse {
  family: BackendFamilyGroup | null;
  members: BackendFamilyMember[];
  active_sos: ActiveSosAlert[];
}

export async function getMyFamily(userId: number): Promise<FamilyResponse> {
  const response = await apiClient.get<FamilyResponse>(`/api/family/me?user_id=${userId}`);
  return response.data;
}

export async function createFamily(name: string, userId: number): Promise<{ group: BackendFamilyGroup }> {
  const response = await apiClient.post<{ group: BackendFamilyGroup }>('/api/family/create', {
    name: name.trim(),
    user_id: userId,
  });
  return response.data;
}

export async function joinFamily(code: string, userId: number): Promise<{ group: BackendFamilyGroup }> {
  const response = await apiClient.post<{ group: BackendFamilyGroup }>('/api/family/join', {
    code: code.trim(),
    user_id: userId,
  });
  return response.data;
}

export async function sendFamilySos(
  userId: number,
  latitude?: number | null,
  longitude?: number | null,
  locationName?: string
): Promise<{ message: string; sos_id: number; time: string }> {
  // Sync to Firebase in parallel
  try {
    const { firebaseService } = require('./firebaseService');
    firebaseService.triggerSos({
      userId,
      userName: `Family Member #${userId}`,
      locationName: locationName || 'Near Kumbh Sacred Ghats',
      latitude: latitude || 19.9975,
      longitude: longitude || 73.7910,
      type: 'SOS',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      notes: 'Family SOS triggered by pilgrim',
    });
  } catch (_) {}

  const response = await apiClient.post<{ message: string; sos_id: number; time: string }>(
    '/api/family/sos',
    {
      user_id: userId,
      latitude,
      longitude,
      location_name: locationName || 'Near Kumbh Sacred Ghats',
    }
  );
  return response.data;
}

export async function toggleLocationSharing(
  userId: number,
  enabled: boolean
): Promise<{ is_location_shared: boolean }> {
  const response = await apiClient.post<{ is_location_shared: boolean }>(
    '/api/family/location-sharing',
    {
      user_id: userId,
      enabled,
    }
  );
  return response.data;
}

export async function updateLocation(
  userId: number,
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<void> {
  await apiClient.post('/api/family/location', {
    user_id: userId,
    latitude,
    longitude,
    location_name: locationName,
  });
}
