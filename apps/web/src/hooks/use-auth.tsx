import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api, tokenStore } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import type { AuthTokens, LoginInput, LoginResponse, TwoFactorInput } from "@classified/shared";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<LoginResponse>;
  loginWithTwoFactor: (data: TwoFactorInput) => Promise<void>;
  loginWithTokens: (tokens: AuthTokens) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      const refreshed = await api.auth.refresh();
      setIsAuthenticated(refreshed);
      setIsLoading(false);
    };
    tryRefresh();
  }, []);

  const loginWithTokens = useCallback((tokens: AuthTokens) => {
    tokenStore.setTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (data: LoginInput): Promise<LoginResponse> => {
      const response = await api.auth.login(data);
      if ("accessToken" in response) {
        loginWithTokens(response);
      }
      return response;
    },
    [loginWithTokens],
  );

  const loginWithTwoFactor = useCallback(
    async (data: TwoFactorInput) => {
      const tokens = await api.auth.twoFactor(data);
      loginWithTokens(tokens);
    },
    [loginWithTokens],
  );

  const logout = useCallback(async () => {
    const rt = tokenStore.getRefreshToken();
    if (rt) {
      await api.auth.logout(rt).catch(() => {});
    }
    tokenStore.clearTokens();
    queryClient.clear();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, loginWithTwoFactor, loginWithTokens, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
