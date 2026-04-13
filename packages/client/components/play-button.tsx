"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEntryStore } from "@/stores";
import { createTask, endTaskEntry } from "@/api";
import { PlayButtonIcon } from "./play-button-icon";

type PlayButtonProps = {
  title: string;
  projectId?: string;
  onStarted?: () => void;
  variant?: "solid" | "ghost";
};

export const PlayButton: FC<PlayButtonProps> = ({
  title,
  projectId,
  onStarted,
  variant = "solid",
}) => {
  const entry = useCurrentEntryStore((s) => s.entry);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (entry) {
        const rawTaskId = (entry as any).taskId;
        let taskId = "";
        if (typeof rawTaskId === "string") {
          taskId = rawTaskId;
        } else if (rawTaskId && (rawTaskId._id ?? rawTaskId.toString())) {
          taskId = String(rawTaskId._id ?? rawTaskId.toString());
        }

        if (taskId) {
          await endTaskEntry(taskId);
          try {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          } catch {}
          useCurrentEntryStore.setState({ entry: null });
          useCurrentEntryStore.getState().stopPolling();
        }
      } else {
        if (!title) return;
        await createTask({ title, projectId });
        await useCurrentEntryStore.getState().refresh();
        useCurrentEntryStore.getState().startPolling();
        onStarted?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const isRunning = Boolean(entry);

  const baseClasses =
    "ml-2 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

  const solidClasses = isRunning
    ? "bg-red-600 text-white"
    : "bg-green-600 text-white";
  const ghostClasses = isRunning
    ? "bg-transparent text-red-600"
    : "bg-transparent text-green-600";

  const classes = `${baseClasses} ${variant === "solid" ? solidClasses : ghostClasses}`;

  return (
    <button
      onClick={handleClick}
      disabled={loading || (!entry && !title)}
      aria-label={isRunning ? "Stop timer" : "Start timer"}
      className={classes}
    >
      <PlayButtonIcon isRunning={isRunning} loading={loading} />
    </button>
  );
};