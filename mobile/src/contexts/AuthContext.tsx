import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { clearTokens } from '../services/secureStore';
import { setOnUnauthorized } from '../services/api';

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
    await clearTokens();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
  }, [logout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      logout,
    }),
    [isAuthenticated, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
