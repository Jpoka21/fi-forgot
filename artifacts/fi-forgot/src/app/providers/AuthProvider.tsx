import type { ReactNode } from "react";
import { AuthProvider as LibAuthProvider } from "@/lib/auth-context";

/**
 * App-layer authentication provider.
 *
 * Delegates entirely to `@/lib/auth-context`. Session, login, signup, and API
 * behavior must not be changed here — only composed in the global provider stack.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <LibAuthProvider>{children}</LibAuthProvider>;
}

export { useAuth } from "@/lib/auth-context";
export type { OnboardingData, Workspace } from "@/lib/auth-context";
