/// <reference types="vite/client" />

/**
 * Centralized API Client for Kumbh Sarthi Authority Control Center.
 * Reads backend URL dynamically from import.meta.env.VITE_API_BASE_URL
 * Defaults to http://localhost:8001
 */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'
).replace(/\/$/, '');

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isOffline: boolean;
  isUnauthorized: boolean;
  status: number;
}

/**
 * Fetch wrapper with timeout and standardized error trapping.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 7000
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Attach auth token if available
  const token = localStorage.getItem('ksa_authority_token');
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      return {
        data: null,
        error: 'Unauthorized: Session expired or invalid authority credentials.',
        isOffline: false,
        isUnauthorized: true,
        status: response.status,
      };
    }

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use default error message
      }
      return {
        data: null,
        error: errorMsg,
        isOffline: false,
        isUnauthorized: false,
        status: response.status,
      };
    }

    const data: T = await response.json();
    return {
      data,
      error: null,
      isOffline: false,
      isUnauthorized: false,
      status: response.status,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error)?.name === 'AbortError';
    const isNetwork = !window.navigator.onLine || (err as Error)?.message?.includes('Failed to fetch');
    
    return {
      data: null,
      error: isAbort
        ? 'Request timed out. Backend server response took too long.'
        : isNetwork
        ? 'Backend connection unavailable. Please ensure FastAPI server is running on port 8001.'
        : (err as Error)?.message || 'An unexpected error occurred.',
      isOffline: true,
      isUnauthorized: false,
      status: 0,
    };
  }
}
