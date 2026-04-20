"use client";

const LOADER_DEFAULTS = {
  message: "Loading...",
} as const;

type LoaderProps = {
  message?: string;
};

import { LoaderCircle } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FC } from "react";

export const Loader: FC<LoaderProps> = ({
  message = LOADER_DEFAULTS.message,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 p-4 rounded-md">
        <HugeiconsIcon icon={LoaderCircle} className="h-5 w-5 text-zinc-700 dark:text-zinc-300 animate-spin" strokeWidth={2} aria-hidden />
        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{message}</div>
      </div>
    </div>
  );
};
