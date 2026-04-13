"use client"

import { useInfiniteQuery } from "@tanstack/react-query";
import { listTasks } from "@/api";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_LIMIT = 20;

function formatTimeSeconds(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function TasksList() {
  const query = useInfiniteQuery({
    queryKey: ["tasks"],
    queryFn: ({ pageParam = 0 }) => listTasks(pageParam, DEFAULT_LIMIT),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.items.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: REFRESH_INTERVAL_MS,
  });

  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((p: any) => p.items ?? []);
  const total = pages[0]?.total ?? 0;

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="mb-2 text-lg font-semibold">Tasks</h2>

      <div className="space-y-2 overflow-auto flex-1 pr-2">
        {items.map((task: any) => (
          <div
            key={task._id}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            <div className="truncate">{task.title}</div>
            <div className="ml-4 text-sm text-zinc-600">
              {formatTimeSeconds(task.timeSeconds ?? 0)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center">
        {query.isLoading ? (
          <span className="text-sm text-zinc-600">Loading…</span>
        ) : null}

        {query.hasNextPage ? (
          <button
            onClick={() => query.fetchNextPage()}
            className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
            disabled={query.isFetching}
          >
            {query.isFetching ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
