"use client";

const LOADER_DEFAULTS = {
  message: "Loading...",
} as const;

type LoaderProps = {
  message?: string;
};

import type { FC } from "react";

export const Loader: FC<LoaderProps> = ({
  message = LOADER_DEFAULTS.message,
}) => {
  return <div>{message}</div>;
};
