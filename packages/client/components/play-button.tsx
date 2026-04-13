"use client"

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEntryStore } from "@/stores";
import { createTask, endTaskEntry } from "@/api";

type PlayButtonProps = {
  title: string;
  onStarted?: () => void;
};

export function PlayButton({ title, onStarted }: PlayButtonProps) {
  const entry = useCurrentEntryStore((s) => s.entry);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!entry) {
        if (!title) return;
        await createTask({ title });
        // Refresh store with the newly created running entry and start polling
        await useCurrentEntryStore.getState().refresh();
        useCurrentEntryStore.getState().startPolling();
        onStarted?.();
      } else {
        // stop current running entry
        // `entry.taskId` may be populated as an object (task) — extract a string id
        const rawTaskId = (entry as any).taskId;
        const taskId =
          typeof rawTaskId === "string"
            ? rawTaskId
            : rawTaskId && (rawTaskId._id ?? rawTaskId.toString())
            ? String(rawTaskId._id ?? rawTaskId.toString())
            : "";

        if (taskId) {
          await endTaskEntry(taskId);
          // Invalidate tasks list so UI refreshes after ending an entry
          try {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          } catch {}
          // Clear the current entry from store and stop polling
          useCurrentEntryStore.setState({ entry: null });
          useCurrentEntryStore.getState().stopPolling();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isRunning = Boolean(entry);

  return (
    <button
      onClick={handleClick}
      disabled={loading || (!entry && !title)}
      aria-label={isRunning ? "Stop timer" : "Start timer"}
      className={`ml-2 rounded-full w-10 h-10 flex items-center justify-center text-white disabled:opacity-50 ${
        isRunning ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ) : isRunning ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="12" height="12" fill="currentColor" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

export default PlayButton;
