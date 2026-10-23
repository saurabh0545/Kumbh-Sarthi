import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthorityUser, AuthState } from '../types';
import { authService, LoginPayload } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check saved session on mount
    const savedUser = authService.getCurrentUser();
    const savedToken = authService.getToken();

    if (savedUser && savedToken) {
      setAuthState({
        user: savedUser,
        token: savedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginPayload) => {
    try {
      const response = await authService.login(credentials);
      if (response.data && response.data.token) {
        authService.setSession(response.data.token, response.data.user);
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, error: response.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login request failed' };
    }
  };

  const logout = () => {
    authService.clearSession();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
