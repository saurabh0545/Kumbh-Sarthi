import { apiFetch, ApiResponse } from './api';
import { AuthorityUser } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthorityUser;
}

export const authService = {
  /**
   * Authority login - verifies with FastAPI backend
   */
  async login(credentials: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    // Calls the dedicated authority login endpoint
    return apiFetch<LoginResponse>('/api/auth/authority-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Check if token is locally stored
   */
  getCurrentUser(): AuthorityUser | null {
    const raw = localStorage.getItem('ksa_authority_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('ksa_authority_token');
  },

  setSession(token: string, user: AuthorityUser): void {
    localStorage.setItem('ksa_authority_token', token);
    localStorage.setItem('ksa_authority_user', JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem('ksa_authority_token');
    localStorage.removeItem('ksa_authority_user');
  },
};
