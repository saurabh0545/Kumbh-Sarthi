import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, LoginPayload, RegisterPayload, loginUser, registerUser } from '@/services/authApi';

const STORAGE_KEY = '@kumbh_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  loginGuest: (name?: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on app launch
  useEffect(() => {
    async function loadStoredUser() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load stored auth user:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredUser();
  }, []);

  const loginGuest = async (name: string = 'Pilgrim'): Promise<AuthUser> => {
    const guestUser: AuthUser = {
      id: 1,
      name,
      email: 'pilgrim@kumbh.in',
      role: 'PILGRIM',
      token: 'offline-pilgrim-token',
    };
    setUser(guestUser);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
      const { firebaseService } = require('@/services/firebaseService');
      firebaseService.syncUserProfile(guestUser);
    } catch (_) {}
    return guestUser;
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const authUser = await loginUser(payload);
    setUser(authUser);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      const { firebaseService } = require('@/services/firebaseService');
      firebaseService.syncUserProfile(authUser);
    } catch (_) {}
    return authUser;
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const newUser = await registerUser(payload);
    try {
      const { firebaseService } = require('@/services/firebaseService');
      firebaseService.syncUserProfile(newUser);
    } catch (_) {}
    return newUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear stored auth user:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginGuest, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

