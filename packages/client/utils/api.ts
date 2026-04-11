import axios, {
  AxiosInstance,
  AxiosError,
  HttpStatusCode,
  AxiosHeaders,
} from "axios";
import { ErrorResponse } from "@/types";

import { ApiError } from "@/types/api";
import { jwtPayloadSchema } from "@tasks-estimate/shared";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const ACCESS_TOKEN_STORAGE_KEY = "tasks-estimate-access-token";

const BASE64_DASH_RE = /-/g;
const BASE64_UNDERSCORE_RE = /_/g;

/**
 * Decode a Base64URL-encoded string to UTF-8.
 * @param input base64url string
 */
export function base64UrlDecode(input: string): string {
  let base64 = input
    .replaceAll(BASE64_DASH_RE, "+")
    .replaceAll(BASE64_UNDERSCORE_RE, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Parse and validate a JWT payload using shared DTO schema.
 * Returns the parsed payload or undefined on failure.
 * @param token full JWT string
 */
export function parseJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return undefined;
    const decoded = base64UrlDecode(parts[1]);
    const parsed = JSON.parse(decoded);
    return jwtPayloadSchema.parse(parsed);
  } catch {
    return undefined;
  }
}

/**
 * Stores an access token in browser local storage.
 * @param token JWT access token
 */
export function setStoredAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

/**
 * Gets access token from browser local storage.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (!token || token.length === 0) return null;
  return token;
}

/**
 * Clears access token from browser local storage.
 */
export function clearStoredAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

/**
 * Create an axios instance preconfigured with base URL and JSON headers.
 * Request interceptor attaches stored access token when available.
 * Response interceptor normalizes errors into `ApiError`.
 * @param baseUrl optional base URL override
 */
export function createApiClient(baseUrl?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl ?? BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      try {
        const token = getStoredAccessToken();
        if (token) {
          const headers = new AxiosHeaders(config.headers);
          headers.set("Authorization", `Bearer ${token}`);
          config.headers = headers;
        }
      } catch {
        return config;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status =
        error.response?.status ?? HttpStatusCode.InternalServerError;
      const data = error.response?.data;
      const message =
        (typeof data === "string" && data) ||
        (data && (data as Record<string, unknown>)["message"]) ||
        error.message ||
        "Request failed";
      let formattedMessage: string | string[];
      if (typeof message === "string") {
        formattedMessage = message;
      } else if (Array.isArray(message)) {
        formattedMessage = message;
      } else {
        formattedMessage = String(message);
      }

      const errorDto: ApiError = {
        statusCode: status,
        message: formattedMessage,
        error: (error.response as ErrorResponse)?.statusText ?? "Error",
      };
      return Promise.reject(errorDto);
    },
  );

  return instance;
}

/**
 * Default client using NEXT_PUBLIC_API_URL if present.
 */
export const apiClient = createApiClient();
