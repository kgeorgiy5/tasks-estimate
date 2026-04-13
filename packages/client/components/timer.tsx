"use client"

import { JSX, useEffect, useState } from "react";
import { useCurrentEntryStore } from "@/stores";
import { formatHHMMSS } from "@tasks-estimate/shared";

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
