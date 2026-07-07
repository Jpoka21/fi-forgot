import type { LoadingHandlers } from "@/app/api/shared/types";

export async function runWithLoading<T>(
  task: () => Promise<T>,
  handlers: LoadingHandlers = {},
): Promise<T> {
  handlers.onStart?.();

  try {
    return await task();
  } finally {
    handlers.onEnd?.();
  }
}
