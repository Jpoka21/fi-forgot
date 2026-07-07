import type { ReactNode } from "react";
import { QueryProvider } from "@/app/providers/QueryProvider";

/**
 * App-layer API provider.
 *
 * Composes the existing React Query foundation (`QueryProvider` + `createAppQueryClient`)
 * without changing client defaults. Service modules live in `@/app/api` and wrap existing
 * fetch calls — generated clients in `@workspace/api-client-react` remain unchanged.
 */
export function ApiProvider({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

export { createAppQueryClient } from "@/app/providers/createAppQueryClient";
export { useQueryClient } from "@tanstack/react-query";
