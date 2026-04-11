"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useAuthStore } from "@/stores";

/**
 * Initializes auth store from browser storage when the app starts.
 */
export function AuthStoreInitializer(): JSX.Element {
  useEffect(() => {
    useAuthStore.getState().initializeFromStorage();
  }, []);

  return <></>;
}
