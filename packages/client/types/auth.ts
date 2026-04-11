import type { Session } from "next-auth";

export type AuthUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
};

export type AuthHookResult = {
  session: Session | null | undefined;
  status: "loading" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  accessToken: string | null;
  signIn: (...args: unknown[]) => Promise<unknown>;
  signOut: (options?: Record<string, unknown>) => Promise<unknown>;
};