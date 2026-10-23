import { apiFetch, ApiResponse } from './api';

export interface FaceItem {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  confidence: number;
  is_recognized: boolean;
  person_id?: string;
  details?: string;
  person_type?: string;
  case_status?: string;
  is_unsolved_case?: boolean;
  is_missing_match?: boolean;
  is_officer?: boolean;
  is_solved?: boolean;
}

export interface FaceDetectResult {
  status: string;
  frame_width: number;
  frame_height: number;
  faces_count: number;
  faces: FaceItem[];
  zone: string;
  only_cases_active?: boolean;
  timestamp: string;
}

export interface RegisteredIdentity {
  id: string;
  name: string;
  details: string;
  location: string;
  contact: string;
  type: string;
  case_status?: string;
  photo?: string;
  created_at: string;
}

export interface FaceAiStatus {
  status: string;
  has_detector: boolean;
  has_recognition_model: boolean;
  registered_classes: string[];
  registered_count?: number;
  detector_engine: string;
}

export interface FaceRegisterPayload {
  name: string;
  image: string;
  person_id?: string;
  details?: string;
  location?: string;
  contact?: string;
  type?: string;
  case_status?: string;
}

export const faceService = {
  async getStatus(): Promise<ApiResponse<FaceAiStatus>> {
    return apiFetch<FaceAiStatus>('/api/face/status');
  },

  async getRegistry(): Promise<ApiResponse<{ count: number; identities: RegisteredIdentity[] }>> {
    return apiFetch<{ count: number; identities: RegisteredIdentity[] }>('/api/face/registry');
  },

  async registerPerson(payload: FaceRegisterPayload): Promise<ApiResponse<{ status: string; message: string; name: string; person_id: string }>> {
    return apiFetch<{ status: string; message: string; name: string; person_id: string }>('/api/face/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCaseStatus(personId: string, status: string): Promise<ApiResponse<{ status: string; person_id: string; case_status: string }>> {
    return apiFetch<{ status: string; person_id: string; case_status: string }>(`/api/face/registry/${personId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async deleteFromRegistry(personId: string): Promise<ApiResponse<{ status: string; person_id: string }>> {
    return apiFetch<{ status: string; person_id: string }>(`/api/face/registry/${personId}`, {
      method: 'DELETE',
    });
  },

  async detectFaces(base64Image: string, zone = 'Gate-A', onlyCases = false, forceCascade = false): Promise<ApiResponse<FaceDetectResult>> {
    return apiFetch<FaceDetectResult>('/api/face/detect', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image, zone, only_cases: onlyCases, force_cascade: forceCascade }),
    });
  },
};
