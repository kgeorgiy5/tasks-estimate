import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { parseJwtPayload } from "@/utils/api";
import { serverSignIn } from "@/api/users/auth";

const API_URL = process.env.API_URL ?? "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "";

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const parsed = await serverSignIn(
            { email: credentials.email, password: credentials.password },
            API_URL,
          );

          const payload = parseJwtPayload(parsed.access_token);
          if (!payload) return null;

          return {
            id: payload.sub,
            accessToken: parsed.access_token,
            email: payload.email,
            sub: payload.sub,
          } as unknown as User;
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
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      const tokenRecord = token as Record<string, unknown> | undefined;

      if (tokenRecord && typeof tokenRecord["accessToken"] === "string") {
        (session as unknown as Record<string, unknown>)["accessToken"] =
          tokenRecord["accessToken"];
      }

      // ensure session.user exists
      if (!session.user) session.user = {} as unknown as Record<string, unknown>;

      if (tokenRecord && typeof tokenRecord["email"] === "string") {
        (session.user as unknown as Record<string, unknown>)["email"] =
          tokenRecord["email"];
      }

      if (tokenRecord && typeof tokenRecord["sub"] === "string") {
        (session.user as unknown as Record<string, unknown>)["id"] =
          tokenRecord["sub"];
      }

      return session;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
