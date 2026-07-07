import { getApiHeaders } from "@/lib/data";
import { AppApiError } from "@/app/api/shared/errors";
import { normalizeJsonResponse } from "@/app/api/shared/normalize";
import type { ApiRequestConfig, ApiResult } from "@/app/api/shared/types";
import { withRetry } from "@/app/api/shared/retry";

export function buildRequestHeaders(options?: {
  headers?: HeadersInit;
  userId?: string;
}): Headers {
  const headers = new Headers(getApiHeaders() as HeadersInit);

  if (options?.userId) {
    headers.set("x-user-id", options.userId);
  }

  if (options?.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  config: ApiRequestConfig = {},
): Promise<ApiResult<T>> {
  const execute = async (): Promise<ApiResult<T>> => {
    const { json, userId, headers, throwOnError = false, body, ...init } = config;
    const mergedHeaders = buildRequestHeaders({ headers, userId });

    if (json !== undefined && !mergedHeaders.has("Content-Type")) {
      mergedHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(path, {
      ...init,
      headers: mergedHeaders,
      body: json !== undefined ? JSON.stringify(json) : body,
    });

    const data = await normalizeJsonResponse<T>(response);
    const error = response.ok ? null : new AppApiError(response, data);

    if (throwOnError && error) {
      throw error;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error,
      response,
    };
  };

  if (config.retries && config.retries > 0) {
    return withRetry(execute, config.retries);
  }

  return execute();
}

/** Re-export for app-layer consumers; canonical implementation remains in `@/lib/data`. */
export { getApiHeaders } from "@/lib/data";
