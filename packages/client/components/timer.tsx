"use client"

import { useEffect, useState } from "react";
import { useCurrentEntryStore } from "@/stores";

function formatHHMMSS(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function Timer(): JSX.Element {
  const entry = useCurrentEntryStore((s) => s.entry);
  const [seconds, setSeconds] = useState<number>(() => {
    const startDate = entry?.startDateTime;
    if (!startDate) return 0;
    const start = new Date(startDate).getTime();
    const end = entry?.endDateTime ? new Date(entry.endDateTime).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 1000));
  });

  useEffect(() => {
    // Recompute immediately when entry changes
    const startDate = entry?.startDateTime;
    if (!startDate) {
      setSeconds(0);
      return;
    }

    const start = new Date(startDate).getTime();
    if (entry.endDateTime) {
      const end = new Date(entry.endDateTime).getTime();
      setSeconds(Math.max(0, Math.floor((end - start) / 1000)));
      return;
    }

    // running timer
    setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    const id = globalThis.setInterval(() => {
      setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(id);
  }, [entry]);

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-mono text-sm">{formatHHMMSS(seconds)}</span>
    </div>
  );
}
