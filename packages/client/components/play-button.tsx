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

  const label = entry ? "Stop" : "Play";

  return (
    <button
      onClick={handleClick}
      disabled={loading || (!entry && !title)}
      className="ml-2 rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}

export default PlayButton;
