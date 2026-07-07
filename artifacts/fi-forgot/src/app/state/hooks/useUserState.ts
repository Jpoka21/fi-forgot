import { useMemo } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import type { UserState } from "@/app/state/types";

export function useUserState(): UserState {
  const { user, isLoggedIn } = useAuth();

  return useMemo(
    () => ({
      user,
      isAuthenticated: isLoggedIn,
    }),
    [isLoggedIn, user],
  );
}
