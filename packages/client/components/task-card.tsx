"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEntryStore } from "@/stores";
import { startTaskEntry } from "@/api";
import TaskPlayButton from "@/components/task-play-button";
import type { ListTaskDto } from "@tasks-estimate/shared";
import { ProjectIcon } from "./project-icon";
import { formatHHMMSS } from "@tasks-estimate/shared";

type TaskCardProps = {
  task: ListTaskDto;
};

/**
 * `TaskCard` — renders a task row with title, project info, categories and controls.
 */
export const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentEntry = useCurrentEntryStore((s) => s.entry);

  const rawId = task._id ?? "";
  const taskId = typeof rawId === "string" ? rawId : String(rawId);

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
    <div className="w-full flex items-center justify-between rounded border px-3 py-2 min-w-0">
      <div className="flex flex-row gap-2 items-center min-w-0">
        {(task.entriesCount ?? 0) > 1 ? (
          <div className="text-sm text-zinc-500">{task.entriesCount}</div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div
            className="font-medium"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5 truncate flex items-center gap-2">
            <ProjectIcon
              icon={task.projectIcon}
              color={task.projectColor ?? undefined}
              className="h-5 w-5"
              iconClassName="h-3 w-3"
            />
            <span className="truncate">{task.projectTitle ?? "No project"}</span>
          </div>

          {(task.categories && task.categories.length > 0) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2 py-1 text-xs"
                >
                  <span>{cat}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-4 shrink-0 flex items-center gap-3">
        <div className="w-20 text-left text-sm text-zinc-600">
          {formatHHMMSS(task.timeSeconds ?? 0)}
        </div>

        <TaskPlayButton
          onClick={handleStart}
          loading={loading}
          disabled={!!currentEntry}
          ariaLabel={
            currentEntry ? "Another entry is running" : `Start ${task.title}`
          }
          variant="ghost"
        />
      </div>
    </div>
  );
};
