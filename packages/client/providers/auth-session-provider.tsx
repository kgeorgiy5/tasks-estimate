"use client";

import type { JSX, ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

/**
 * Provides auth wrapper for client components.
 */
export function AuthSessionProvider({
  children,
}: Readonly<AuthSessionProviderProps>): JSX.Element {
  return <>{children}</>;
}
