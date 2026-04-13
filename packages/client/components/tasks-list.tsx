"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listTasks } from "@/api";
import DateSeparator from "@/components/date-separator";
import TaskCard from "@/components/task-card";
import type { ListTaskDto } from "@tasks-estimate/shared";
import { JSX } from "react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
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
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }: { pageParam?: number }) =>
      listTasks(pageParam, DEFAULT_LIMIT),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.items.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: REFRESH_INTERVAL_MS,
  });

  type ListTasksResponse = {
    items: ListTaskDto[];
    total: number;
    offset: number;
    limit: number;
  };

  const pages = (query.data?.pages as ListTasksResponse[] | undefined) ?? [];
  const items = pages.flatMap((p) => p.items ?? []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="space-y-2 overflow-auto flex-1 pr-2">
        {(() => {
          const nodes: JSX.Element[] = [];
          let lastDateKey: string | null = null;

          for (let i = 0; i < items.length; i++) {
            const task: ListTaskDto = items[i];
            const rawIdForKey = task._id ?? "";
            const idStrKey =
              typeof rawIdForKey === "string"
                ? rawIdForKey
                : String((rawIdForKey as any)._id ?? String(rawIdForKey));

            let dateKey = "";
            let displayLabel = "";
            if (task.lastEntryStartDateTime) {
              const iso = String(task.lastEntryStartDateTime);
              const [isoDate] = iso.split("T");
              if (isoDate) {
                dateKey = isoDate;
                displayLabel = new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(iso));
              }
            }

            if (dateKey && dateKey !== lastDateKey) {
              nodes.push(
                <DateSeparator
                  key={`sep-${dateKey}-${i}`}
                  label={displayLabel || dateKey}
                />,
              );
              lastDateKey = dateKey;
            }

            nodes.push(
              <TaskCard key={`task-${idStrKey}-${i}`} task={task} />,
            );
          }

          return nodes;
        })()}
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
