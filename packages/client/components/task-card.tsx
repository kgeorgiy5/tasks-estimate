"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEntryStore } from "@/stores";
import { startTaskEntry } from "@/api";
import type { ListTaskDto } from "@tasks-estimate/shared";

type TaskCardProps = {
  task: ListTaskDto;
};

function formatHHMMSS(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export default function TaskCard({ task }: Readonly<TaskCardProps>) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentEntry = useCurrentEntryStore((s) => s.entry);

  const rawId = task._id ?? "";
  const taskId =
    typeof rawId === "string" ? rawId : String((rawId as any)._id ?? String(rawId));

  const handleStart = async () => {
    if (loading || !!currentEntry) return;
    setLoading(true);
    try {
      if (!taskId) return;
      await startTaskEntry(taskId);
      try {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch {}
      await useCurrentEntryStore.getState().refresh();
      useCurrentEntryStore.getState().startPolling();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded border px-3 py-2">
      <div className="truncate">{task.title}</div>

      <div className="ml-4 flex items-center gap-3">
        <div className="text-sm text-zinc-600">{formatHHMMSS(task.timeSeconds ?? 0)}</div>

        <button
          onClick={handleStart}
          disabled={loading || !!currentEntry}
          aria-label={currentEntry ? "Another entry is running" : `Start ${task.title}`}
          className={`rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50 ${
            currentEntry ? "bg-transparent text-zinc-400" : "bg-transparent text-green-600"
          }`}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4v16l14-8L6 4z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
