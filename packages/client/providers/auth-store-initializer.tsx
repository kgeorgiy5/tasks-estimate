"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useAuthStore } from "@/stores";
import useCurrentEntryQuery from "@/hooks/use-current-entry-query";

/**
 * Initializes auth store from browser storage when the app starts.
 */
export function AuthStoreInitializer(): JSX.Element {
  useEffect(() => {
    useAuthStore.getState().initializeFromStorage();

    // After initializing auth from storage, trigger a refresh of the current
    // running entry and start polling if authenticated.
    // react-query hook will handle ongoing refetching; initialize the
    // query enabled state by relying on the `isAuthenticated` selector below.
  }, []);

  // Keep the react-query current-entry fetch active when authenticated.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useCurrentEntryQuery({ enabled: isAuthenticated });

  return <></>;
}
