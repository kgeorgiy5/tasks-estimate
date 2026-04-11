"use client";

import { SessionProvider } from "next-auth/react";
import type { JSX, ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

/**
 * Provides NextAuth session context to client components.
 */
export function AuthSessionProvider({
  children,
}: Readonly<AuthSessionProviderProps>): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
