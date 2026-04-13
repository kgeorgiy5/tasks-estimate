"use client";

import type { ListTaskDto } from "@tasks-estimate/shared";

type TaskCardProps = {
  task: ListTaskDto;
};

function formatTimeSeconds(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Renders a task card showing title and aggregated time.
 */
export default function TaskCard({ task }: Readonly<TaskCardProps>) {
  return (
    <div className="flex items-center justify-between rounded border px-3 py-2">
      <div className="truncate">{task.title}</div>
      <div className="ml-4 text-sm text-zinc-600">
        {formatTimeSeconds(task.timeSeconds ?? 0)}
      </div>
    </div>
  );
}
