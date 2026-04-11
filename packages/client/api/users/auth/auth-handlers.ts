import { createApiClient } from "../../../utils/api";
import { useAuthStore } from "../../../stores";
import {
  SignInDto,
  SignUpDto,
  AuthResponseDto,
  authResponseSchema,
  signInSchema,
  signUpSchema,
} from "@tasks-estimate/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const SERVER_AUTH_SIGNIN = "/users/auth/sign-in";
const SERVER_AUTH_SIGNUP = "/users/auth/sign-up";

/**
 * Sign in against backend using JSON HTTP request.
 * Stores returned access token in local storage for subsequent API calls.
 * @param payload SignInDto
 * @returns Promise<AuthResponseDto>
 */
export async function signIn(payload: SignInDto ): Promise<AuthResponseDto> {
  signInSchema.parse(payload);
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");

  const response = await client.post<{ access_token: string }>(
    SERVER_AUTH_SIGNIN,
    payload,
  );
  const parsed = authResponseSchema.parse(response.data);
  useAuthStore.getState().setFromToken(parsed.access_token);
  return parsed;
}

/**
 * Sign up a new user via backend and store returned access token.
 * @param payload SignUpDto
 * @returns Promise<AuthResponseDto>
 */
export async function signUp(payload: SignUpDto): Promise<AuthResponseDto> {
  signUpSchema.parse(payload);
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");

  const response = await client.post<{ access_token: string }>(
    SERVER_AUTH_SIGNUP,
    payload,
  );

  const parsed = authResponseSchema.parse(response.data);
  useAuthStore.getState().setFromToken(parsed.access_token);
  return parsed;
}