import type { AxiosRequestConfig } from "axios";
import type { ErrorDto } from "@tasks-estimate/shared";

export type ErrorResponse = {
  statusText?: string;
};

export type ApiResponse<T> = T;

export type RequestOptions = AxiosRequestConfig;

/**
 * Use the shared ErrorDto shape for API errors.
 * Consumers should expect the server error to match `ErrorDto`.
 */
export type ApiError = ErrorDto;
