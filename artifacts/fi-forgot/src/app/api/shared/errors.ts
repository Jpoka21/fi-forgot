export class AppApiError<T = unknown> extends Error {
  readonly name = "AppApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly response: Response;

  constructor(response: Response, data: T | null) {
    const detail =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message ?? "")
        : "";

    super(detail ? `HTTP ${response.status}: ${detail}` : `HTTP ${response.status} ${response.statusText}`);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
}

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError;
}

export function toAppApiError(error: unknown, fallbackMessage = "Request failed"): AppApiError {
  if (isAppApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const response = new Response(null, { status: 0, statusText: error.message });
    return new AppApiError(response, { message: error.message });
  }

  const response = new Response(null, { status: 0, statusText: fallbackMessage });
  return new AppApiError(response, { message: fallbackMessage });
}
