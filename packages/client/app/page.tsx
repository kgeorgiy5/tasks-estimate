"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Timer } from "@/components/timer";
import PlayButton from "@/components/play-button";
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

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
          {email ? (
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Signed in as: {email}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-39.5"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
