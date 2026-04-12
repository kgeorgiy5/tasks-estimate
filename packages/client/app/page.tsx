"use client"

import { useState, useEffect } from "react";
import { Timer } from "@/components/timer";
import PlayButton from "@/components/play-button";
import TasksList from "@/components/tasks-list";
import { useCurrentEntryStore } from "@/stores";
import useCurrentEntryQuery from "@/hooks/use-current-entry-query";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const email = useAuthStore((s) => s.email);
  const [title, setTitle] = useState("");
  const currentEntry = useCurrentEntryStore((s) => s.entry);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentEntryQuery = useCurrentEntryQuery({ enabled: isAuthenticated });

  useEffect(() => {
    if (!currentEntry) {
      setTitle("");
      return;
    }

    const task = currentEntry.taskId as any;
    const titleFromEntry =
      task && typeof task === "object" && typeof task.title === "string"
        ? task.title
        : (currentEntry as any).taskTitle ?? "";

    setTitle(titleFromEntry);
  }, [currentEntry]);

  const handleStarted = () => setTitle("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full flex items-center gap-2">
          <input
            aria-label="Task title"
            className="w-full rounded-md border px-3 py-2"
            placeholder="New task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!!currentEntry}
          />
          <div className="ml-2">
            <Timer />
          </div>
          <div className="ml-2 flex items-center">
            {currentEntryQuery.isLoading ? (
              <span className="text-sm text-zinc-600">Loading…</span>
            ) : null}
            <PlayButton title={title} onStarted={handleStarted} />
          </div>
        </div>

        <div className="w-full">
          {email ? (
            <p className="mb-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Signed in as: {email}
            </p>
          ) : null}

          <TasksList />
        </div>
      </main>
    </div>
  );
}
