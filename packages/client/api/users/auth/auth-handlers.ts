import { signIn as nextAuthSignIn, getSession } from "next-auth/react";
import { extractTokenFromSession } from "../../../utils/api";
import {
  SignInDto,
  SignUpDto,
  AuthResponseDto,
  authResponseSchema,
  signInSchema,
  signUpSchema,
} from "@tasks-estimate/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Sign in using NextAuth credentials provider.
 * Uses NextAuth client to perform credentials sign-in and returns the auth response
 * containing the `access_token` from the established NextAuth session.
 * @param payload SignInDto
 * @returns Promise<AuthResponseDto>
 */
export async function signIn(payload: SignInDto ): Promise<AuthResponseDto> {
  signInSchema.parse(payload);

  const result = await nextAuthSignIn("credentials", {
    redirect: false,
    email: payload.email,
    password: payload.password,
  } as Record<string, unknown>);

  if (result?.error) {
    throw new Error(result.error as string);
  }

  const session = await getSession();
  const accessToken = extractTokenFromSession(session);

  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("No access token available after sign in");
  }

  return authResponseSchema.parse({ access_token: accessToken });
}

/**
 * Sign up a new user via backend and establish a NextAuth session.
 * Calls the backend sign-up endpoint, then performs a NextAuth credentials sign-in
 * to create the client session. Returns an AuthResponseDto with the resulting token.
 * @param payload SignUpDto
 * @returns Promise<AuthResponseDto>
 */
export async function signUp(payload: SignUpDto): Promise<AuthResponseDto> {
  signUpSchema.parse(payload);

  const res = await fetch(`${API_BASE}/users/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Sign-up failed with status ${res.status}`);
  }

  const body = await res.json();
  const parsed = authResponseSchema.parse(body);

  await nextAuthSignIn("credentials", {
    redirect: false,
    email: payload.email,
    password: payload.password,
  } as Record<string, unknown>);

  const session = await getSession();
  const accessToken = extractTokenFromSession(session);

  if (typeof accessToken === "string" && accessToken.length > 0) {
    return authResponseSchema.parse({ access_token: accessToken });
  }

  return parsed;
}