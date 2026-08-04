"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { MaxUser } from "@/types/api";
import { authApi } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";
import { ApiError } from "@/lib/api/ApiError";

interface AuthContextValue {
  user: MaxUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MaxUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { user } = await authApi.me();
    setUser(user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await apiClient.silentRefresh();
      if (cancelled) return;
      if (token) {
        try {
          const { user } = await authApi.me();
          if (!cancelled) setUser(user);
        } catch {
          if (!cancelled) setUser(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return tokenStore.subscribe((token) => {
      if (!token) setUser(null);
    });
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const { user } = await authApi.login(identifier, password);
    setUser(user);
  }, []);

  const register = useCallback(
    async (input: { username: string; email: string; password: string; displayName?: string }) => {
      const { user } = await authApi.register(input);
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
