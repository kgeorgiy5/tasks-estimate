import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { authResponseSchema } from "@tasks-estimate/shared";
import { createApiClient, parseJwtPayload } from "@/utils/api";

const API_URL = process.env.API_URL ?? "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "";
const AUTH_SIGNIN = "/users/auth/sign-in";

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const backendClient = createApiClient(API_URL);

        try {
          const response = await backendClient.post<{ access_token: string }>(AUTH_SIGNIN, {
            email: credentials.email,
            password: credentials.password,
          });

          const parsed = authResponseSchema.parse(response.data);
          const payload = parseJwtPayload(parsed.access_token);
          if (!payload) return null;

          return { accessToken: parsed.access_token, email: payload.email, sub: payload.sub };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.email = user.email;
        token.sub = user.sub;
      }
      return token;
    },
    async session({ session, token }: { session: unknown; token: unknown }) {
      // Narrow `token` safely (unknown -> record) and check types before assigning
      const tokenRecord = typeof token === "object" && token !== null ? (token as Record<string, unknown>) : undefined;

      // assign accessToken if present and a string
      const accessToken = tokenRecord && typeof tokenRecord["accessToken"] === "string" ? (tokenRecord["accessToken"] as string) : undefined;
      if (accessToken) {
        (session as Record<string, unknown>)["accessToken"] = accessToken;
      }

      // ensure session.user exists as an object
      const sessionRecord = typeof session === "object" && session !== null ? (session as Record<string, unknown>) : {};
      sessionRecord["user"] = sessionRecord["user"] ?? {};

      // assign email and id safely
      if (tokenRecord && typeof tokenRecord["email"] === "string") {
        (sessionRecord["user"] as Record<string, unknown>)["email"] = tokenRecord["email"];
      }

      if (tokenRecord && typeof tokenRecord["sub"] === "string") {
        (sessionRecord["user"] as Record<string, unknown>)["id"] = tokenRecord["sub"];
      }

      return sessionRecord as unknown;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };