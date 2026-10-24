/// <reference types="vite/client" />

/**
 * Centralized API Client for Kumbh Sarthi Authority Control Center.
 * Reads backend URL dynamically from import.meta.env.VITE_API_BASE_URL
 * Defaults to http://localhost:8001
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('ksa_api_base_url');
    if (custom && custom.trim() !== '') {
      return custom.trim().replace(/\/$/, '');
    }
  }
  return (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem('ksa_api_base_url');
    } else {
      localStorage.setItem('ksa_api_base_url', url.trim().replace(/\/$/, ''));
    }
  }
}

export const API_BASE_URL: string = getApiBaseUrl();

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
  const baseUrl = getApiBaseUrl();
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalHttp = baseUrl.startsWith('http://localhost') || baseUrl.startsWith('http://127.0.0.1');

  // Prevent mixed-content browser blocking on deployed HTTPS sites without custom tunnel
  if (isHttps && isLocalHttp) {
    return {
      data: null,
      error: 'Running on HTTPS. To connect to your local backend, please enter your HTTPS tunnel URL in Settings.',
      isOffline: true,
      isUnauthorized: false,
      status: 0,
    };
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Attach auth token if available
  const token = localStorage.getItem('ksa_authority_token');
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Bypass localtunnel & ngrok browser reminder pages so API requests are not intercepted as HTML
  headers.set('bypass-tunnel-reminder', 'true');
  headers.set('ngrok-skip-browser-warning', 'true');

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

    let data: T;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        return {
          data: null,
          error: 'Backend tunnel returned non-JSON response. Please ensure localtunnel password is submitted.',
          isOffline: true,
          isUnauthorized: false,
          status: response.status,
        };
      }
    }
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
