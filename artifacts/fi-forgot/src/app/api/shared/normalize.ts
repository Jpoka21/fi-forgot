export async function normalizeJsonResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function normalizeResponseData<T>(data: unknown): T | null {
  if (data === null || data === undefined) {
    return null;
  }

  return data as T;
}
