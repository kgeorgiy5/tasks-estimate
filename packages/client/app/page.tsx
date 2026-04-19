"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentEntryStore } from "@/stores";
import useCurrentEntryQuery from "@/hooks/use-current-entry-query";
import { useAuthStore } from "@/stores/auth-store";
import { TasksList } from "@components/index";
import { Header } from "@/app/components/header";

export default function Home() {
  const _email = useAuthStore((s) => s.email);
  const [title, setTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const currentEntry = useCurrentEntryStore((s) => s.entry);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentEntryQuery = useCurrentEntryQuery({ enabled: isAuthenticated });

  useEffect(() => {
    if (!currentEntry) return;

    const task = currentEntry.taskId as any;
    const titleFromEntry =
      task && typeof task === "object" && typeof task.title === "string"
        ? task.title
        : ((currentEntry as any).taskTitle ?? "");

    setTitle(titleFromEntry);
    const rawProject = task?.projectId ?? (currentEntry as any).projectId;
    let projectIdFromEntry: string | undefined = undefined;
    if (rawProject) {
      if (typeof rawProject === "string") projectIdFromEntry = rawProject;
      else if (rawProject._id) projectIdFromEntry = String(rawProject._id);
      else projectIdFromEntry = String(rawProject);
    }

    if (projectIdFromEntry) {
      setSelectedProjectId(projectIdFromEntry);
    }
  }, [currentEntry]);

  const prevEntryRef = useRef<typeof currentEntry | null>(currentEntry ?? null);
  useEffect(() => {
    const prev = prevEntryRef.current;
    // NOTE: if there was an active entry and now there's none, clear inputs
    if (prev && !currentEntry) {
      setTitle("");
      setSelectedProjectId(undefined);
      setSelectedCategories([]);
    }
    prevEntryRef.current = currentEntry ?? null;
  }, [currentEntry, setSelectedCategories]);

  const handleStarted = () => {};

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-full w-full grid grid-rows-10 max-w-[80vw] py-8 px-16 bg-white dark:bg-black sm:items-start">
        <div className="row-span-2">
          <Header
            title={title}
            setTitle={setTitle}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            currentEntry={currentEntry}
            currentEntryQuery={currentEntryQuery}
            onStarted={handleStarted}
          />
        </div>

        <div className="row-span-8 w-full h-full">
          <TasksList />
        </div>
      </main>
    </div>
  );
}
