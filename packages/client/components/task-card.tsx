"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEntryStore } from "@/stores";
import { startTaskEntry } from "@/api";
import TaskPlayButton from "@/components/task-play-button";
import type { ListTaskDto } from "@tasks-estimate/shared";
import { formatHHMMSS } from "@tasks-estimate/shared";

type TaskCardProps = {
  task: ListTaskDto;
};

export const TaskCard:FC<TaskCardProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentEntry = useCurrentEntryStore((s) => s.entry);

  const rawId = task._id ?? "";
  const taskId =
    typeof rawId === "string" ? rawId : String(rawId);

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
        <div className="w-20 text-left text-sm text-zinc-600">{formatHHMMSS(task.timeSeconds ?? 0)}</div>

        <TaskPlayButton
          onClick={handleStart}
          loading={loading}
          disabled={!!currentEntry}
          ariaLabel={currentEntry ? "Another entry is running" : `Start ${task.title}`}
          variant="ghost"
        />
      </div>
    </div>
  );
}
