import { create } from "zustand";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  parseJwtPayload,
  setStoredAccessToken,
} from "@/utils/api";

type AuthStore = {
  accessToken: string | null;
  email: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initializeFromStorage: () => void;
  setFromToken: (accessToken: string) => void;
  clearAuth: () => void;
};

/**
 * Global auth store with token and parsed user claims.
 */
export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  email: null,
  userId: null,
  isAuthenticated: false,
  isInitialized: false,
  initializeFromStorage: () => {
    const token = getStoredAccessToken();

    if (!token) {
      set({
        accessToken: null,
        email: null,
        userId: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      return;
    }

    const payload = parseJwtPayload(token);

    if (!payload) {
      clearStoredAccessToken();
      set({
        accessToken: null,
        email: null,
        userId: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      return;
    }

    set({
      accessToken: token,
      email: payload.email,
      userId: payload.sub,
      isAuthenticated: true,
      isInitialized: true,
    });
  },
  setFromToken: (accessToken: string) => {
    setStoredAccessToken(accessToken);

    const payload = parseJwtPayload(accessToken);

    if (!payload) {
      clearStoredAccessToken();
      set({
        accessToken: null,
        email: null,
        userId: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      return;
    }

    set({
      accessToken,
      email: payload.email,
      userId: payload.sub,
      isAuthenticated: true,
      isInitialized: true,
    });
  },
  clearAuth: () => {
    clearStoredAccessToken();
    set({
      accessToken: null,
      email: null,
      userId: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));
