"use client"

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getCurrentEntry } from "@/api/tasks";
import { useCurrentEntryStore } from "@/stores";
import { CURRENT_ENTRY_REFETCH_INTERVAL_MS } from "@/config/refetch-interval";

type Options = {
  enabled?: boolean;
};

/**
 * Fetches the current running entry using react-query and mirrors the result
 * into the `useCurrentEntryStore` so existing components can read from the store.
 */
export function useCurrentEntryQuery(options?: Options) {
  const query = useQuery({
    queryKey: ["current-entry"],
    queryFn: () => getCurrentEntry(),
    enabled: options?.enabled ?? true,
    refetchInterval: CURRENT_ENTRY_REFETCH_INTERVAL_MS,
  });

  useEffect(() => {
    if (query.isSuccess) {
      useCurrentEntryStore.setState({ entry: query.data ?? null });
    }

    if (query.isError) {
      useCurrentEntryStore.setState({ entry: null });
    }
  }, [query.data, query.isSuccess, query.isError]);

  return query;
}

export default useCurrentEntryQuery;
