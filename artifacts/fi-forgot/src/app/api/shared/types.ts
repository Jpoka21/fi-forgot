import type { AppApiError } from "@/app/api/shared/errors";

export interface ApiRequestConfig extends Omit<RequestInit, "headers" | "body"> {
  headers?: HeadersInit;
  json?: unknown;
  body?: BodyInit | null;
  userId?: string;
  throwOnError?: boolean;
  retries?: number;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: AppApiError | null;
  response: Response;
}

export type LoadingHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
};
