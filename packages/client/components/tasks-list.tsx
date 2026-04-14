"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listTasks } from "@/api";
import { DateSeparator } from "./date-separator";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import type { ListTaskDto } from "@tasks-estimate/shared";
import { FC, JSX } from "react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_LIMIT = 20;

/**
 * `TasksList` — renders the paginated list of user tasks grouped by date.
 */
export const TasksList: FC = () => {
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
    refetchOnMount: "always",
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

          function getDateInfo(task: ListTaskDto) {
            if (!task.lastEntryStartDateTime)
              return { dateKey: "", displayLabel: "" };
            const iso = String(task.lastEntryStartDateTime);
            const d = new Date(iso);
            if (Number.isNaN(d.getTime()))
              return { dateKey: "", displayLabel: "" };

            // dateKey in local date (YYYY-MM-DD) so grouping uses local days
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateKeyLocal = `${y}-${m}-${day}`;

            // display label using local timezone (no explicit timeZone option)
            const displayLabel = new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(d);

            return { dateKey: dateKeyLocal, displayLabel };
          }

          for (let i = 0; i < items.length; i++) {
            const task: ListTaskDto = items[i];
            const rawIdForKey = task._id ?? "";
            const idStrKey =
              typeof rawIdForKey === "string"
                ? rawIdForKey
                : String((rawIdForKey as any)._id ?? String(rawIdForKey));

            const { dateKey, displayLabel } = getDateInfo(task);

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
              <div key={`task-${idStrKey}-${i}`}>
                <TaskCard task={task} />
              </div>,
            );
          }

          if (query.isLoading) {
            nodes.push(
              <div key="loading" className="flex items-center justify-center">
                <span className="text-sm text-zinc-600">Loading…</span>
              </div>,
            );
          }

          if (query.hasNextPage) {
            nodes.push(
              <div key="load-more" className="flex items-center justify-center">
                <Button
                  variant="outline"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetching}
                >
                  {query.isFetching ? "Loading…" : "Load more"}
                </Button>
              </div>,
            );
          }

          return nodes;
        })()}
      </div>
    </div>
  );
};
