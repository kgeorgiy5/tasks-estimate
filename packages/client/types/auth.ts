export type AuthUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
};

export type AuthSession = {
  user: AuthUser | null;
  accessToken: string | null;
};

export type AuthHookResult = {
  session: AuthSession | null | undefined;
  status: "loading" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  accessToken: string | null;
  signIn: (...args: unknown[]) => Promise<unknown>;
  signOut: (options?: Record<string, unknown>) => Promise<unknown>;
};