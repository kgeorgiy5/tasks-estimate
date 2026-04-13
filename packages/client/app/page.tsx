"use client"

import { useState, useEffect } from "react";
import { useCurrentEntryStore } from "@/stores";
import useCurrentEntryQuery from "@/hooks/use-current-entry-query";
import { useAuthStore } from "@/stores/auth-store";
import { PlayButton, ProjectSelector, TasksList, Timer } from "@components/index";

export default function Home() {
  const _email = useAuthStore((s) => s.email);
  const [title, setTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    undefined,
  );
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
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] grid grid-rows-5 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full row-span-1 h-full flex items-center gap-2">
          <div className="w-full flex flex-col gap-2">
            <input
              aria-label="Task title"
              className="w-full rounded-md border px-3 py-2"
              placeholder="New task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!!currentEntry}
            />
            <ProjectSelector
              value={selectedProjectId}
              onChange={setSelectedProjectId}
            />
          </div>
          <div className="ml-2 shrink-0">
            <Timer />
          </div>
          <div className="ml-2 flex shrink-0 items-center">
            {currentEntryQuery.isLoading ? (
              <span className="text-sm text-zinc-600">Loading…</span>
            ) : null}
            <PlayButton
              title={title}
              projectId={selectedProjectId}
              onStarted={handleStarted}
            />
          </div>
        </div>

        <div className="w-full row-span-4 h-full">
          <TasksList />
        </div>
      </main>
    </div>
  );
}
