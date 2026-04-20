import { z } from "zod";

/**
 * Format seconds as HH:MM:SS with zero padding.
 * @param totalSeconds number of seconds
 */
export function formatHHMMSS(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(s)}`;
}
